import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCtJ8kXYJ9_STRry-8ZGdJd4EEGn2swXlo",
  authDomain: "rocket-chat-602bf.firebaseapp.com",
  projectId: "rocket-chat-602bf",
  storageBucket: "rocket-chat-602bf.firebasestorage.app",
  messagingSenderId: "749351312273",
  appId: "1:749351312273:web:b2e6ba825f94df48d65830",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export default auth;
