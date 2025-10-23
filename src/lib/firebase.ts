// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ⬇️ Replace with your actual Firebase config values from Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// 👇 These are the missing exports your auth.tsx needs
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
