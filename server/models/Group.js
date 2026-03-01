import mongoose from "mongoose";

const GroupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      maxlength: 500,
    },
    admin: {
      type: String,
      required: true,
      index: true,
    },
    members: [{
      userId: {
        type: String,
        required: true,
      },
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

// Index for finding groups by member
GroupSchema.index({ "members.userId": 1 });

const Group = mongoose.model("Group", GroupSchema);

export default Group;
