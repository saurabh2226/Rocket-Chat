import ChatMessage from "../models/ChatMessage.js";
import logger from "../config/logger.js";

export const createMessage = async (req, res) => {
  const newMessage = new ChatMessage({
    chatRoomId: req.body.chatRoomId,
    sender: req.body.sender,
    message: req.body.message,
    messageType: req.body.messageType || "text",
    isGroupMessage: req.body.isGroupMessage || false,
  });

  try {
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    logger.error("Error creating message", { error: error.message });
    res.status(409).json({ message: error.message });
  }
};

// Cursor-based pagination for messages
export const getMessages = async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { cursor, limit: queryLimit } = req.query;
    const limit = Math.min(parseInt(queryLimit) || 50, 100);

    const query = { chatRoomId };

    // If cursor provided, get messages older than the cursor
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1); // Fetch one extra to check if there are more

    const hasMore = messages.length > limit;
    const results = hasMore ? messages.slice(0, limit) : messages;

    // Reverse to return in chronological order
    results.reverse();

    res.status(200).json({
      messages: results,
      hasMore,
      nextCursor: hasMore ? results[0].createdAt.toISOString() : null,
    });
  } catch (error) {
    logger.error("Error fetching messages", { error: error.message });
    res.status(409).json({ message: error.message });
  }
};
