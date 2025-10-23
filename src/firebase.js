// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQNqO0n-F1C2B7S1TQY5SzOSAv7PHJ5NM",
  authDomain: "dissasterconnect.firebaseapp.com",
  projectId: "dissasterconnect",
  storageBucket: "dissasterconnect.firebasestorage.app",
  messagingSenderId: "797814906879",
  appId: "1:797814906879:web:164b1425eff15933b3d1ca",
  measurementId: "G-SPYY119PDQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;