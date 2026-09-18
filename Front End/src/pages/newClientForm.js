import CoachNavBar from "../components/CoachNavBar";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function NewClientForm() {
	const navigate = useNavigate();
	const { id } = useParams();
	const isEdit = Boolean(id);
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		age: "18",
		weight: "",
		height: "",
		startDate: new Date().toISOString().split("T")[0],
		programFocus: "Muscle Gain",
		secondaryGoal: "Weight Loss",
		duration: "12",
		state: "Active",
		// performance / test fields
		maxMuscleUps: "",
		maxDips: "",
		maxPullUps: "",
		maxPushUps: "",
		oneRepMaxMuscleUps: "",
		oneRepMaxDips: "",
		oneRepMaxPullUps: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);


	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};


	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const payload = {
				name: formData.fullName,
				email: formData.email,
				age: Number(formData.age) || 0,
				weight: Number(formData.weight) || undefined,
				height: Number(formData.height) || undefined,
				startDate: formData.startDate,
				primaryGoal: formData.programFocus,
				secondaryGoal: formData.secondaryGoal,
				duration: Number(formData.duration) || undefined,
				status: formData.state,
				maxMuscleUps: Number(formData.maxMuscleUps) || 0,
				maxDips: Number(formData.maxDips) || 0,
				maxPullUps: Number(formData.maxPullUps) || 0,
				maxPushUps: Number(formData.maxPushUps) || 0,
				oneRepMaxMuscleUps: Number(formData.oneRepMaxMuscleUps) || 0,
				oneRepMaxDips: Number(formData.oneRepMaxDips) || 0,
				oneRepMaxPullUps: Number(formData.oneRepMaxPullUps) || 0,
			};

			if (!payload.name || !payload.email) {
				setError("Name and email are required.");
				setLoading(false);
				return;
			}

			if (isEdit) {
				const token = localStorage.getItem("token");
				const res = await fetch(`http://localhost:8080/clients/${id}`, {
					method: "PATCH",
					headers: { 
						"Content-Type": "application/json",
						"Authorization": token ? `Bearer ${token}` : ""
					},
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error("Failed to update client");
				await res.json();
				navigate("/coachDashboard");
				return;
			} else {
				const token = localStorage.getItem("token");
				const res = await fetch("http://localhost:8080/clients", {
					method: "POST",
					headers: { 
						"Content-Type": "application/json",
						"Authorization": token ? `Bearer ${token}` : ""
					},
					body: JSON.stringify(payload),
				});
				if (!res.ok) throw new Error("Failed to create client");
				const data = await res.json();
				
				// Show success message with temporary password
				alert(`✓ Client created successfully!\n\nTemporary password: ${data.tempPassword}\n\nClient: ${payload.name}`);
				
				setFormData({
					fullName: "",
					email: "",
					age: "18",
					weight: "",
					height: "",
					startDate: new Date().toISOString().split("T")[0],
					programFocus: "Muscle Gain",
					secondaryGoal: "Weight Loss",
					duration: "12",
					state: "Active",
					maxMuscleUps: "",
					maxDips: "",
					maxPullUps: "",
					maxPushUps: "",
					oneRepMaxMuscleUps: "",
					oneRepMaxDips: "",
					oneRepMaxPullUps: "",
				});
				navigate("/coachDashboard");
			}
		} catch (err) {
			console.error(err);
			setError(err.message || "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!isEdit) return;
		let cancelled = false;
		(async () => {
			setLoading(true);
			setError(null);
			try {
				const token = localStorage.getItem("token");
				const res = await fetch(`http://localhost:8080/clients/${id}`, {
					headers: { "Authorization": token ? `Bearer ${token}` : "" }
				});

				if (!res.ok) throw new Error("Failed to load client");
				const client = await res.json();

				if (cancelled) return;
				setFormData((prev) => ({
					...prev,
					fullName: client.name || "",
					email: client.email || "",
					age: String(client.age) || prev.age,
					weight: String(client.weight) || prev.weight || "",
					height: String(client.height) || prev.height || "",
					startDate: client.startDate 
						? new Date(client.startDate).toISOString().split('T')[0]
						: prev.startDate,
					programFocus: client.primaryGoal || prev.programFocus,
					secondaryGoal: client.secondaryGoal || prev.secondaryGoal,
					duration: String(client.duration) || prev.duration,
					state: client.status || prev.state,
					maxMuscleUps:
						String(client.test?.maxMuscleUps || "") || prev.maxMuscleUps,
					maxDips: String(client.test?.maxDips || "") || prev.maxDips,
					maxPullUps: String(client.test?.maxPullUps || "") || prev.maxPullUps,
					maxPushUps: String(client.test?.maxPushUps || "") || prev.maxPushUps,
					oneRepMaxMuscleUps:
						String(client.test?.oneRepMaxMuscleUps || "") ||
						prev.oneRepMaxMuscleUps,
					oneRepMaxDips:
						String(client.test?.oneRepMaxDips || "") || prev.oneRepMaxDips,
					oneRepMaxPullUps:
						String(client.test?.oneRepMaxPullUps || "") ||
						prev.oneRepMaxPullUps,
				}));
			} catch (err) {
				console.error(err);
				setError(err.message || "Failed to load client");
			} finally {
				setLoading(false);
			}
		})();
		return () => (cancelled = true);
	}, [id, isEdit]);

	const primaryButton =
		"flex items-center gap-2 justify-center rounded-lg h-12 px-6 bg-primary text-background-dark text-base font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all duration-200";
	const secondaryButton =
		"flex items-center gap-2 justify-center rounded-lg h-12 px-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-base font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200";

	return (
		<div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-500 min-h-screen flex flex-col">
			<CoachNavBar />
			<main className="flex-1 px-4 py-8 md:px-10 lg:px-40">
				<div className="mx-auto max-w-3xl">
					<div className="mb-8 text-center">
						<h1 className="text-4xl font-bold">
							{isEdit ? "Edit Client" : "Add New Client"}
						</h1>
						<p className="text-slate-500 mt-2">
							{isEdit
								? "Update client profile and settings."
								: "Create a new client profile."}
						</p>
					</div>

					<div className="bg-white dark:bg-card-dark rounded-2xl shadow-lg border border-slate-200 dark:border-border-dark p-6">
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								{/* Left: photo */}
								<div className="flex flex-col items-center lg:items-start">
									
									<div className="w-full lg:pl-4">
										<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
											Name
										</label>
										<input
											name="fullName"
											value={formData.fullName}
											onChange={handleChange}
											className="w-full h-12 rounded-lg border px-4"
											placeholder="Full name"
										/>
										<label className="block text-xs font-bold uppercase text-slate-500 mb-2 mt-4">
											Email
										</label>
										<input
											name="email"
											value={formData.email}
											onChange={handleChange}
											className="w-full h-12 rounded-lg border px-4"
											placeholder="client@example.com"
										/>
										<label className="block text-xs font-bold uppercase text-slate-500 mt-4 mb-2">
											Status
										</label>
										<select
											name="state"
											value={formData.state}
											onChange={handleChange}
											className="w-full h-12 rounded-lg border px-3 placeholder:text-slate-500 dark:placeholder:text-slate-400"
											placeholder="Status"
										>
											<option>Active</option>
											<option>Inactive</option>
										</select>

									</div>
								</div>

								{/* Right: fields */}
								<div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
									<div>
										<label className="block text-xs font-bold uppercase mb-2">
											Age
										</label>
										<input
											name="age"
											value={formData.age}
											onChange={handleChange}
											type="number"
											min="17"
											className="w-full h-12 rounded-lg border px-4 placeholder:text-slate-500 dark:placeholder:text-slate-400"
											placeholder="Age"
										/>
									</div>
									<div>
										<label className="block text-xs font-bold uppercase mb-2">
											Start Date
										</label>
										<input
											name="startDate"
											value={formData.startDate}
											onChange={handleChange}
											type="date"
											className="w-full h-12 rounded-lg border px-4 placeholder:text-slate-500 dark:placeholder:text-slate-400"
											placeholder="Start Date"
										/>
									</div>

									<div>
										<label className="block text-xs font-bold uppercase mb-2">
											Height (cm)
										</label>
										<input
											name="height"
											value={formData.height}
											onChange={handleChange}
											type="number"
											className="w-full h-12 rounded-lg border px-4 placeholder:text-slate-500 dark:placeholder:text-slate-400"
											placeholder="Height"
										/>
									</div>
									<div>
										<label className="block text-xs font-bold uppercase mb-2">
											Weight (kg)
										</label>
										<input
											name="weight"
											value={formData.weight}
											onChange={handleChange}
											type="number"
											className="w-full h-12 rounded-lg border px-4 placeholder:text-slate-500 dark:placeholder:text-slate-400"
											placeholder="Weight"
										/>
									</div>

									<div className="col-span-1 max-w-xs">
										<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
											Primary Goal
										</label>
										<select
											name="programFocus"
											value={formData.programFocus}
											onChange={handleChange}
											className="w-full h-12 rounded-lg border px-3 placeholder:text-slate-500 dark:placeholder:text-slate-400"
											placeholder="Primary Goal"
										>
											<option>Weight Loss</option>
											<option>Muscle Gain</option>
											<option>Endurance</option>
											<option>Power</option>
											<option>Skills</option>
										</select>
									</div>
									<div className="col-span-1 max-w-xs">
										<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
											Secondary Goal
										</label>
										<select
											name="secondaryGoal"
											value={formData.secondaryGoal}
											onChange={handleChange}
											className="w-full h-12 rounded-lg border px-3 placeholder:text-slate-500 dark:placeholder:text-slate-400"
											placeholder="Secondary Goal"
										>
											<option>Weight Loss</option>
											<option>Muscle Gain</option>
											<option>Endurance</option>
											<option>Power</option>
											<option>Skills</option>
										</select>
									</div>

									<div className="col-span-1 max-w-xs">
										<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
											Duration (months)
										</label>
										<input
											name="duration"
											value={formData.duration}
											onChange={handleChange}
											type="number"
											min="1"
											className="w-full h-12 rounded-lg border px-4"
											placeholder="Duration"
										/>
									</div>

									<div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
										<div>
											<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
												Max Muscle Ups
											</label>
											<input
												name="maxMuscleUps"
												value={formData.maxMuscleUps}
												onChange={handleChange}
												type="number"
												min="0"
												className="w-full h-12 rounded-lg border px-4"
											/>
										</div>
										<div>
											<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
												Max Dips
											</label>
											<input
												name="maxDips"
												value={formData.maxDips}
												onChange={handleChange}
												type="number"
												min="0"
												className="w-full h-12 rounded-lg border px-4"
											/>
										</div>
										<div>
											<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
												Max Pull Ups
											</label>
											<input
												name="maxPullUps"
												value={formData.maxPullUps}
												onChange={handleChange}
												type="number"
												min="0"
												className="w-full h-12 rounded-lg border px-4"
											/>
										</div>
										<div>
											<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
												Max Push Ups
											</label>
											<input
												name="maxPushUps"
												value={formData.maxPushUps}
												onChange={handleChange}
												type="number"
												min="0"
												className="w-full h-12 rounded-lg border px-4"
											/>
										</div>
									</div>

									<div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
										<div>
											<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
												1RM Muscle Ups
											</label>
											<input
												name="oneRepMaxMuscleUps"
												value={formData.oneRepMaxMuscleUps}
												onChange={handleChange}
												type="number"
												min="0"
												className="w-full h-12 rounded-lg border px-4"
											/>
										</div>
										<div>
											<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
												1RM Dips
											</label>
											<input
												name="oneRepMaxDips"
												value={formData.oneRepMaxDips}
												onChange={handleChange}
												type="number"
												min="0"
												className="w-full h-12 rounded-lg border px-4"
											/>
										</div>
										<div>
											<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
												1RM Pull Ups
											</label>
											<input
												name="oneRepMaxPullUps"
												value={formData.oneRepMaxPullUps}
												onChange={handleChange}
												type="number"
												min="0"
												className="w-full h-12 rounded-lg border px-4"
											/>
										</div>
									</div>
								</div>
							</div>

							<div className="flex items-center justify-end gap-4 mt-6">
								<button
									type="button"
									onClick={() => navigate(-1)}
									className={secondaryButton}
								>
									Cancel
								</button>
								<button
									type="submit"
									className={primaryButton}
									disabled={loading}
								>
									{loading
										? isEdit
											? "Saving..."
											: "Creating..."
										: isEdit
											? "Save Changes"
											: "Create Client"}
								</button>
							</div>
						</form>
					</div>
				</div>
			</main>

			<footer className="mt-12 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
				<p>© 2026 FitTrack. All rights reserved.</p>
			</footer>
		</div>
	);
}

export default NewClientForm;
