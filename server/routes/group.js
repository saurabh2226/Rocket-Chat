import express from "express";
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

router.post("/", createGroup);
router.get("/", getUserGroups);
router.get("/:groupId", getGroup);
router.put("/:groupId", updateGroup);
router.post("/:groupId/members", addMembers);
router.delete("/:groupId/members/:memberId", removeMember);
router.post("/:groupId/leave", leaveGroup);
router.delete("/:groupId", deleteGroup);
router.put("/:groupId/notifications", updateNotificationSettings);

export default router;
