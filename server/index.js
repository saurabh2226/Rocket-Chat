import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import "./config/mongo.js";

import { VerifyToken, VerifySocketToken } from "./middlewares/VerifyToken.js";
import chatRoomRoutes from "./routes/chatRoom.js";
import chatMessageRoutes from "./routes/chatMessage.js";
import userRoutes from "./routes/user.js";
import groupRoutes from "./routes/group.js";

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(VerifyToken);

const PORT = process.env.PORT || 8080;

app.use("/api/room", chatRoomRoutes);
app.use("/api/message", chatMessageRoutes);
app.use("/api/user", userRoutes);
app.use("/api/group", groupRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

io.use(VerifySocketToken);

global.onlineUsers = new Map();

const getKey = (map, val) => {
  for (let [key, value] of map.entries()) {
    if (value === val) return key;
  }
};

io.on("connection", (socket) => {
  global.chatSocket = socket;
  // Store user ID from socket auth
  const userId = socket.user?.uid || socket.handshake.auth?.uid;
  
  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.emit("getUsers", Array.from(onlineUsers));
  });

  socket.on("sendMessage", ({ senderId, receiverId, message, chatRoomId, isGroup }) => {
    if (isGroup && chatRoomId) {
      // Broadcast to all group members
      const ChatRoom = require("./models/ChatRoom.js").default;
      ChatRoom.findById(chatRoomId).then((room) => {
        if (room) {
          room.members.forEach((memberId) => {
            const memberSocket = onlineUsers.get(memberId);
            if (memberSocket) {
              io.to(memberSocket).emit("getMessage", {
                senderId,
                message,
                chatRoomId,
                isGroup: true,
              });
            }
          });
        }
      }).catch((error) => {
        console.error("Error broadcasting group message:", error);
      });
    } else {
      // Direct message
      const sendUserSocket = onlineUsers.get(receiverId);
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
  socket.on("call-user", ({ receiverId, offer, callType, callerName }) => {
    const receiverSocket = onlineUsers.get(receiverId);
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

  socket.on("accept-call", ({ callerId, answer }) => {
    const callerSocket = onlineUsers.get(callerId);
    if (callerSocket) {
      io.to(callerSocket).emit("call-accepted", { answer });
    }
  });

  socket.on("reject-call", ({ callerId }) => {
    const callerSocket = onlineUsers.get(callerId);
    if (callerSocket) {
      io.to(callerSocket).emit("call-rejected");
    }
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    const toSocket = onlineUsers.get(to);
    const fromId = socket.user?.uid || socket.handshake.auth?.uid;
    if (toSocket && fromId) {
      io.to(toSocket).emit("ice-candidate", { candidate, from: fromId });
    }
  });

  socket.on("end-call", ({ to }) => {
    if (to) {
      const toSocket = onlineUsers.get(to);
      if (toSocket) {
        io.to(toSocket).emit("call-ended");
      }
    }
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(getKey(onlineUsers, socket.id));
    socket.emit("getUsers", Array.from(onlineUsers));
  });
});
