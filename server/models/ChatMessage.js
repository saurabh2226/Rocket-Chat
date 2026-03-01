import mongoose from "mongoose";

const ChatMessageSchema = mongoose.Schema(
  {
    chatRoomId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    isGroupMessage: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index for efficient message querying with pagination
ChatMessageSchema.index({ chatRoomId: 1, createdAt: -1 });

const ChatMessage = mongoose.model("ChatMessage", ChatMessageSchema);

export default ChatMessage;
