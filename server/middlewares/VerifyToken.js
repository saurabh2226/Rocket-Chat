import auth from "../config/firebase-config.js";
import logger from "../config/logger.js";

export const VerifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodeValue = await auth.verifyIdToken(token);
    if (decodeValue) {
      req.user = decodeValue;
      return next();
    }
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  } catch (e) {
    logger.warn("Token verification failed", { error: e.message });
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export const VerifySocketToken = async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Unauthorized: No token provided"));
  }

  try {
    const decodeValue = await auth.verifyIdToken(token);

    if (decodeValue) {
      socket.user = decodeValue;
      return next();
    }
    return next(new Error("Unauthorized: Invalid token"));
  } catch (e) {
    logger.warn("Socket token verification failed", { error: e.message });
    return next(new Error("Unauthorized: Invalid token"));
  }
};
