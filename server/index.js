import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { Server } from "socket.io";

// Load env vars BEFORE using them
dotenv.config();

import mongoConnection from "./config/mongo.js";
import ChatRoom from "./models/ChatRoom.js";
import logger from "./config/logger.js";
import { setupRedisAdapter, createRedisClient } from "./config/redis.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";

import { VerifyToken, VerifySocketToken } from "./middlewares/VerifyToken.js";
import chatRoomRoutes from "./routes/chatRoom.js";
import chatMessageRoutes from "./routes/chatMessage.js";
import userRoutes from "./routes/user.js";
import groupRoutes from "./routes/group.js";

const app = express();

// --- Security Middleware ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https:", "wss:"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Trust proxy for rate limiter behind Render's load balancer
app.set("trust proxy", 1);

// CORS configuration - supports multiple origins (comma-separated)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const allowedOrigins = FRONTEND_URL.split(",").map((url) => url.trim());

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    logger.warn("CORS blocked origin", { origin });
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));

// Global rate limiter
app.use(apiLimiter);

// --- Health Check (BEFORE auth middleware) ---
app.get("/health", async (req, res) => {
  const mongoStatus = mongoConnection.readyState === 1 ? "connected" : "disconnected";

  res.status(mongoStatus === "connected" ? 200 : 503).json({
    status: mongoStatus === "connected" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      mongodb: mongoStatus,
      redis: process.env.REDIS_URL ? "configured" : "not configured",
    },
  });
});

// --- Auth Middleware ---
app.use(VerifyToken);

const PORT = process.env.PORT || 8080;

// --- API Routes ---
app.use("/api/room", chatRoomRoutes);
app.use("/api/message", chatMessageRoutes);
app.use("/api/user", userRoutes);
app.use("/api/group", groupRoutes);

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  res.status(500).json({ error: "Internal server error" });
});

// --- Start Server ---
const server = app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`, {
    env: process.env.NODE_ENV || "development",
    port: PORT,
  });
});

// --- Socket.io Setup ---
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Setup Redis adapter for multi-instance (if REDIS_URL is set)
setupRedisAdapter(io);

// Redis client for shared state (online users)
const redisClient = createRedisClient();

io.use(VerifySocketToken);

// Online users management — uses Redis if available, falls back to in-memory Map
const onlineUsers = new Map();

const setUserOnline = async (userId, socketId) => {
  if (redisClient) {
    await redisClient.hset("online_users", userId, socketId);
  } else {
    onlineUsers.set(userId, socketId);
  }
};

const getUserSocket = async (userId) => {
  if (redisClient) {
    return await redisClient.hget("online_users", userId);
  }
  return onlineUsers.get(userId);
};

const removeUserBySocket = async (socketId) => {
  if (redisClient) {
    const allUsers = await redisClient.hgetall("online_users");
    for (const [userId, sid] of Object.entries(allUsers)) {
      if (sid === socketId) {
        await redisClient.hdel("online_users", userId);
        return userId;
      }
    }
  } else {
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socketId) {
        onlineUsers.delete(userId);
        return userId;
      }
    }
  }
  return null;
};

const getAllOnlineUsers = async () => {
  if (redisClient) {
    const allUsers = await redisClient.hgetall("online_users");
    return Object.entries(allUsers);
  }
  return Array.from(onlineUsers);
};

io.on("connection", (socket) => {
  const userId = socket.user?.uid || socket.handshake.auth?.uid;
  logger.info("Socket connected", { userId, socketId: socket.id });

  socket.on("addUser", async (userId) => {
    await setUserOnline(userId, socket.id);
    const users = await getAllOnlineUsers();
    socket.emit("getUsers", users);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, message, chatRoomId, isGroup }) => {
    if (isGroup && chatRoomId) {
      try {
        const room = await ChatRoom.findById(chatRoomId);
        if (room) {
          for (const memberId of room.members) {
            const memberSocket = await getUserSocket(memberId);
            if (memberSocket) {
              io.to(memberSocket).emit("getMessage", {
                senderId,
                message,
                chatRoomId,
                isGroup: true,
              });
            }
          }
        }
      } catch (error) {
        logger.error("Error broadcasting group message", { error: error.message });
      }
    } else {
      const sendUserSocket = await getUserSocket(receiverId);
      if (sendUserSocket) {
        io.to(sendUserSocket).emit("getMessage", {
          senderId,
          message,
          chatRoomId: chatRoomId || null,
        });
      }
    }
  });

  // Call handling
  socket.on("call-user", async ({ receiverId, offer, callType, callerName }) => {
    const receiverSocket = await getUserSocket(receiverId);
    const callerId = socket.user?.uid || socket.handshake.auth?.uid;
    if (receiverSocket && callerId) {
      io.to(receiverSocket).emit("incoming-call", {
        callerId,
        callerName: callerName || "User",
        offer,
        callType,
      });
    }
  });

  socket.on("accept-call", async ({ callerId, answer }) => {
    const callerSocket = await getUserSocket(callerId);
    if (callerSocket) {
      io.to(callerSocket).emit("call-accepted", { answer });
    }
  });

  socket.on("reject-call", async ({ callerId }) => {
    const callerSocket = await getUserSocket(callerId);
    if (callerSocket) {
      io.to(callerSocket).emit("call-rejected");
    }
  });

  socket.on("ice-candidate", async ({ candidate, to }) => {
    const toSocket = await getUserSocket(to);
    const fromId = socket.user?.uid || socket.handshake.auth?.uid;
    if (toSocket && fromId) {
      io.to(toSocket).emit("ice-candidate", { candidate, from: fromId });
    }
  });

  socket.on("end-call", async ({ to }) => {
    if (to) {
      const toSocket = await getUserSocket(to);
      if (toSocket) {
        io.to(toSocket).emit("call-ended");
      }
    }
  });

  socket.on("disconnect", async () => {
    const removedUser = await removeUserBySocket(socket.id);
    const users = await getAllOnlineUsers();
    socket.emit("getUsers", users);
    logger.info("Socket disconnected", { userId: removedUser, socketId: socket.id });
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    try {
      if (redisClient) await redisClient.quit();
      const mongoose = (await import("mongoose")).default;
      await mongoose.connection.close();
      logger.info("All connections closed");
    } catch (err) {
      logger.error("Error during shutdown", { error: err.message });
    }
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
