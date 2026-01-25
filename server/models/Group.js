import mongoose from "mongoose";

const GroupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    admin: {
      type: String,
      required: true,
    },
    members: [{
      userId: String,
      role: {
        type: String,
        enum: ["admin", "member"],
        default: "member",
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    }],
    avatar: {
      type: String,
      default: "",
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    settings: {
      notifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", GroupSchema);

export default Group;
