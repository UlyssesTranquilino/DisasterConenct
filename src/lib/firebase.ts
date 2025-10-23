// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQNqO0n-F1C2B7S1TQY5SzOSAv7PHJ5NM",
  authDomain: "dissasterconnect.firebaseapp.com",
  projectId: "dissasterconnect",
  storageBucket: "dissasterconnect.firebasestorage.app",
  messagingSenderId: "797814906879",
  appId: "1:797814906879:web:164b1425eff15933b3d1ca"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
