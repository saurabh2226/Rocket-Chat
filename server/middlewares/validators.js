import { body, param, query, validationResult } from "express-validator";

// Middleware to check validation results
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: "Validation failed",
            details: errors.array().map((e) => ({
                field: e.path,
                message: e.msg,
            })),
        });
    }
    next();
};

// --- Message Validators ---
export const validateCreateMessage = [
    body("chatRoomId")
        .notEmpty().withMessage("chatRoomId is required")
        .isString().withMessage("chatRoomId must be a string")
        .trim()
        .escape(),
    body("sender")
        .notEmpty().withMessage("sender is required")
        .isString().withMessage("sender must be a string")
        .trim()
        .escape(),
    body("message")
        .notEmpty().withMessage("message is required")
        .isString().withMessage("message must be a string")
        .isLength({ max: 5000 }).withMessage("message must be under 5000 characters")
        .trim(),
    body("messageType")
        .optional()
        .isIn(["text", "image", "file", "system"]).withMessage("Invalid message type"),
    body("isGroupMessage")
        .optional()
        .isBoolean().withMessage("isGroupMessage must be boolean"),
    validate,
];

export const validateGetMessages = [
    param("chatRoomId")
        .notEmpty().withMessage("chatRoomId is required")
        .isString().withMessage("chatRoomId must be a string")
        .trim(),
    query("cursor")
        .optional()
        .isString().withMessage("cursor must be a string"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage("limit must be 1-100"),
    validate,
];

// --- Chat Room Validators ---
export const validateCreateRoom = [
    body("senderId")
        .notEmpty().withMessage("senderId is required")
        .isString().withMessage("senderId must be a string")
        .trim()
        .escape(),
    body("receiverId")
        .notEmpty().withMessage("receiverId is required")
        .isString().withMessage("receiverId must be a string")
        .trim()
        .escape(),
    validate,
];

export const validateUserIdParam = [
    param("userId")
        .notEmpty().withMessage("userId is required")
        .isString().withMessage("userId must be a string")
        .trim(),
    validate,
];

export const validateTwoUserParams = [
    param("firstUserId")
        .notEmpty().withMessage("firstUserId is required")
        .isString().withMessage("firstUserId must be a string")
        .trim(),
    param("secondUserId")
        .notEmpty().withMessage("secondUserId is required")
        .isString().withMessage("secondUserId must be a string")
        .trim(),
    validate,
];

// --- User Validators ---
export const validateSetUsername = [
    body("username")
        .notEmpty().withMessage("Username is required")
        .isString().withMessage("Username must be a string")
        .trim()
        .matches(/^[a-zA-Z0-9_]{3,20}$/).withMessage("Username must be 3-20 chars, alphanumeric and underscores only"),
    validate,
];

// --- Group Validators ---
export const validateCreateGroup = [
    body("name")
        .notEmpty().withMessage("Group name is required")
        .isString().withMessage("Group name must be a string")
        .isLength({ min: 1, max: 100 }).withMessage("Group name must be 1-100 characters")
        .trim(),
    body("description")
        .optional()
        .isString().withMessage("Description must be a string")
        .isLength({ max: 500 }).withMessage("Description must be under 500 characters")
        .trim(),
    body("members")
        .optional()
        .isArray().withMessage("Members must be an array"),
    body("isPrivate")
        .optional()
        .isBoolean().withMessage("isPrivate must be boolean"),
    validate,
];

export const validateGroupIdParam = [
    param("groupId")
        .notEmpty().withMessage("groupId is required")
        .isMongoId().withMessage("groupId must be a valid ID"),
    validate,
];

export const validateAddMembers = [
    param("groupId")
        .notEmpty().withMessage("groupId is required")
        .isMongoId().withMessage("groupId must be a valid ID"),
    body("memberIds")
        .notEmpty().withMessage("memberIds is required")
        .isArray({ min: 1 }).withMessage("memberIds must be a non-empty array"),
    validate,
];

export const validateRemoveMember = [
    param("groupId")
        .notEmpty().withMessage("groupId is required")
        .isMongoId().withMessage("groupId must be a valid ID"),
    param("memberId")
        .notEmpty().withMessage("memberId is required")
        .isString().withMessage("memberId must be a string")
        .trim(),
    validate,
];

export const validateUpdateNotifications = [
    param("groupId")
        .notEmpty().withMessage("groupId is required")
        .isMongoId().withMessage("groupId must be a valid ID"),
    body("notifications")
        .notEmpty().withMessage("notifications is required")
        .isBoolean().withMessage("notifications must be boolean"),
    validate,
];
