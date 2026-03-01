import express from "express";
import {
  validateCreateRoom,
  validateUserIdParam,
  validateTwoUserParams,
} from "../middlewares/validators.js";
import {
  createChatRoom,
  getChatRoomOfUser,
  getChatRoomOfUsers,
} from "../controllers/chatRoom.js";

const router = express.Router();

router.post("/", validateCreateRoom, createChatRoom);
router.get("/:userId", validateUserIdParam, getChatRoomOfUser);
router.get("/:firstUserId/:secondUserId", validateTwoUserParams, getChatRoomOfUsers);

export default router;
