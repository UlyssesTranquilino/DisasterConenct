import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth, type UserRole } from "../../lib/auth";

export default function RegisterPage() {
	const location = useLocation();
	const { register, completeGoogleProfile, isLoading, error } = useAuth();

	// Check if coming from Google auth flow (from location state or sessionStorage)
	const googleUserInfo =
		location.state?.userInfo ||
		(typeof window !== "undefined"
			? JSON.parse(sessionStorage.getItem("googleUserInfo") || "null")
			: null);
	const preSelectedRole = location.state?.selectedRole;

	const [role, setRole] = useState<UserRole>(
		(preSelectedRole?.toLowerCase() as UserRole) || "citizen"
	);
	const [name, setName] = useState(googleUserInfo?.name || "");
	const [email, setEmail] = useState(googleUserInfo?.email || "");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	// Pre-fill email and name for Google users
	useEffect(() => {
		if (googleUserInfo) {
			setName(googleUserInfo.name || "");
			setEmail(googleUserInfo.email || "");
		}
	}, [googleUserInfo]);

	// Citizen-specific fields
	const [userLocation, setUserLocation] = useState("");
	const [agreeTerms, setAgreeTerms] = useState(false);

	// Volunteer-specific fields
	const [skills, setSkills] = useState("");
	const [availability, setAvailability] = useState("");
	const [volProof, setVolProof] = useState<File | null>(null);

	// Organization-specific fields
	const [orgName, setOrgName] = useState("");
	const [orgType, setOrgType] = useState("");
	const [orgContact, setOrgContact] = useState("");
	const [orgProof, setOrgProof] = useState<File | null>(null);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Skip password validation for Google users
		if (!googleUserInfo) {
			if (password !== confirmPassword) {
				alert("Passwords do not match");
				return;
			}
		}

		if (role === "citizen" && !agreeTerms) {
			alert("You must agree to the Terms of Service and Privacy Policy.");
			return;
		}

		try {
			setSuccessMessage("");

			// Prepare profile data based on role
			let profileData = {};

			if (role === "citizen") {
				profileData = {
					location: userLocation,
				};
			} else if (role === "volunteer") {
				profileData = {
					skills,
					availability,
					// Note: File upload would need separate handling
				};
			} else if (role === "organization") {
				// ✅ FIX: Map frontend state variables (orgName, etc.) to the required JSON keys (name, type, contactInformation)
				profileData = {
					name: orgName,             // Maps orgName state to JSON key 'name'
					type: orgType,             // Maps orgType state to JSON key 'type'
					contactInformation: orgContact, // Maps orgContact state to JSON key 'contactInformation'
					proofOfLegitimacy: orgProof ? orgProof.name : undefined, // Example of how to include file name
				};
			}

			// Use completeGoogleProfile for Google users, register for regular users
			if (googleUserInfo) {
				await completeGoogleProfile(googleUserInfo, role, profileData);
				// Clear sessionStorage after successful registration
				sessionStorage.removeItem("googleUserInfo");
			} else {
				// Send the mapped profileData
				await register(email, password, name, role, profileData);
				setSuccessMessage("Registration successful! Redirecting to login...");
			}
		} catch (error) {
			console.error("Registration failed:", error);
		}
	};

	const roles: UserRole[] = ["citizen", "volunteer", "organization"];

	return (
		<div className="min-h-screen flex overflow-hidden">
			{/* 🏠 HOMEPAGE LOGO BUTTON */}
			<div className="absolute top-6 right-6 group z-50">
				<Link to="/">
					<div
						className="w-[75px] h-[75px] bg-white rounded-full flex items-center justify-center 
							hover:scale-105 transition-all duration-300 relative cursor-pointer"
					>
						<img
							src="/assets/home (1).png"
							alt="Homepage"
							className="w-6 h-6 object-contain filter brightness-[200%]"
						/>
						<span
							className="absolute bottom-[-35px] left-1/2 -translate-x-1/2 text-sm bg-gray-800 text-white px-3 py-1 
								rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
						>
							Homepage
						</span>
					</div>
				</Link>
			</div>
			{/* LEFT SIDE */}
			<div className="w-1/3 text-white flex flex-col items-center justify-center px-8 py-10 fixed left-0 top-0 bottom-0">
				<div className="text-center space-y-4">
					<img
						src="/assets/DisasterConnectLogo.png"
						alt="DisasterConnect Logo"
						className="w-40 h-auto mx-auto"
					/>
					<h1 className="text-2xl font-bold">DisasterConnect</h1>
					<p className="text-blue-100">
						Join the network to connect, mobilize, and save lives in times of
						crisis.
					</p>
					<p className="text-sm mt-6">
						Already registered?{" "}
						<Link
							to="/login"
							className="underline font-semibold text-white hover:text-blue-200"
						>
							Sign in here.
						</Link>
					</p>
				</div>
			</div>
			{/* RIGHT SIDE */}
			<div className="ml-[33.333%] w-2/3 flex flex-col justify-center px-20 py-12 bg-white overflow-y-auto h-screen">
				<div className="flex flex-col justify-start px-20 py-12 bg-white min-h-screen">
					<h1 className="text-3xl font-bold text-blue-900 mb-2">
						Create Your Account
					</h1>
					<p className="text-gray-600 mb-8">
						Tell us who you are so we can connect you effectively.
					</p>

					<form onSubmit={onSubmit} className="space-y-8">
						{/* ROLE SELECTION */}
						<div>
							<Label className="text-blue-900 font-semibold mb-2 block">
								I am registering as:
							</Label>
							<div className="flex gap-4 mt-3">
								{roles.map((r) => (
									<button
										key={r}
										type="button"
										onClick={() => setRole(r)}
										className={`flex-1 py-4 rounded-lg border text-center font-semibold transition-all duration-200
											${
												role === r
													? "bg-blue-50 border-blue-500 text-black shadow-md ring-1 ring-blue-400"
													: "bg-black border-gray-300 text-blue-100 hover:border-blue-400"
											}`}
									>
										{r}
									</button>
								))}
							</div>
						</div>

						{/* INPUT FIELDS */}
						<div className="grid grid-cols-2 gap-6">
							<div>
								<Label htmlFor="name" className="text-blue-900 font-medium">
									Full Name
								</Label>
								<Input
									id="name"
									placeholder="Your name"
									className="!bg-black !border-black !text-white"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</div>

							<div>
								<Label htmlFor="email" className="text-blue-900 font-medium">
									Email Address
								</Label>
								<Input
									id="email"
									type="email"
									placeholder="you@example.com"
									className="!bg-black !border-black !text-white"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									readOnly={!!googleUserInfo}
									disabled={!!googleUserInfo}
								/>
							</div>

							{!googleUserInfo && (
								<>
									<div>
										<Label
											htmlFor="password"
											className="text-blue-900 font-medium"
										>
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
											minLength={6}
										/>
									</div>

									<div>
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
											className="!bg-black !border-black !text-white"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											required
										/>
									</div>
								</>
							)}
						</div>

						{/* CIVILIAN FORM */}
						{role === "citizen" && (
							<>
								<hr className="my-8 border-gray-300" />
								<h2 className="text-xl font-semibold text-blue-900 mb-4">
									Civilian Profile
								</h2>

								<div>
									<Label
										htmlFor="location"
										className="text-blue-900 font-medium mb-1 block"
									>
										Current/Primary Location (City, State/Region)
									</Label>
									<Input
										id="location"
										placeholder="e.g., Sta. Cruz, Naga City"
										className="!bg-black !border-black !text-white w-[415.11px]"
										value={userLocation}
										onChange={(e) => setUserLocation(e.target.value)}
										required
									/>
									<p className="text-gray-500 text-sm mt-1">
										This helps us provide relevant local alerts and resources.
									</p>
								</div>

								<div className="flex items-center mt-6 space-x-2 bg-white">
									<input
										type="checkbox"
										id="agreeTerms"
										checked={agreeTerms}
										onChange={(e) => setAgreeTerms(e.target.checked)}
										className="w-4 h-4"
									/>
									<Label htmlFor="agreeTerms" className="text-gray-700 text-sm">
										I agree to the{" "}
										<a href="#" className="text-blue-600 underline">
											Terms of Service
										</a>{" "}
										and{" "}
										<a href="#" className="text-blue-600 underline">
											Privacy Policy
										</a>
										.
									</Label>
								</div>
							</>
						)}

						{/* VOLUNTEER FORM */}
						{role === "volunteer" && (
							<>
								<hr className="my-8 border-gray-300" />
								<h2 className="text-xl font-semibold text-blue-900 mb-4">
									Volunteer Profile
								</h2>

								{/* Skills */}
								<div>
									<Label htmlFor="skills" className="text-blue-900 font-medium">
										Relevant Skills & Expertise
									</Label>
									<br />
									<Input
										id="skills"
										placeholder="e.g. First Aider, EMT, Logistics, etc."
										value={skills}
										onChange={(e) => setSkills(e.target.value)}
										className="!bg-black !border-black !text-white w-[415.11px]"
										required
									/>
									<p className="text-gray-500 text-[10px] mt-1">
										List your main skills to help us assign you to suitable
										missions.
									</p>
								</div>

								{/* Availability */}
								<div className="mt-6">
									<Label
										htmlFor="availability"
										className="text-blue-900 font-medium"
									>
										Emergency Availability
									</Label>
									<br />
									<select
										id="availability"
										value={availability}
										onChange={(e) => setAvailability(e.target.value)}
										className="border border-gray-300 rounded-md p-2 w-[415.11px] !bg-black !border-black !text-white"
										required
									>
										<option value="">Select availability</option>
										<option>Immediately</option>
										<option>On the day</option>
										<option>Next day</option>
										<option>Within 48 hours</option>
									</select>
									<p className="text-gray-500 text-[10px] mt-1">
										Choose how soon you can respond to emergency deployment
										requests.
									</p>
								</div>

								{/* Verification */}
								<div className="mt-6">
									<Label
										htmlFor="volProof"
										className="text-blue-900 font-medium"
									>
										Proof of Volunteer Status (Optional)
									</Label>
									<br />
									<div className="flex gap-2 items-center w-[415.11px]">
										<input
											id="volProof"
											type="file"
											onChange={(e) => setVolProof(e.target.files?.[0] ?? null)}
											className="hidden"
										/>
										<label
											htmlFor="volProof"
											className="bg-blue-900 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-950"
										>
											Upload File
										</label>
										<input
											type="text"
											value={volProof?.name || ""}
											readOnly
											placeholder="No file selected"
											className="flex-1 border border-gray-300 rounded-md p-2 text-sm !bg-black !border-black !text-white"
										/>
									</div>
									<p className="text-gray-500 text-sm mt-1 text-[10px]">
										You may upload your volunteer ID, training certificate, or
										accreditation to verify your profile.
									</p>
								</div>
							</>
						)}

						{/* ORGANIZATION FORM */}
						{role === "organization" && (
							<>
								<hr className="my-8 border-gray-300" />
								<h2 className="text-xl font-semibold text-blue-900 mb-4">
									Organization Profile
								</h2>

								<div>
									<Label
										htmlFor="orgName"
										className="text-blue-900 font-medium w-[415.11px]"
									>
										Organization Name
									</Label>
									<Input
										id="orgName"
										placeholder="e.g., Philippine Red Cross - Bohol Chapter"
										value={orgName}
										onChange={(e) => setOrgName(e.target.value)}
										required
										className="!bg-black !border-black !text-white w-[415.11px]"
									/>
								</div>

								<div>
									<Label
										htmlFor="orgType"
										className="text-blue-100 font-medium"
									>
										Organization Type
									</Label>
									<br />
									<select
										id="orgType"
										value={orgType}
										onChange={(e) => setOrgType(e.target.value)}
										className="border border-gray-300 rounded-md p-2 !bg-black !border-black !text-white w-[415.11px]"
										required
									>
										<option value="">Select organization type</option>
										<option>Government Agency</option>
										<option>Non-Governmental Organization (NGO)</option>
										<option>Volunteer / Civic Organization</option>
										<option>Private Sector / Company</option>
										<option>Academic Institution</option>
									</select>
								</div>

								<div>
									<Label
										htmlFor="orgContact"
										className="text-blue-900 font-medium "
									>
										Contact Information
									</Label>
									<Input
										id="orgContact"
										placeholder="e.g., +63 912 345 6789 or org@email.com"
										value={orgContact}
										onChange={(e) => setOrgContact(e.target.value)}
										required
										className="!bg-black !border-black !text-white w-[415.11px]"
									/>
								</div>

								<div>
									<Label
										htmlFor="orgProof"
										className="text-blue-900 font-medium"
									>
										Proof of Legitimacy (Upload or Registration ID)
									</Label>
									<br />
									<div className="flex gap-2 items-center w-[415px]">
										<input
											id="orgProof"
											type="file"
											onChange={(e) => setOrgProof(e.target.files?.[0] ?? null)}
											className="hidden"
										/>
										<label
											htmlFor="orgProof"
											className="bg-blue-900 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-950"
										>
											Upload File
										</label>
										<input
											type="text"
											value={orgProof?.name || ""}
											readOnly
											placeholder="No file selected"
											className="flex-1 border border-gray-300 rounded-md p-2 text-sm !bg-black !border-black !text-white w-[415.11px]"
										/>
									</div>
									<p className="text-gray-500 text-sm mt-1 text-[10px]">
										You may upload DSWD accreditation, SEC/DTI registration, or
										any valid document to verify your organization.
									</p>
								</div>
							</>
						)}

						{/* FEEDBACK */}
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

						{/* SUBMIT BUTTON */}
						<Button
							type="submit"
							className="w-[415.11px] bg-blue-900 hover:bg-blue-950 text-white py-3 font-semibold"
							disabled={isLoading}
						>
							{isLoading
								? "Creating account..."
								: "Register to DisasterConnect"}
						</Button>
						<br />
						<br />
						<br />
					</form>
				</div>
			</div>
		</div>
	);
}