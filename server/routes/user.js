import express from "express";
import {
    validateSetUsername,
} from "../middlewares/validators.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import { getAllUsers, getUser, setUsername } from "../controllers/user.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:userId", getUser);
router.post("/username", authLimiter, validateSetUsername, setUsername);

export default router;
