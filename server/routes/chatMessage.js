import express from "express";
import {
    validateCreateMessage,
    validateGetMessages,
} from "../middlewares/validators.js";
import { messageLimiter } from "../middlewares/rateLimiter.js";
import { createMessage, getMessages } from "../controllers/chatMessage.js";

const router = express.Router();

router.post("/", messageLimiter, validateCreateMessage, createMessage);
router.get("/:chatRoomId", validateGetMessages, getMessages);

export default router;
