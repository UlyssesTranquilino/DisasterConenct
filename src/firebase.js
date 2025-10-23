// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from "firebase/auth";

// Your web app's Firebase configuration
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

// ✅ Initialize Auth (for login)
export const auth = getAuth(app);

// ✅ Initialize Google Provider
export const provider = new GoogleAuthProvider();

// ✅ Export useful auth functions
export { signInWithPopup, signOut, onAuthStateChanged };

// ✅ Initialize Analytics safely (only if browser supports it)
isSupported().then((yes) => {
  if (yes) {
    getAnalytics(app);
  }
});
