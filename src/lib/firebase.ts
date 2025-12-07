import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCQNqO0n-F1C2B7S1TQY5SzOSAv7PHJ5NM",
  authDomain: "dissasterconnect.firebaseapp.com",
  projectId: "dissasterconnect",
  storageBucket: "dissasterconnect.firebasestorage.app",
  messagingSenderId: "797814906879",
  appId: "1:797814906879:web:164b1425eff15933b3d1ca",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Set persistence to LOCAL to persist across page refreshes and browser sessions
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error);
});

export {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
};
export type { User };
export default app;
