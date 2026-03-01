import Group from "../models/Group.js";
import ChatRoom from "../models/ChatRoom.js";
import logger from "../config/logger.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, description, members, avatar, isPrivate } = req.body;
    const adminId = req.user.uid;

    // Create group members array with admin
    const groupMembers = [
      {
        userId: adminId,
        role: "admin",
        joinedAt: new Date(),
      },
      ...(members || []).map((memberId) => ({
        userId: memberId,
        role: "member",
        joinedAt: new Date(),
      })),
    ];

    // Create the group
    const group = new Group({
      name: name.trim(),
      description: description || "",
      admin: adminId,
      members: groupMembers,
      avatar: avatar || "",
      isPrivate: isPrivate || false,
    });

    await group.save();

    // Create a chat room for the group
    const chatRoom = new ChatRoom({
      members: groupMembers.map((m) => m.userId),
      isGroup: true,
      groupId: group._id,
    });

    await chatRoom.save();

    const populatedGroup = await Group.findById(group._id);

    res.status(201).json({
      group: populatedGroup,
      chatRoom: chatRoom,
    });
  } catch (error) {
    logger.error("Error creating group", { error: error.message });
    res.status(500).json({ error: "Failed to create group" });
  }
};

// Get all groups for a user
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.uid;

    const groups = await Group.find({
      "members.userId": userId,
    }).sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    logger.error("Error fetching user groups", { error: error.message });
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// Get a specific group
export const getGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uid;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is a member
    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.status(200).json(group);
  } catch (error) {
    logger.error("Error fetching group", { error: error.message });
    res.status(500).json({ error: "Failed to fetch group" });
  }
};

// Update group (admin only)
export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uid;
    const { name, description, avatar, isPrivate } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.admin !== userId) {
      return res.status(403).json({ error: "Only admin can update group" });
    }

    if (name) group.name = name.trim();
    if (description !== undefined) group.description = description;
    if (avatar !== undefined) group.avatar = avatar;
    if (isPrivate !== undefined) group.isPrivate = isPrivate;

    await group.save();

    res.status(200).json(group);
  } catch (error) {
    logger.error("Error updating group", { error: error.message });
    res.status(500).json({ error: "Failed to update group" });
  }
};

// Add members to group
export const addMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uid;
    const { memberIds } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.admin !== userId) {
      return res.status(403).json({ error: "Only admin can add members" });
    }

    const existingMemberIds = group.members.map((m) => m.userId);
    const newMembers = memberIds
      .filter((id) => !existingMemberIds.includes(id))
      .map((memberId) => ({
        userId: memberId,
        role: "member",
        joinedAt: new Date(),
      }));

    group.members.push(...newMembers);

    // Update chat room members
    const chatRoom = await ChatRoom.findOne({ groupId: group._id });
    if (chatRoom) {
      chatRoom.members = group.members.map((m) => m.userId);
      await chatRoom.save();
    }

    await group.save();

    res.status(200).json(group);
  } catch (error) {
    logger.error("Error adding members", { error: error.message });
    res.status(500).json({ error: "Failed to add members" });
  }
};

// Remove member from group
export const removeMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const userId = req.user.uid;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.admin !== userId && memberId !== userId) {
      return res.status(403).json({ error: "Permission denied" });
    }

    if (group.admin === memberId) {
      return res.status(400).json({ error: "Cannot remove group admin" });
    }

    group.members = group.members.filter((m) => m.userId !== memberId);

    const chatRoom = await ChatRoom.findOne({ groupId: group._id });
    if (chatRoom) {
      chatRoom.members = group.members.map((m) => m.userId);
      await chatRoom.save();
    }

    await group.save();

    res.status(200).json(group);
  } catch (error) {
    logger.error("Error removing member", { error: error.message });
    res.status(500).json({ error: "Failed to remove member" });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uid;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.admin === userId) {
      return res.status(400).json({ error: "Admin cannot leave group. Transfer admin or delete group." });
    }

    group.members = group.members.filter((m) => m.userId !== userId);

    const chatRoom = await ChatRoom.findOne({ groupId: group._id });
    if (chatRoom) {
      chatRoom.members = group.members.map((m) => m.userId);
      await chatRoom.save();
    }

    await group.save();

    res.status(200).json({ message: "Left group successfully" });
  } catch (error) {
    logger.error("Error leaving group", { error: error.message });
    res.status(500).json({ error: "Failed to leave group" });
  }
};

// Delete group (admin only)
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uid;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.admin !== userId) {
      return res.status(403).json({ error: "Only admin can delete group" });
    }

    await ChatRoom.deleteOne({ groupId: group._id });
    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    logger.error("Error deleting group", { error: error.message });
    res.status(500).json({ error: "Failed to delete group" });
  }
};

// Update notification settings
export const updateNotificationSettings = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.uid;
    const { notifications } = req.body;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const member = group.members.find((m) => m.userId === userId);
    if (!member) {
      return res.status(403).json({ error: "Not a member of this group" });
    }

    if (notifications !== undefined) {
      const memberIndex = group.members.findIndex((m) => m.userId === userId);
      if (memberIndex !== -1) {
        group.members[memberIndex].notifications = notifications;
      }
    }

    await group.save();

    res.status(200).json(group);
  } catch (error) {
    logger.error("Error updating notification settings", { error: error.message });
    res.status(500).json({ error: "Failed to update notification settings" });
  }
};
