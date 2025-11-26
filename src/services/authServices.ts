import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  Auth,
} from "firebase/auth";
import { auth } from "../lib/firebase"; // Make sure you have firebase initialized

export const checkAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

export const loginWithEmail = async (
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      error:
        error.message || "Failed to sign in. Please check your credentials.",
    };
  }
};

export const initSessionTracking = (
  auth: Auth,
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};
