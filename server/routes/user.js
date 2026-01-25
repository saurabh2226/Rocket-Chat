import express from "express";

import { getAllUsers, getUser, setUsername } from "../controllers/user.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:userId", getUser);
router.post("/username", setUsername);

export default router;
