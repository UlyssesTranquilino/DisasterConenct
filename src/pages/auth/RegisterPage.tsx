import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth, type UserRole } from "../../lib/auth";

export default function RegisterPage() {
  const { register, isLoading, error } = useAuth();
  const [role, setRole] = useState<UserRole>("Citizen");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setSuccessMessage("");
      await register(email, password, name, role);
      setSuccessMessage("Registration successful! Redirecting to login...");
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  const roles: UserRole[] = ["Citizen", "Volunteer", "Organization"];

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE (1/3) */}
      {/* LEFT SIDE (1/3) */}
<div className="flex-[1] flex flex-col items-center justify-center relative overflow-hidden">
  <div className="relative text-center space-y-4 p-6 z-10">
    {/* Logo */}
    <img
      src="src/assets/image-removebg-preview (1).png"
      alt="DisasterConnect Logo"
      className="relative w-[400px] h-auto object-contain drop-shadow-lg mx-auto z-10"
    />

    {/* Tagline */}
    <h2 className="relative text-xl text-blue-300 font-semibold max-w-xs mx-auto z-10">
      Join DisasterConnect and help build a safer, connected community.
    </h2>
  </div>

  {/* Decorative Circle (behind logo/text but above background) */}
  <div className="absolute inset-0 flex items-center justify-center z-0">
    <div className="translate-y-[-70px] w-[125px] h-[125px] bg-blue-100 border border-blue-200 rounded-full"></div>
  </div>
</div>

      {/* RIGHT SIDE (2/3) */}
      <div className="flex-[2] flex items-center justify-center p-10 bg-gradient-to-br from-blue-200 to-white">
        <div className="bg-blue-100/30 backdrop-blur-md border border-blue-100/50 shadow-lg rounded-2xl p-8 w-full max-w-lg">
          <h1 className="text-3xl font-bold text-blue-900 mb-6">
            Create your account
          </h1>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Error & Success */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                {successMessage}
              </div>
            )}

            {/* NAME */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-blue-900 font-medium">
                Name
              </Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-900 font-medium">
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

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-blue-900 font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-blue-900 font-medium"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* ROLE SELECTION BOXES */}
            <div className="space-y-2">
              <Label className="text-blue-900 font-medium">Select Role</Label>
              <div className="flex gap-3">
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex-1 py-3 rounded-lg font-semibold border transition-all duration-200
                      ${
                        role === r
                          ? "bg-white border-blue-500 shadow-lg text-blue-900 ring-2 ring-blue-400"
                          : "bg-white/80 border-blue-200 text-gray-600 hover:border-blue-400"
                      }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-950 text-white mt-6"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </form>

          {/* FOOTER */}
          <div className="mt-6 text-sm text-blue-800 text-center">
            Already have an account?{" "}
            <Link to="/login" className="underline hover:text-blue-950">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
