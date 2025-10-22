import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from "../../lib/auth";

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
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
          <br></br>
          <br></br>
          <br></br>
          <Button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-950 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
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