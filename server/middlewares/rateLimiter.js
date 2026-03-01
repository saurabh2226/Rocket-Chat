import rateLimit from "express-rate-limit";

// General API rate limit: 100 requests per minute per IP
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
});

// Stricter limit for auth-related endpoints: 20 per minute
export const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many auth requests, please try again later." },
});

// Message sending: 30 per minute per IP
export const messageLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many messages, please slow down." },
});
