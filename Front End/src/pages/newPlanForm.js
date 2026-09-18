import CoachNavBar from "../components/CoachNavBar";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function NewPlanForm() {
	const navigate = useNavigate();
	const { clientId, planId } = useParams();

	const [isEditing, setIsEditing] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [originalTrainingDayIds, setOriginalTrainingDayIds] = useState([]);

	const [formData, setFormData] = useState({
		// Page 1: Plan Information
		title: "",
		mainGoal: "",
		description: "",
		status: "Active",
		startDate: new Date().toISOString().split("T")[0],
		endDate: "",
		coachNotes: "",

		// Page 2: Training Days
		trainingDays: [
			{ title: "", notes: "", exercises: [] },
			{ title: "", notes: "", exercises: [] },
		],
	});

	// Fetch existing plan data if editing
	useEffect(() => {
		if (planId) {
			const fetchPlanData = async () => {
				try {
					const token = localStorage.getItem("token");
					if (!token) {
						throw new Error("Authentication token not found");
					}

					const response = await fetch(
						`http://localhost:8080/clients/${clientId}/plan`,
						{
							method: "GET",
							headers: {
								Authorization: `Bearer ${token}`,
								"Content-Type": "application/json",
							},
						},
					);

					if (!response.ok) {
						const errorData = await response.json().catch(() => ({}));
						console.error("Fetch response error:", response.status, errorData);
						throw new Error(`Failed to fetch plan data: ${response.status}`);
					}

					const data = await response.json();

					const planArray = Array.isArray(data.plan) ? data.plan : [data.plan];
					const targetPlan = planArray.find((p) => p._id === planId);

					if (!targetPlan) {
						throw new Error(`Plan with ID ${planId} not found`);
					}

					// Transform training days to match form structure
					// Ensure exercises are properly extracted from populated data
					const transformedDays = (targetPlan.trainingDays || []).map((day) => {
						let exercises = [];
						
						if (day.exercises && Array.isArray(day.exercises)) {
							// Handle both populated objects and ID strings
							exercises = day.exercises.map((exercise) => {
								if (typeof exercise === "string") {
									// If it's just an ID string, create a basic object
									return { _id: exercise };
								}
								// If it's a populated object, extract all fields
								return {
									_id: exercise._id,
									name: exercise.name || "",
									sets: exercise.sets || "",
									reps: exercise.reps || "",
									weight: exercise.weight || "",
									rest: exercise.rest || "",
									tempo: exercise.tempo || "",
									rir: exercise.rir || "",
									notes: exercise.notes || "",
								};
							});
						}

						return {
							_id: day._id,
							title: day.title || "",
							notes: day.notes || "",
							exercises: exercises,
						};
					});

					setFormData({
						title: targetPlan.title,
						mainGoal: targetPlan.mainGoal,
						description: targetPlan.description,
						status: targetPlan.status,
						startDate: new Date(targetPlan.startDate)
							.toISOString()
							.split("T")[0],
						endDate: new Date(targetPlan.endDate).toISOString().split("T")[0],
						coachNotes: targetPlan.coachNotes || "",
						trainingDays: transformedDays,
					});
					// Store original training day IDs to track deletions
					setOriginalTrainingDayIds(transformedDays.map(day => day._id).filter(Boolean));
					setIsEditing(true);
				} catch (err) {
					console.error("Error fetching plan data:", err);
					setError(err.message || "Failed to load plan data. Please try again.");
				}
			};

			fetchPlanData();
		}
	}, [planId, clientId]);

	// Handle text input changes
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Handle training day field changes
	const handleDayChange = (index, field, value) => {
		setFormData((prev) => ({
			...prev,
			trainingDays: prev.trainingDays.map((day, i) =>
				i === index ? { ...day, [field]: value } : day,
			),
		}));
	};

	// Handle exercise field changes
	const handleExerciseChange = (dayIndex, exerciseIndex, field, value) => {
		setFormData((prev) => ({
			...prev,
			trainingDays: prev.trainingDays.map((day, i) =>
				i === dayIndex
					? {
							...day,
							exercises: day.exercises.map((ex, j) =>
								j === exerciseIndex ? { ...ex, [field]: value } : ex,
							),
						}
					: day,
			),
		}));
	};

	// Add exercise to training day
	const addExercise = (dayIndex) => {
		setFormData((prev) => ({
			...prev,
			trainingDays: prev.trainingDays.map((day, i) =>
				i === dayIndex
					? {
							...day,
							exercises: [
								...day.exercises,
								{
									name: "",
									sets: "",
									reps: "",
									weight: "",
									rest: "",
									tempo: "",
									rir: "",
									notes: "",
								},
							],
						}
					: day,
			),
		}));
	};

	// Remove exercise from training day
	const removeExercise = async (dayIndex, exerciseIndex) => {
		const exercise = formData.trainingDays[dayIndex].exercises[exerciseIndex];
		
		// If the exercise has an _id (exists in DB), delete it from backend
		if (exercise._id) {
			try {
				const token = localStorage.getItem("token");
				const response = await fetch(
					`http://localhost:8080/exercises/${exercise._id}`,
					{
						method: "DELETE",
						headers: {
							"Content-Type": "application/json",
							Authorization: token ? `Bearer ${token}` : "",
						},
					}
				);

				if (!response.ok) {
					const error = await response.json();
					console.error("Exercise deletion error:", error);
					setError("Failed to delete exercise. Please try again.");
					return;
				}

			} catch (err) {
				console.error("Error deleting exercise:", err);
				setError("Failed to delete exercise. Please try again.");
				return;
			}
		}

		// Remove from local state
		setFormData((prev) => ({
			...prev,
			trainingDays: prev.trainingDays.map((day, i) =>
				i === dayIndex
					? {
							...day,
							exercises: day.exercises.filter((_, j) => j !== exerciseIndex),
						}
					: day,
			),
		}));
	};

	// Add a new training day
	const addDay = () => {
		setFormData((prev) => ({
			...prev,
			trainingDays: [
				...prev.trainingDays,
				{ title: "", notes: "", exercises: [] },
			],
		}));
	};

	// Remove a training day
	const removeDay = (index) => {
		if (formData.trainingDays.length > 1) {
			setFormData((prev) => ({
				...prev,
				trainingDays: prev.trainingDays.filter((_, i) => i !== index),
			}));
		}
	};

	// Move day up in order
	const moveDay = (index, direction) => {
		const newDays = [...formData.trainingDays];
		const newIndex = direction === "up" ? index - 1 : index + 1;

		if (newIndex < 0 || newIndex >= newDays.length) return;

		[newDays[index], newDays[newIndex]] = [newDays[newIndex], newDays[index]];
		setFormData((prev) => ({
			...prev,
			trainingDays: newDays,
		}));
	};

	// Validate page 1
	const validatePage1 = () => {
		if (!formData.title.trim()) {
			setError("Plan title is required.");
			return false;
		}
		if (!formData.mainGoal.trim()) {
			setError("Training goal is required.");
			return false;
		}
		if (!formData.description.trim()) {
			setError("Plan description is required.");
			return false;
		}
		if (!formData.startDate) {
			setError("Start date is required.");
			return false;
		}
		if (!formData.endDate) {
			setError("End date is required.");
			return false;
		}
		if (new Date(formData.startDate) >= new Date(formData.endDate)) {
			setError("End date must be after start date.");
			return false;
		}
		return true;
	};

	// Validate page 2
	const validatePage2 = () => {
		const hasEmptyDays = formData.trainingDays.some((day) => !day.title.trim());
		if (hasEmptyDays) {
			setError("All training days must have a title.");
			return false;
		}
		if (formData.trainingDays.length === 0) {
			setError("You must add at least one training day.");
			return false;
		}
		return true;
	};

	// Handle next page
	const handleNext = () => {
		setError(null);
		if (!validatePage1()) return;
		setCurrentPage(2);
	};

	// Handle back page
	const handleBack = () => {
		setError(null);
		setCurrentPage(1);
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(null);

		if (!validatePage2()) return;

		setLoading(true);
		try {
			const token = localStorage.getItem("token");

			// If editing, update training days/exercises FIRST, then update plan metadata
			if (isEditing) {
				// First, delete any training days that were removed
				const currentTrainingDayIds = formData.trainingDays
					.map(day => day._id)
					.filter(Boolean);
				
				const deletedDayIds = originalTrainingDayIds.filter(
					id => !currentTrainingDayIds.includes(id)
				);

				for (const dayId of deletedDayIds) {
					try {
						const deleteRes = await fetch(
							`http://localhost:8080/trainingDays/${dayId}`,
							{
								method: "DELETE",
								headers: {
									"Content-Type": "application/json",
									Authorization: token ? `Bearer ${token}` : "",
								},
							},
						);

						if (!deleteRes.ok) {
							const error = await deleteRes.json();
							console.error("Day deletion error:", error);
							throw new Error(`Failed to delete training day ${dayId}`);
						}
						console.log(`✅ Training day ${dayId} deleted`);
					} catch (error) {
						console.error("Error deleting training day:", error);
						throw error;
					}
				}

				// Update training days and exercises BEFORE updating the plan
				for (let i = 0; i < formData.trainingDays.length; i++) {
					const day = formData.trainingDays[i];
					let dayId = day._id;

					// If this is a NEW day (no _id), CREATE it first
					if (!dayId) {
						console.log(`Creating new training day ${i + 1}:`, day.title);
						const dayPayload = {
							plan: planId,
							title: day.title,
							number: i + 1,
							notes: day.notes,
						};

						const dayRes = await fetch(`http://localhost:8080/trainingDays`, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Authorization: token ? `Bearer ${token}` : "",
							},
							body: JSON.stringify(dayPayload),
						});

						if (!dayRes.ok) {
							const error = await dayRes.json();
							console.error("Day creation error:", error);
							throw new Error(`Failed to create training day ${i + 1}`);
						}

						const dayData = await dayRes.json();
						dayId = dayData.trainingDay._id || dayData._id;
						console.log(`✅ Training day ${i + 1} created with ID: ${dayId}`);
					} else {
						// UPDATE existing day
						console.log(`Updating training day ${i + 1}:`, dayId);
						const dayPayload = {
							title: day.title,
							notes: day.notes,
						};

						const dayRes = await fetch(
							`http://localhost:8080/trainingDays/${dayId}`,
							{
								method: "PATCH",
								headers: {
									"Content-Type": "application/json",
									Authorization: token ? `Bearer ${token}` : "",
								},
								body: JSON.stringify(dayPayload),
							},
						);

						if (!dayRes.ok) {
							const error = await dayRes.json();
							console.error("Day update error:", error);
							throw new Error(`Failed to update training day ${i + 1}`);
						}
						console.log(`✅ Training day ${i + 1} updated`);
					}

					// Update/Create exercises for this training day
					for (let j = 0; j < day.exercises.length; j++) {
						const exercise = day.exercises[j];
						console.log(`Processing exercise ${j + 1}:`, exercise);

						if (exercise._id) {
							// UPDATE existing exercise
							const exerciseRes = await fetch(`http://localhost:8080/exercises/${exercise._id}`, {
								method: "PATCH",
								headers: {
									"Content-Type": "application/json",
									Authorization: token ? `Bearer ${token}` : "",
								},
								body: JSON.stringify({
									name: exercise.name,
									sets: exercise.sets,
									reps: exercise.reps,
									weight: exercise.weight,
									rest: exercise.rest,
									tempo: exercise.tempo,
									rir: exercise.rir || "",
									notes: exercise.notes || "",
								}),
							});
							if (!exerciseRes.ok) {
								const error = await exerciseRes.json();
								console.error("Exercise update error:", error);
								throw new Error(`Failed to update exercise ${exercise.name} for day ${i + 1}`);
							}
							console.log(`✅ Exercise ${exercise.name} updated`);
						} else {
							// CREATE new exercise
							console.log(`Creating new exercise: ${exercise.name}`);
							const exerciseRes = await fetch(`http://localhost:8080/exercises`, {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
									Authorization: token ? `Bearer ${token}` : "",
								},
								body: JSON.stringify({
									day: dayId,
									name: exercise.name,
									sets: exercise.sets,
									reps: exercise.reps,
									weight: exercise.weight,
									rest: exercise.rest,
									tempo: exercise.tempo,
									rir: exercise.rir || "",
									notes: exercise.notes || "",
								}),
							});
							if (!exerciseRes.ok) {
								const error = await exerciseRes.json();
								console.error("Exercise create error:", error);
								throw new Error(`Failed to create exercise ${exercise.name} for day ${i + 1}`);
							}
							console.log(`✅ Exercise ${exercise.name} created`);
						}
					}
				}

				console.log("✅ All training days and exercises updated/created successfully");

				// Now update the plan metadata
				const planPayload = {
					_id: planId,  // ← Explicitly pass the plan ID to ensure correct plan is updated
					title: formData.title,
					mainGoal: formData.mainGoal,
					description: formData.description,
					status: formData.status,
					startDate: formData.startDate,
					endDate: formData.endDate,
					coachNotes: formData.coachNotes,
				};

				const planRes = await fetch(
					`http://localhost:8080/clients/${clientId}/plan`,
					{
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							Authorization: token ? `Bearer ${token}` : "",
						},
						body: JSON.stringify(planPayload),
					},
				);

				if (!planRes.ok) {
					throw new Error("Failed to update plan");
				}

				// Success: Navigate back to client details
				navigate(`/clientDetails/${clientId}`);
				return;
			}

			// Step 1: Create the plan (for new plans)
			const planPayload = {
				title: formData.title,
				mainGoal: formData.mainGoal,
				description: formData.description,
				status: formData.status,
				startDate: formData.startDate,
				endDate: formData.endDate,
				coachNotes: formData.coachNotes,
			};

			const planRes = await fetch(
				`http://localhost:8080/clients/${clientId}/plan`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
					body: JSON.stringify(planPayload),
				},
			);

			if (!planRes.ok) {
				throw new Error("Failed to create plan");
			}

			const planData = await planRes.json();
			const newPlanId = planData.plan._id || planData._id;

			if (!newPlanId) {
				throw new Error("Failed to extract plan ID from response");
			}

			// Step 2: Create training days
			const createdDayIds = [];

			for (let i = 0; i < formData.trainingDays.length; i++) {
				const day = formData.trainingDays[i];
				const dayPayload = {
					plan: newPlanId,
					title: day.title,
					number: i + 1,
					notes: day.notes,
				};

				const dayRes = await fetch(`http://localhost:8080/trainingDays`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
					body: JSON.stringify(dayPayload),
				});

				if (!dayRes.ok) {
					throw new Error(`Failed to create training day ${i + 1}`);
				}

				const dayData = await dayRes.json();
				const dayId = dayData.trainingDay._id || dayData._id;
				createdDayIds.push(dayId);

				// Step 2b: Create exercises for this training day
				for (let j = 0; j < day.exercises.length; j++) {
					const exercise = day.exercises[j];
					if (!exercise.name.trim()) continue; // Skip empty exercises

					const exercisePayload = {
						day: dayId,
						name: exercise.name,
						sets: exercise.sets,
						reps: exercise.reps,
						weight: exercise.weight,
						rest: exercise.rest,
						tempo: exercise.tempo,
						rir: exercise.rir || "",
						notes: exercise.notes || "",
					};

					const exRes = await fetch(`http://localhost:8080/exercises`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: token ? `Bearer ${token}` : "",
						},
						body: JSON.stringify(exercisePayload),
					});

					if (!exRes.ok) {
						throw new Error(
							`Failed to create exercise ${exercise.name} for day ${i + 1}`,
						);
					}

					const exData = await exRes.json();
					const exerciseId = exData.exercise._id || exData._id;

					// Add exercise ID to training day's exercises array
					await fetch(`http://localhost:8080/trainingDays/${dayId}/exercises`, {
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							Authorization: token ? `Bearer ${token}` : "",
						},
						body: JSON.stringify({ exerciseId }),
					});
				}
			}

			// Step 3: Update plan with training day IDs
			const updatePayload = {
				_id: newPlanId,  // ← Explicitly pass the plan ID to ensure correct plan is updated
				trainingDays: createdDayIds,
			};

			const updateRes = await fetch(
				`http://localhost:8080/clients/${clientId}/plan`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: token ? `Bearer ${token}` : "",
					},
					body: JSON.stringify(updatePayload),
				},
			);

			if (!updateRes.ok) {
				throw new Error("Failed to update plan with training days");
			}

			// Success: Navigate back to client details
			navigate(`/clientDetails/${clientId}`);
		} catch (err) {
			console.error(err);
			setError(err.message || "An error occurred while creating the plan.");
		} finally {
			setLoading(false);
		}
	};

	// Button styles
	const primaryButton =
		"flex items-center gap-2 justify-center rounded-lg h-12 px-6 bg-primary text-background-dark text-base font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
	const secondaryButton =
		"flex items-center gap-2 justify-center rounded-lg h-12 px-6 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-base font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200";

	return (
		<div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-500 min-h-screen flex flex-col">
			<CoachNavBar />
			<main className="flex-1 px-4 py-8 md:px-10 lg:px-40">
				<div className="mx-auto max-w-3xl">
					{/* Header */}
					<div className="mb-8 text-center">
						<h1 className="text-4xl font-bold">
							{isEditing ? "Edit Training Plan" : "Create Training Plan"}
						</h1>
						<p className="text-slate-500 mt-2">
							{isEditing
								? "Update your training plan."
								: "Build a comprehensive training plan for your client."}
						</p>
					</div>

					{/* Progress Indicator */}
					<div className="mb-8 flex items-center justify-center gap-4">
						<div
							className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
								currentPage === 1
									? "bg-primary text-white"
									: "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
							}`}
						>
							1
						</div>
						<div
							className={`flex-1 h-1 transition-all ${
								currentPage === 2
									? "bg-primary"
									: "bg-slate-300 dark:bg-slate-600"
							}`}
						></div>
						<div
							className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
								currentPage === 2
									? "bg-primary text-white"
									: "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
							}`}
						>
							2
						</div>
					</div>

					{/* Error Message */}
					{error && (
						<div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
							<p className="text-red-700 dark:text-red-400 text-sm font-medium">
								{error}
							</p>
						</div>
					)}

					{/* Form Container */}
					<div className="bg-white dark:bg-card-dark rounded-2xl shadow-lg border border-slate-200 dark:border-border-dark p-6">
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* PAGE 1: PLAN INFORMATION */}
							{currentPage === 1 && (
								<div className="space-y-6">
									{/* Title */}
									<div>
										<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
											Plan Title *
										</label>
										<input
											name="title"
											value={formData.title}
											onChange={handleChange}
											type="text"
											placeholder="e.g., Marathon Prep - October"
											className="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>

									{/* Goal */}
									<div>
										<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
											Training Goal *
										</label>
										<input
											name="mainGoal"
											value={formData.mainGoal}
											onChange={handleChange}
											type="text"
											placeholder="e.g., Increase endurance and speed"
											className="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>

									{/* Description */}
									<div>
										<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
											Description *
										</label>
										<textarea
											name="description"
											value={formData.description}
											onChange={handleChange}
											placeholder="Provide a detailed description of this plan..."
											rows="4"
											className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
										></textarea>
									</div>

									{/* Status */}
									<div>
										<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
											Status *
										</label>
										<select
											name="status"
											value={formData.status}
											onChange={handleChange}
											className="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
										>
											<option value="Active">Active</option>
											<option value="Inactive">Inactive</option>
										</select>
									</div>

									{/* Date Range */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
												Start Date *
											</label>
											<input
												name="startDate"
												value={formData.startDate}
												onChange={handleChange}
												type="date"
												className="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
											/>
										</div>
										<div>
											<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
												End Date *
											</label>
											<input
												name="endDate"
												value={formData.endDate}
												onChange={handleChange}
												type="date"
												className="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
											/>
										</div>
									</div>

									{/* Coach Notes */}
									<div>
										<label className="block text-xs font-bold uppercase text-slate-500 mb-2">
											Coach Notes
										</label>
										<textarea
											name="coachNotes"
											value={formData.coachNotes}
											onChange={handleChange}
											placeholder="Add any additional notes about this plan..."
											rows="3"
											className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
										></textarea>
									</div>
								</div>
							)}

							{/* PAGE 2: TRAINING DAYS */}
							{currentPage === 2 && (
								<div className="space-y-6">
									<div className="flex items-center justify-between mb-4">
										<h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
											Training Days ({formData.trainingDays.length})
										</h2>
										<button
											type="button"
											onClick={addDay}
											className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all"
										>
											<span className="material-symbols-outlined text-lg">
												add
											</span>
											Add Day
										</button>
									</div>

									{formData.trainingDays.length === 0 ? (
										<p className="text-center text-slate-500 py-8">
											No training days added yet.
										</p>
									) : (
										<div className="space-y-4">
											{formData.trainingDays.map((day, index) => (
												<div
													key={index}
													className="border border-slate-300 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50"
												>
													<div className="flex items-start justify-between mb-4">
														<div className="flex items-center gap-3">
															<div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
																{index + 1}
															</div>
															<h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
																Day {index + 1}
															</h3>
														</div>

														<div className="flex items-center gap-2">
															{/* Move Up */}
															<button
																type="button"
																onClick={() => moveDay(index, "up")}
																disabled={index === 0}
																className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary disabled:opacity-30 transition-colors"
																title="Move up"
															>
																<span className="material-symbols-outlined text-lg">
																	arrow_upward
																</span>
															</button>

															{/* Move Down */}
															<button
																type="button"
																onClick={() => moveDay(index, "down")}
																disabled={
																	index === formData.trainingDays.length - 1
																}
																className="p-2 text-slate-600 dark:text-slate-400 hover:text-primary disabled:opacity-30 transition-colors"
																title="Move down"
															>
																<span className="material-symbols-outlined text-lg">
																	arrow_downward
																</span>
															</button>

															{/* Remove */}
															<button
																type="button"
																onClick={() => removeDay(index)}
																disabled={formData.trainingDays.length === 1}
																className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-30 transition-colors"
																title="Remove day"
															>
																<span className="material-symbols-outlined text-lg">
																	delete
																</span>
															</button>
														</div>
													</div>

													{/* Day Title */}
													<div className="mb-4">
														<label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-2">
															Day Title *
														</label>
														<input
															type="text"
															value={day.title}
															onChange={(e) =>
																handleDayChange(index, "title", e.target.value)
															}
															placeholder="e.g., Push (Chest/Shoulders/Triceps)"
															className="w-full h-10 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
														/>
													</div>

													{/* Day Notes */}
													<div>
														<label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-2">
															Notes
														</label>
														<textarea
															value={day.notes}
															onChange={(e) =>
																handleDayChange(index, "notes", e.target.value)
															}
															placeholder="e.g., Heavy strength focus, 4-6 rep range"
															rows="2"
															className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
														></textarea>
													</div>

													{/* Exercises Section */}
													<div className="mt-6 pt-4 border-t border-slate-300 dark:border-slate-600">
														<div className="flex items-center justify-between mb-4">
															<h4 className="font-bold text-slate-900 dark:text-slate-100">
																Exercises ({day.exercises.length})
															</h4>
															<button
																type="button"
																onClick={() => addExercise(index)}
																className="flex items-center gap-1 px-3 py-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded font-bold transition-all"
															>
																<span className="material-symbols-outlined text-sm">
																	add
																</span>
																Add Exercise
															</button>
														</div>

														{day.exercises.length === 0 ? (
															<p className="text-xs text-slate-500 py-4">
																No exercises added yet.
															</p>
														) : (
															<div className="space-y-4">
																{day.exercises.map((exercise, exIndex) => (
																	<div
																		key={exIndex}
																		className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-3 space-y-3"
																	>
																		<div className="flex items-center justify-between mb-3">
																			<p className="text-xs font-bold text-slate-600 dark:text-slate-400">
																				Exercise {exIndex + 1}
																			</p>
																			<button
																				type="button"
																				onClick={() =>
																					removeExercise(index, exIndex)
																				}
																				className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 transition-colors"
																				title="Remove exercise"
																			>
																				<span className="material-symbols-outlined text-base">
																					delete
																				</span>
																			</button>
																		</div>

																		{/* Exercise Name */}
																		<div>
																			<label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
																				Name *
																			</label>
																			<input
																				type="text"
																				value={exercise.name}
																				onChange={(e) =>
																					handleExerciseChange(
																						index,
																						exIndex,
																						"name",
																						e.target.value,
																					)
																				}
																				placeholder="e.g., Bench Press"
																				className="w-full h-9 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
																			/>
																		</div>

																		{/* Exercise Grid */}
																		<div className="grid grid-cols-2 gap-2">
																			<div>
																				<label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
																					Sets
																				</label>
																				<input
																					type="text"
																					value={exercise.sets}
																					onChange={(e) =>
																						handleExerciseChange(
																							index,
																							exIndex,
																							"sets",
																							e.target.value,
																						)
																					}
																					placeholder="e.g., 4"
																					className="w-full h-8 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
																				/>
																			</div>
																			<div>
																				<label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
																					Reps
																				</label>
																				<input
																					type="text"
																					value={exercise.reps}
																					onChange={(e) =>
																						handleExerciseChange(
																							index,
																							exIndex,
																							"reps",
																							e.target.value,
																						)
																					}
																					placeholder="e.g., 6-8"
																					className="w-full h-8 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
																				/>
																			</div>
																			<div>
																				<label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
																					Weight
																				</label>
																				<input
																					type="text"
																					value={exercise.weight}
																					onChange={(e) =>
																						handleExerciseChange(
																							index,
																							exIndex,
																							"weight",
																							e.target.value,
																						)
																					}
																					placeholder="e.g., 225 lbs"
																					className="w-full h-8 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
																				/>
																			</div>
																			<div>
																				<label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
																					Rest
																				</label>
																				<input
																					type="text"
																					value={exercise.rest}
																					onChange={(e) =>
																						handleExerciseChange(
																							index,
																							exIndex,
																							"rest",
																							e.target.value,
																						)
																					}
																					placeholder="e.g., 2 min"
																					className="w-full h-8 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
																				/>
																			</div>
																			<div>
																				<label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
																					Tempo
																				</label>
																				<input
																					type="text"
																					value={exercise.tempo}
																					onChange={(e) =>
																						handleExerciseChange(
																							index,
																							exIndex,
																							"tempo",
																							e.target.value,
																						)
																					}
																					placeholder="e.g., 3-1-1-0"
																					className="w-full h-8 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
																				/>
																			</div>
																			<div>
																				<label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
																					RIR
																				</label>
																				<input
																					type="text"
																					value={exercise.rir}
																					onChange={(e) =>
																						handleExerciseChange(
																							index,
																							exIndex,
																							"rir",
																							e.target.value,
																						)
																					}
																					placeholder="e.g., 2"
																					className="w-full h-8 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
																				/>
																			</div>
																		</div>

																		{/* Exercise Notes */}
																		<div>
																			<label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
																				Notes
																			</label>
																			<textarea
																				value={exercise.notes}
																				onChange={(e) =>
																					handleExerciseChange(
																						index,
																						exIndex,
																						"notes",
																						e.target.value,
																					)
																				}
																				placeholder="Exercise notes..."
																				rows="1"
																				className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-none"
																			></textarea>
																		</div>
																	</div>
																))}
															</div>
														)}
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							)}

							{/* Navigation Buttons */}
							<div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
								{currentPage === 1 && (
									<>
										<button
											type="button"
											onClick={() => navigate(-1)}
											className={secondaryButton}
										>
											Cancel
										</button>
										<button
											type="button"
											onClick={handleNext}
											className={primaryButton}
										>
											Next
											<span className="material-symbols-outlined text-lg">
												arrow_forward
											</span>
										</button>
									</>
								)}

								{currentPage === 2 && (
									<>
										<button
											type="button"
											onClick={handleBack}
											className={secondaryButton}
										>
											<span className="material-symbols-outlined text-lg">
												arrow_back
											</span>
											Back
										</button>
										<button
											type="submit"
											className={primaryButton}
											disabled={loading}
										>
											{loading ? (
												<>
													<span>
														{isEditing ? "Updating..." : "Creating..."}
													</span>
												</>
											) : (
												<>
													<span className="material-symbols-outlined text-lg">
														check_circle
													</span>
													{isEditing ? "Update Plan" : "Create Plan"}
												</>
											)}
										</button>
									</>
								)}
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

export default NewPlanForm;
