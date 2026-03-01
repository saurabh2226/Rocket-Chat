import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  logger.error("MONGO_URI environment variable is not set");
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: parseInt(process.env.MONGO_POOL_SIZE) || 10,
});

mongoose.connection.on("connected", () => {
  logger.info("MongoDB connected successfully");
});
mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected");
});
mongoose.connection.on("error", (error) => {
  logger.error("MongoDB connection error", { error: error.message });
  mongoose.disconnect();
});
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected");
});

export default mongoose.connection;
