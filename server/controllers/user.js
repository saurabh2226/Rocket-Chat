import auth from "../config/firebase-config.js";
import logger from "../config/logger.js";

export const getAllUsers = async (req, res) => {
  const maxResults = 1000;
  let users = [];

  try {
    const userRecords = await auth.listUsers(maxResults);

    userRecords.users.forEach((user) => {
      const { uid, email, displayName, photoURL, customClaims } = user;
      const username = customClaims?.username || null;
      users.push({ uid, email, displayName, photoURL, username });
    });
    res.status(200).json(users);
  } catch (error) {
    logger.error("Error fetching users", { error: error.message });
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUser = async (req, res) => {
  try {
    const userRecord = await auth.getUser(req.params.userId);

    const { uid, email, displayName, photoURL, customClaims } = userRecord;
    const username = customClaims?.username || null;

    res.status(200).json({ uid, email, displayName, photoURL, username });
  } catch (error) {
    logger.error("Error fetching user", { error: error.message, userId: req.params.userId });
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

export const setUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.uid;

    // Check if username is already taken
    const allUsers = await auth.listUsers(1000);
    for (const user of allUsers.users) {
      if (user.customClaims?.username?.toLowerCase() === username.toLowerCase() && user.uid !== userId) {
        return res.status(409).json({ error: "Username already exists" });
      }
    }

    // Set custom claim with username
    await auth.setCustomUserClaims(userId, {
      username: username.toLowerCase(),
    });

    res.status(200).json({
      message: "Username set successfully",
      username: username.toLowerCase(),
    });
  } catch (error) {
    logger.error("Error setting username", { error: error.message });
    res.status(500).json({ error: "Failed to set username" });
  }
};
