import { createClient } from "ioredis";
import { createAdapter } from "@socket.io/redis-adapter";
import logger from "./logger.js";

/**
 * Sets up Redis adapter for Socket.io if REDIS_URL is configured.
 * This enables multi-instance deployments where messages are broadcast
 * across all server instances via Redis pub/sub.
 *
 * If REDIS_URL is not set, falls back to in-memory (single instance).
 */
export const setupRedisAdapter = async (io) => {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
        logger.info("REDIS_URL not set — using in-memory adapter (single instance only)");
        return null;
    }

    try {
        const pubClient = new createClient(redisUrl, {
            retryStrategy: (times) => Math.min(times * 50, 2000),
        });
        const subClient = pubClient.duplicate();

        pubClient.on("error", (err) => logger.error("Redis pub client error", { error: err.message }));
        subClient.on("error", (err) => logger.error("Redis sub client error", { error: err.message }));

        io.adapter(createAdapter(pubClient, subClient));
        logger.info("Socket.io Redis adapter connected — multi-instance mode enabled");

        return { pubClient, subClient };
    } catch (error) {
        logger.error("Failed to connect Redis adapter, falling back to in-memory", { error: error.message });
        return null;
    }
};

/**
 * Creates a Redis client for shared state (online users, caching).
 * Returns null if REDIS_URL is not configured.
 */
export const createRedisClient = () => {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
        return null;
    }

    const client = new createClient(redisUrl, {
        retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    client.on("error", (err) => logger.error("Redis client error", { error: err.message }));
    client.on("connect", () => logger.info("Redis client connected"));

    return client;
};
