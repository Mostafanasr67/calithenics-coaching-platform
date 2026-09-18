import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import LoginNavBar from "../components/LoginNavBar";
import LoginAside from "../components/LoginAside";
import LoginFormText from "../components/LoginFormText";
import AuthForm from "../components/AuthForm";


const BACKEND_URL = "http://localhost:8080";

export default function Login() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const mode = searchParams.get("mode") || "signup";
	const isSignUp = mode !== "login";

	const [formState, setFormState] = useState({
		email: "",
		password: "",
		name: "",
	});
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const handleChange = (field, value) => {
		setFormState((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccessMessage("");

		if (!isSignUp) {
			try {
				const response = await fetch(`${BACKEND_URL}/auth/login`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: formState.email,
						password: formState.password,
					}),
				});

				const data = await response.json();

				if (!response.ok) {
					setError(data.message || "Login failed");
					return;
				}
			// Store token, userId, and role in localStorage
			localStorage.setItem("token", data.token);
			localStorage.setItem("userId", data.userId);
			localStorage.setItem("role", data.role);

			setSuccessMessage("Login successful!");
			setFormState({ email: "", password: "", name: "" });

			// Redirect based on role
			const destination = data.role === "coach" ? "/coachDashboard" : "/clientDetails/ " + data.userId;
			setTimeout(() => navigate(destination), 500);
			return;
			} catch (err) {
				console.error("Login error:", err);
				setError(err.message || "An error occurred during login.");
			}
		}

		try {
			const response = await fetch(`${BACKEND_URL}/auth/signup`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formState.name,
					email: formState.email,
					password: formState.password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Signup failed");
			}

			setSuccessMessage("Your account has been created successfully.");
			setFormState({ email: "", password: "", name: "" });
            setTimeout(() => navigate("/?mode=login"), 500);
		} catch (err) {
			console.error("Signup error:", err);
			setError(err.message || "An error occurred during signup.");
		}
	};

	return (
		<>
			<LoginNavBar isSignUp={isSignUp} />
			<main className="min-h-screen bg-slate-50 dark:bg-[#07101a]">
				<div className="mx-auto min-h-[calc(100vh-72px)] max-w-7xl px-4 sm:px-6 lg:px-8">
					<section className="flex items-center justify-center py-12 lg:py-16">
						<div className="w-full rounded-[2rem] border border-slate-200 bg-white/95 px-4 py-6 shadow-2xl shadow-slate-900/5 dark:border-slate-800 dark:bg-[#0b1220] md:px-8 md:py-8 lg:px-10 lg:py-10">
							<div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] xl:grid-cols-[0.9fr_1.1fr]">
								<LoginAside />
								<div>
									<LoginFormText isSignUp={isSignUp} />
									{error && (
										<div className="mb-4 rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-500/10">
											{error}
										</div>
									)}
									{successMessage && (
										<div className="mb-4 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-500/10">
											{successMessage}
										</div>
									)}
									<AuthForm
										isSignUp={isSignUp}
										formState={formState}
										onChange={handleChange}
										onSubmit={handleSubmit}
									/>
								</div>
							</div>
						</div>
					</section>
				</div>
			</main>
			
		</>
	);
}
