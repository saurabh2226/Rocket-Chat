import winston from "winston";

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        process.env.NODE_ENV === "production"
            ? winston.format.json()
            : winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
                    let log = `${timestamp} [${level}]: ${message}`;
                    if (stack) log += `\n${stack}`;
                    if (Object.keys(meta).length) log += ` ${JSON.stringify(meta)}`;
                    return log;
                })
            )
    ),
    transports: [new winston.transports.Console()],
    defaultMeta: { service: "rocket-chat" },
});

export default logger;
