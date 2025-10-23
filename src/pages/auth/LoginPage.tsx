import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../lib/auth";

export default function LoginPage() {
  const { login, loginWithGoogle, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      // Error is handled by the auth context
      console.error("Login failed:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  return (
 <div className="min-h-screen flex">
    {/* Left half with logo image */}
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-white">
  <img
    src="src/assets/image-removebg-preview (1).png"
    alt="DisasterConnect Logo"
    className="-mt-40 w-[500px] h-auto object-contain drop-shadow-lg"
  />
  <h2 className="-mt-20 text-xl text-blue-900 font-semibold text-center max-w-md">
    "Stay connected with your community in times of crisis"
  </h2>
  
</div>

    {/* Right half */}
    <div className="flex-1 flex flex-col items-center justify-center relative space-y-6">
      {/* Title above */}
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


      {/* Glassy container */}
      <div className="bg-blue-100/30 backdrop-blur-md border border-blue-100/50 shadow-lg rounded-2xl p-8 w-full max-w-md mx-auto min-h-[420px]">
        <h1 className="block text-3xl font-bold text-blue-900 text-center">Login</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-950 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-blue-200/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-blue-100/30 px-2 text-blue-900/70">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
        </form>

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