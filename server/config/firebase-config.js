import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serviceAccountKey;

// Check if Firebase credentials are provided via environment variable (production)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log("Using Firebase credentials from environment variable");
  } catch (error) {
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT:", error);
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT JSON");
  }
} else {
  // Use local file for development
  try {
    const keyPath = join(__dirname, "serviceAccountKey.json");
    serviceAccountKey = JSON.parse(readFileSync(keyPath, "utf8"));
    console.log("Using Firebase credentials from serviceAccountKey.json file");
  } catch (error) {
    console.error("Error reading serviceAccountKey.json:", error);
    throw new Error("Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT env var or add serviceAccountKey.json file");
  }
}

const app = initializeApp({
  credential: cert(serviceAccountKey),
});

const auth = getAuth(app);
export default auth;
