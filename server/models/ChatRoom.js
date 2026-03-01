import mongoose from "mongoose";

const ChatRoomSchema = mongoose.Schema(
  {
    members: {
      type: [String],
      index: true,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for finding rooms by member
ChatRoomSchema.index({ members: 1 });
// Index for finding group chat rooms
ChatRoomSchema.index({ groupId: 1 });

const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);

export default ChatRoom;
