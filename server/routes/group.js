import express from "express";
import {
  validateCreateGroup,
  validateGroupIdParam,
  validateAddMembers,
  validateRemoveMember,
  validateUpdateNotifications,
} from "../middlewares/validators.js";
import {
  createGroup,
  getUserGroups,
  getGroup,
  updateGroup,
  addMembers,
  removeMember,
  leaveGroup,
  deleteGroup,
  updateNotificationSettings,
} from "../controllers/group.js";

const router = express.Router();

router.post("/", validateCreateGroup, createGroup);
router.get("/", getUserGroups);
router.get("/:groupId", validateGroupIdParam, getGroup);
router.put("/:groupId", validateGroupIdParam, updateGroup);
router.post("/:groupId/members", validateAddMembers, addMembers);
router.delete("/:groupId/members/:memberId", validateRemoveMember, removeMember);
router.post("/:groupId/leave", validateGroupIdParam, leaveGroup);
router.delete("/:groupId", validateGroupIdParam, deleteGroup);
router.put("/:groupId/notifications", validateUpdateNotifications, updateNotificationSettings);

export default router;
