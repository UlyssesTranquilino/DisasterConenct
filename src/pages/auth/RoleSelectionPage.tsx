import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { UserRole } from "../../lib/auth";

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  // Get user info from location state (passed from Google auth)
  const userInfo = location.state?.userInfo;

  const handleContinue = () => {
    if (!selectedRole) {
      alert("Please select a role to continue");
      return;
    }

    // Navigate to the main register page with role and userInfo
    navigate("/register", { state: { selectedRole, userInfo } });
  };

  const roles: { value: UserRole; title: string; description: string }[] = [
    {
      value: "Citizen",
      title: "Citizen",
      description: "Receive alerts and access emergency resources during disasters",
    },
    {
      value: "Volunteer",
      title: "Volunteer",
      description: "Help communities by responding to emergency deployment requests",
    },
    {
      value: "Organization",
      title: "Organization",
      description: "Coordinate disaster response efforts and manage resources",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <img
            src="src/assets/image-removebg-preview (1).png"
            alt="DisasterConnect Logo"
            className="w-32 h-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Welcome to DisasterConnect
          </h1>
          <p className="text-gray-600">
            Please select how you'd like to register
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelectedRole(role.value)}
              className={`w-full p-6 rounded-lg border-2 text-left transition-all duration-200
                ${
                  selectedRole === role.value
                    ? "bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-400"
                    : "bg-white border-gray-300 hover:border-blue-400 hover:shadow"
                }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${
                      selectedRole === role.value
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedRole === role.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-blue-900">
                    {role.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {role.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          className="w-full bg-blue-900 hover:bg-blue-950 text-white py-3 font-semibold"
          disabled={!selectedRole}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
