import ChatRoom from "../models/ChatRoom.js";
import logger from "../config/logger.js";

export const createChatRoom = async (req, res) => {
  const newChatRoom = new ChatRoom({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    await newChatRoom.save();
    res.status(201).json(newChatRoom);
  } catch (error) {
    logger.error("Error creating chat room", { error: error.message });
    res.status(409).json({ message: error.message });
  }
};

export const getChatRoomOfUser = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(chatRoom);
  } catch (error) {
    logger.error("Error fetching rooms for user", { error: error.message });
    res.status(404).json({ message: error.message });
  }
};

export const getChatRoomOfUsers = async (req, res) => {
  try {
    const chatRoom = await ChatRoom.find({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(chatRoom);
  } catch (error) {
    logger.error("Error fetching room for users", { error: error.message });
    res.status(404).json({ message: error.message });
  }
};
