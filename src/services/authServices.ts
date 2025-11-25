// src/services/authService.ts
import {
  auth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut,
} from "../lib/firebase";

// Set session expiration to 30 days (in milliseconds)
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

// Store the last activity timestamp
const LAST_ACTIVITY_KEY = "lastActivityTime";

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateLastActivity();
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    return { success: false, error: "Failed to sign out" };
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const checkAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      // Check if session is still valid
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (lastActivity) {
        const lastActivityTime = parseInt(lastActivity, 10);
        const currentTime = Date.now();

        if (currentTime - lastActivityTime > SESSION_DURATION) {
          // Session expired, sign out
          signOut();
          return callback(null);
        }
      }
      updateLastActivity();
    }
    callback(user);
  });
};

export const updateLastActivity = () => {
  localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
};

// Initialize session tracking
export const initSessionTracking = () => {
  // Update last activity on user interaction
  const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
  events.forEach((event) => {
    document.addEventListener(event, updateLastActivity, false);
  });

  // Check session on load
  checkAuthState((user) => {
    if (user) {
      updateLastActivity();
    }
  });
};
