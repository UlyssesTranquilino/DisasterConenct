import { googleLogout } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";

export const useGoogleLogin = () => {
  const { googleLogin } = useAuth();

  const handleGoogleLogin = async (response: any, role: string = "citizen") => {
    try {
      const idToken = response.credential;
      if (!idToken) {
        throw new Error("No ID token received from Google");
      }

      // You can extract additional profile info if needed
      const profileData = {
        name: response.profile?.name || "",
        email: response.profile?.email || "",
        picture: response.profile?.picture || "",
      };

      return await googleLogin(idToken, role, profileData);
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  const handleGoogleFailure = (error: any) => {
    console.error("Google login failed:", error);
    throw error;
  };

  const handleLogout = () => {
    googleLogout();
  };

  return {
    handleGoogleLogin,
    handleGoogleFailure,
    handleLogout,
  };
};
