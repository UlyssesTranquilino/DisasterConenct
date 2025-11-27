import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth, type UserRole } from "../../lib/auth";

export default function LoginPage() {
  const { login, loginWithGoogle, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [formError, setFormError] = useState("");
  const [roleError, setRoleError] = useState("");

  /**
   * STUB: Fetch roles for the currently authenticated user.
   * -----------------------------
   * Database/backend developer should replace this with a real implementation.
   *
   * Examples:
   * - Firestore: fetch doc `users/{uid}` and return doc.data().roles
   * - Backend API: call `/api/user/roles` and return response.roles
   * - If auth exposes currentUser: use `auth.currentUser.uid` to look up the user record
   *
   * Must return an array of strings like: ["civilian", "volunteer"]
   */
  async function fetchRolesForCurrentUser(): Promise<string[]> {
    // ---------- TEMP: placeholder ----------
    // Keep this as-is for now: returns an empty array so the role-check flow runs,
    // and the UI shows the "no account found" error until DB dev plugs in real data.
    return [];
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setRoleError("");

    // Basic validation
    if (!email || !password) {
      setFormError("Please fill in all required fields");
      return;
    }

    if (!role) {
      setRoleError("Please select your role");
      return;
    }

    try {
      // Perform login
      await login(email, password);

      // The login function will handle redirection based on user role
      // No need for additional navigation here as it's handled in the auth context
    } catch (error) {
      console.error("Login error:", error);
      // Error is already set by the auth context
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Navigation is handled by loginWithGoogle in auth context (same as before)
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Homepage link */}
      <div className="absolute top-6 right-6 group z-50">
        <Link to="/">
          <div>
            <img
              src="/assets/home (2).png"
              alt="Homepage"
              className="w-6 h-6 object-contain filter brightness-[200%]"
            />
            <span className="absolute bottom-[-35px] left-1/2 -translate-x-1/2 text-sm bg-gray-800 text-white px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Homepage
            </span>
          </div>
        </Link>
      </div>

      {/* Left half with logo image */}
      <div className="flex-3 flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-white">
        <img
          src="/assets/DisasterConnectLogo.png"
          alt="DisasterConnect Logo"
          className="-mt-40 w-[250px] h-auto object-contain drop-shadow-lg"
        />
        <h2 className="-mt-50 text-xl text-blue-900 font-semibold text-center max-w-sm px-6">
          "Stay connected with your community in times of crisis"
        </h2>
      </div>

      {/* Right half */}
      <div className="flex-1 flex flex-col items-center justify-center relative space-y-6">
        <div className="w-full max-w-md">
          <h1 className="text-left">
            <span className="block text-2xl font-semibold text-blue-400">
              Welcome to
            </span>
            <span className="block text-4xl font-bold text-blue-200">
              DisasterConnect!
            </span>
          </h1>
        </div>

        <div className="bg-blue-100/30 backdrop-blur-md border border-blue-100/50 shadow-lg rounded-2xl p-8 w-full max-w-md mx-auto min-h-[420px]">
          <h1 className="block text-3xl font-bold text-blue-900 text-center">
            Login
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Auth error from useAuth */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Role error (from DB role validation) */}
            {roleError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {roleError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="!bg-black !border-black !text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-900">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="!bg-black !border-black !text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {/* Role selection - styled to match inputs */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-blue-900">
                Select Role
              </Label>

              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="!bg-black !border-black !text-white w-full p-2 rounded-lg"
              >
                <option value="" disabled className="text-gray-400">
                  Choose your role
                </option>
                <option value="citizen">Citizen</option>
                <option value="volunteer">Volunteer</option>
                <option value="organization">Organization</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-950 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <hr className="flex-grow border-blue-300" />
            <span className="px-2 text-sm text-blue-600">OR</span>
            <hr className="flex-grow border-blue-300" />
          </div>

          {/* Google Button */}
          <Button
            onClick={handleGoogleLogin}
            className="w-full !bg-black text-white border border-gray-300 hover:bg-gray-100 flex items-center justify-center gap-2 w-[200px]"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </Button>

          <p className="text-center text-sm text-blue-100/70 mt-4">
            No account?{" "}
            <Link to="/register" className="text-blue-100 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
