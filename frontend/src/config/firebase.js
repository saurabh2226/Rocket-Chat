import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCtJ8kXYJ9_STRry-8ZGdJd4EEGn2swXlo",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "rocket-chat-602bf.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "rocket-chat-602bf",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "rocket-chat-602bf.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "749351312273",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:749351312273:web:b2e6ba825f94df48d65830",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export default auth;
