import CoachNavBar from "../components/CoachNavBar";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import ClientNavBar from "../components/ClientNavBar";
import Footer from "../components/Footer";
import ProgressModal from "../components/ProgressModal";

function PlanDetails() {
	const [plan, setPlan] = useState(null);
	const [loading, setLoading] = useState(true);
	const [openDay, setOpenDay] = useState(null);
	const [allWorkoutSessions, setAllWorkoutSessions] = useState([]);
	const [workoutSessions, setWorkoutSessions] = useState([]);
	const [trainingDaysCompleted, setTrainingDaysCompleted] = useState(0);
	const [currentWeek, setCurrentWeek] = useState(1);
	const [review, setReview] = useState("");
	const [progressModal, setProgressModal] = useState({
		isOpen: false,
		exercise: null,
		progress: null,
	});
	const { id, planId } = useParams();
	const cleanId = id?.trim();
	const role = localStorage.getItem("role");

	// Fetch ALL workout sessions (across all weeks) - used to calculate currentWeek
	useEffect(() => {
		const fetchAllWorkoutSessions = async () => {
			try {
				const token = localStorage.getItem("token");

				// Fetch all weeks' sessions for this plan
				const totalWeeks = plan?.weekNumber || 4;
				const allSessions = [];

				for (let week = 1; week <= totalWeeks; week++) {
					const response = await fetch(
						`http://localhost:8080/plans/${planId}/workoutSessions/${week}`,
						{
							method: "GET",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`,
							},
						},
					);

					if (response.ok) {
						const data = await response.json();
						allSessions.push(...(data.workoutSessions || []));
					}
				}

				setAllWorkoutSessions(allSessions);
			} catch (error) {
				console.error("Error fetching all workout sessions:", error);
			}
		};

		if (planId && plan) {
			fetchAllWorkoutSessions();
		}
	}, [planId, plan]);

	// Calculate current week based on ALL sessions
	useEffect(() => {
		const calculatedWeek = getCurrentWeekNumber(cleanId, planId);
		setCurrentWeek(calculatedWeek);
	}, [allWorkoutSessions, plan, cleanId, planId]);

	// Fetch workout sessions for the CURRENT week only (for display)
	useEffect(() => {
		const fetchCurrentWeekSessions = async () => {
			try {
				const token = localStorage.getItem("token");

				const sessionsResponse = await fetch(
					`http://localhost:8080/plans/${planId}/workoutSessions/${currentWeek}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					},
				);
				if (sessionsResponse.ok) {
					const sessionsData = await sessionsResponse.json();
					setWorkoutSessions(sessionsData.workoutSessions || []);
				}
			} catch (error) {
				console.error("Error fetching current week sessions:", error);
			}
		};

		if (planId && currentWeek) {
			fetchCurrentWeekSessions();
		}
	}, [planId, currentWeek]);

	useEffect(() => {
		const fetchPlanDetails = async () => {
			try {
				const token = localStorage.getItem("token");

				const response = await fetch(
					`http://localhost:8080/clients/${cleanId}/plan/${planId}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					},
				);
				if (!response.ok) {
					throw new Error("Failed to fetch plan details");
				}
				const data = await response.json();
				setPlan(data.plan);
			} catch (error) {
				console.error("Error fetching plan details:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchPlanDetails();
	}, [cleanId, planId]);

	// Update trainingDaysCompleted whenever workoutSessions changes
	useEffect(() => {
		const completedCount = workoutSessions.filter(
			(session) =>
				session.exercises &&
				session.exercises.length > 0 &&
				session.exercises.every((ex) => ex.completed === true),
		).length;
		setTrainingDaysCompleted(completedCount);
	}, [workoutSessions]);

	const startWorkoutHandler = async (trainingDayId) => {
		try {
			const token = localStorage.getItem("token");
			const trainingDay = plan?.trainingDays?.find(
				(day) => day._id === trainingDayId,
			);

			if (!trainingDay) {
				throw new Error("Training day not found");
			}

			const response = await fetch(`http://localhost:8080/workoutSessions`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					client: cleanId,
					plan: planId,
					trainingDay: trainingDayId,
					weekNumber: currentWeek,
					status: "In Progress",
					exercises: trainingDay.exercises.map((exercise) => ({
						exercise: exercise._id,
						completed: false,
						sets: [],
					})),
				}),
			});
			if (!response.ok) {
				const errorData = await response.json();
				console.error("Server error:", errorData);
				throw new Error(errorData.message || "Failed to start workout session");
			}
			const data = await response.json();
			console.log("Workout session started:", data);
			const newSession = data.workoutSession;

			// Update both workoutSessions and allWorkoutSessions
			setWorkoutSessions((prev) => [...prev, newSession]);
			setAllWorkoutSessions((prev) => [...prev, newSession]);
		} catch (error) {
			console.error("Error starting workout session:", error);
		}
	};

	const completeExerciseHandler = (trainingDayId, exerciseId) => {
		try {
			// Find the workout session for this training day
			const workoutSession = workoutSessions.find(
				(session) =>
					session.trainingDay === trainingDayId ||
					session.trainingDay?._id === trainingDayId,
			);

			if (!workoutSession) {
				console.error("No workout session found for this training day");
				return;
			}

			// Find the exercise index in the session using multiple comparison methods
			let exerciseIndex = workoutSession.exercises.findIndex(
				(ex) => ex.exercise === exerciseId,
			);

			if (exerciseIndex === -1) {
				exerciseIndex = workoutSession.exercises.findIndex(
					(ex) => String(ex.exercise) === String(exerciseId),
				);
			}

			if (exerciseIndex === -1) {
				exerciseIndex = workoutSession.exercises.findIndex(
					(ex) => ex.exercise?._id === exerciseId,
				);
			}

			if (exerciseIndex === -1) {
				console.error("Exercise not found in session");
				return;
			}

			// Open modal with exercise info (don't update yet)
			setProgressModal({
				isOpen: true,
				exercise: { workoutSession, exerciseIndex, trainingDayId, exerciseId },
				reps: null,
				sets: null,
				weight: null,
			});
		} catch (error) {
			console.error("Error in completeExerciseHandler:", error);
		}
	};

	const confirmProgress = async () => {
		try {
			const token = localStorage.getItem("token");
			const { workoutSession, exerciseIndex } = progressModal.exercise;

			// Create updated exercises array with the exercise marked as completed
			const updatedExercises = [...workoutSession.exercises];
			
			// Get existing progress array or initialize empty
			const existingProgress = updatedExercises[exerciseIndex].progress || [];
			
			updatedExercises[exerciseIndex] = {
				...updatedExercises[exerciseIndex],
				completed: true,
				// Append new progress entry to the array instead of replacing
				progress: [
					...existingProgress,
					{
						reps: parseInt(progressModal.reps),
						sets: parseInt(progressModal.sets),
						weight: parseInt(progressModal.weight),
					}
				],
			};

			// Send PATCH request to update the workout session
			const response = await fetch(
				`http://localhost:8080/workoutSessions/${workoutSession._id}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						exercises: updatedExercises,
					}),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Server error:", errorData);
				throw new Error(errorData.message || "Failed to update exercise");
			}

			// Use the server response instead of just local update
			const responseData = await response.json();
			const updatedSession = responseData.workoutSession;

			setWorkoutSessions((prev) =>
				prev.map((session) =>
					session._id === workoutSession._id ? updatedSession : session,
				),
			);

			setAllWorkoutSessions((prev) =>
				prev.map((session) =>
					session._id === workoutSession._id ? updatedSession : session,
				),
			);

			// Close modal
			setProgressModal({
				isOpen: false,
				exercise: null,
				reps: null,
				sets: null,
				weight: null,
			});
		} catch (error) {
			console.error("Error confirming progress:", error);
		}
	};

	const cancelProgress = () => {
		setProgressModal({
			isOpen: false,
			exercise: null,
			reps: null,
			sets: null,
			weight: null,
		});
	};

	const handleReview = async (e) => {
		e.preventDefault();
		try {
			const token = localStorage.getItem("token");

			if (!review || review.trim() === "") {
				console.error("Review cannot be empty");
				return;
			}

			const response = await fetch(
				`http://localhost:8080/plans/${planId}/week/${currentWeek}/feedback`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						client: cleanId,
						feedback: review,
					}),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				console.error("Server error:", errorData);
				throw new Error(errorData.message || "Failed to submit review");
			}

			// Clear the review after successful submission
			setReview("");
			console.log("Review submitted successfully");

			// Refresh plan data to show the submitted feedback
			const planResponse = await fetch(
				`http://localhost:8080/clients/${cleanId}/plan/${planId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (planResponse.ok) {
				const data = await planResponse.json();
				setPlan(data.plan);
			}
		} catch (error) {
			console.error("Error submitting review:", error);
		}
	};

	// Helper function to check if all exercises in a day are completed
	const areAllExercisesCompleted = (dayId) => {
		const sessionForDay = workoutSessions.find(
			(session) =>
				session.trainingDay === dayId || session.trainingDay?._id === dayId,
		);

		if (
			!sessionForDay ||
			!sessionForDay.exercises ||
			sessionForDay.exercises.length === 0
		) {
			return false;
		}

		return sessionForDay.exercises.every((ex) => ex.completed === true);
	};

	// Helper function to get the completion date of a training day
	const getCompletionDate = (dayId) => {
		const sessionForDay = workoutSessions.find(
			(session) =>
				session.trainingDay === dayId || session.trainingDay?._id === dayId,
		);

		if (!sessionForDay || !sessionForDay.updatedAt) {
			return null;
		}

		const date = new Date(sessionForDay.updatedAt);
		return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
	};

	const getCompletionDateWeek = (weekNo) => {
		if (!plan || !plan.startDate) return null;

		const trainingDaysCount = plan.trainingDays?.length || 0;

		const sessionsForWeek = allWorkoutSessions.filter((session) => {
			return (
				String(session.plan) === String(planId) &&
				String(session.client) === String(cleanId) &&
				session.weekNumber === weekNo
			);
		});

		if (sessionsForWeek.length === 0) return null;

		// Count how many training days in this week are fully completed
		const completedDays = sessionsForWeek.filter((session) => {
			return (
				session.exercises &&
				session.exercises.length > 0 &&
				session.exercises.every((ex) => ex.completed === true)
			);
		}).length;

		// Only show completion if ALL days in the week are completed
		if (completedDays === trainingDaysCount && trainingDaysCount > 0) {
			const completionDates = sessionsForWeek.map(
				(session) => new Date(session.updatedAt),
			);
			const latestCompletionDate = new Date(Math.max(...completionDates));
			return latestCompletionDate.toLocaleDateString("en-US", {
				day: "2-digit",
				month: "short",
			});
		}

		return null;
	};

	const getCurrentWeekNumber = (id, planId) => {
		if (!plan || !plan.startDate) return 1;

		const totalWeeks = plan.weekNumber || 4;
		const trainingDaysCount = plan.trainingDays?.length || 1;

		// Iterate through weeks to find the first incomplete one
		for (let week = 1; week <= totalWeeks; week++) {
			const sessionsForWeek = allWorkoutSessions.filter((session) => {
				return (
					String(session.plan) === String(planId) &&
					String(session.client) === String(id) &&
					session.weekNumber === week
				);
			});

			// Count how many training days in this week are fully completed
			const completedDays = sessionsForWeek.filter((session) => {
				return (
					session.exercises &&
					session.exercises.length > 0 &&
					session.exercises.every((ex) => ex.completed === true)
				);
			}).length;

			// If this week is not fully completed, return it as the current week
			if (completedDays < trainingDaysCount) {
				return week;
			}
		}

		// All weeks completed, stay on the last week
		return totalWeeks;
	};

	const weekClickHandler = (week) => {
		if (week === currentWeek) return; // Do nothing if the clicked week is the current week
		setCurrentWeek(week);
		setOpenDay(null); // Close any open day when switching weeks
	};

	// Tailwind
	const badge = "px-2 py-1 rounded text-xs font-bold uppercase tracking-wide";
	const button =
		"px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2";
	const primaryButton = `${button} bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary/90`;
	const cardStyle =
		"flex flex-col gap-4 p-6 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm";
	const sessionItem =
		"flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-100 transition-colors cursor-pointer group";

	return (
		<div className="overflow-x-hidden min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark font-display">
			{/* Top Navigation */}
			{role == "coach" ? <CoachNavBar /> : <ClientNavBar />}

			<main className="flex-1 flex flex-col items-center py-5 px-4 md:px-10 lg:px-40">
				<div className="flex flex-col max-w-[960px] w-full gap-6">
					{/* Breadcrumbs */}
					<div className="flex flex-wrap gap-2 text-sm">
						<Link
							className="text-text-secondary-light dark:text-text-secondary-dark font-medium hover:text-primary transition-colors"
							to={`/clientDetails/${id}`}
						>
							My Plans
						</Link>
						<span className="text-text-secondary-light dark:text-text-secondary-dark font-medium">
							/
						</span>
						<span className="text-text-primary-light dark:text-text-primary-dark font-medium">
							{plan?.title || "Loading..."}
						</span>
					</div>

					{/* Header Section */}
					<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
						<div className="flex flex-col gap-2">
							<h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
								{plan?.title || "Loading..."}
							</h1>
							<p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal flex items-center gap-2">
								<span className="material-symbols-outlined text-sm ml-1">
									calendar_today
								</span>{" "}
								Active since{" "}
								{plan?.startDate
									? new Date(plan.startDate).toLocaleDateString()
									: "Oct 1, 2023"}
							</p>
						</div>
					</div>

					{/* Stats & Progress Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Training Goal Card */}
						<div className={cardStyle}>
							<div className="flex items-center justify-between">
								<div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
									<span className="material-symbols-outlined">flag</span>
								</div>
								<span
									className={`${badge} ${plan?.status === "Active" ? "bg-green-100 text-green-800 dark:text-green-400" : "bg-red-100 text-red-800 dark:text-red-400"}`}
								>
									{plan?.status}
								</span>
							</div>
							<div>
								<p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium uppercase tracking-wider mb-1">
									Training Goal
								</p>
								<p className="text-2xl font-bold leading-tight">
									{plan?.mainGoal || "Loading..."}
								</p>
							</div>
						</div>

						{/* Session Progress Card */}
						<div className={`${cardStyle} justify-between`}>
							<div className="flex justify-between items-start">
								<div>
									<p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-medium uppercase tracking-wider mb-1">
										Session Progress
									</p>
									<p className="text-2xl font-bold leading-tight">
										{trainingDaysCompleted} of {plan?.trainingDays?.length || 0}{" "}
										Sessions
									</p>
								</div>
								<div className="text-right">
									<span className="text-primary font-bold text-lg">
										{plan?.trainingDays?.length
											? Math.round(
													(trainingDaysCompleted / plan.trainingDays.length) *
														100,
												)
											: 0}
										%
									</span>
								</div>
							</div>
							<div className="w-full bg-background-light dark:bg-background-dark rounded-full h-2.5 overflow-hidden">
								<div
									className="bg-primary h-2.5 rounded-full"
									style={{
										width: `${plan?.trainingDays?.length ? Math.round((trainingDaysCompleted / plan.trainingDays.length) * 100) : 0}%`,
									}}
								></div>
							</div>
							<div className="flex justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark">
								<span>Start</span>
								<span>Complete</span>
							</div>
						</div>
					</div>

					{/* Monthly Structure */}
					<div className="flex flex-col gap-4">
						<h3 className="text-xl font-bold">Monthly Structure</h3>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							{Array.from(
								{ length: plan?.weekNumber || 4 },
								(_, i) => i + 1,
							).map((week) => (
								<div
									key={week}
									className={`flex flex-col p-4 rounded-xl relative overflow-hidden group ${currentWeek === week ? "border-2 border-primary bg-surface-light dark:bg-surface-dark shadow-md shadow-primary/5" : "border border-border-light dark:border-border-dark bg-[#f8fafc] dark:bg-surface-dark/50"}`}
									onClick={() => {
										weekClickHandler(week);
									}}
								>
									{currentWeek === week && (
										<div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg uppercase">
											Current
										</div>
									)}
									<div className="absolute top-0 right-0 p-2">
										{getCompletionDateWeek(week) && (
											<span className="material-symbols-outlined text-green-600 bg-white dark:bg-surface-dark rounded-full p-1 text-sm shadow-sm">
												check
											</span>
										)}
									</div>
									<p className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-bold uppercase mb-2">
										Week {week}
									</p>
									<h4 className="text-lg font-bold mb-1">RPE {11 - week}</h4>
									{getCompletionDateWeek(week) && (
										<p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
											Completed on {getCompletionDateWeek(week)}
										</p>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Detailed Session List */}
					<div className="flex flex-col gap-4 mt-2">
						<div className="flex items-center justify-between">
							<h3 className="text-xl font-bold">Upcoming Sessions</h3>
						</div>
						<div className="flex flex-col rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-hidden">
							{/* Item 1 */}
							{plan?.trainingDays?.map((day, index) => (
								<div key={day._id}>
									<div
										className={`${sessionItem} ${openDay === day._id ? "bg-gray-100 border-2 border-primary rounded-t-lg" : ""}`}
										onClick={() => {
											setOpenDay(openDay === day._id ? null : day._id);
										}}
									>
										<div
											className={`flex size-12 items-center justify-center rounded-lg text-text-primary-light dark:text-text-primary-dark mr-4 transition-colors ${openDay === day._id ? "bg-primary/20 text-primary border-primary" : "bg-background-light dark:bg-background-dark group-hover:bg-primary/20 group-hover:text-primary"}`}
										>
											<span className="material-symbols-outlined">
												{day?.title?.includes("Cardio")
													? "directions_run"
													: "fitness_center"}
											</span>
										</div>
										<div className="flex flex-col flex-1">
											<p className="font-bold text-text-primary-light dark:text-text-primary-dark">
												{day?.title || "Loading..."}
											</p>
											<p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
												{day?.notes || ""}
											</p>
										</div>
										<div className="flex items-center gap-4">
											<span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark bg-background-light dark:bg-background-dark px-3 py-1 rounded-full">
												{areAllExercisesCompleted(day._id) ? (
													<span className="flex items-center gap-1 text-primary dark:text-primary font-semibold">
														<span className="material-symbols-outlined text-[18px]">
															check_circle
														</span>
														Completed {getCompletionDate(day._id)}
													</span>
												) : (
													<span></span>
												)}
											</span>
											<span className="material-symbols-outlined">
												{openDay === day._id ? "expand_less" : "expand_more"}
											</span>
										</div>
									</div>

									{/* Exercises Below */}
									{openDay === day._id && (
										<div className="border-t-2 border-b-2 p-5">
											{role == "client" && (
												<>
													{!workoutSessions.some(
														(session) =>
															session.trainingDay === day._id ||
															session.trainingDay?._id === day._id,
													) && (
														<div className="flex justify-end mb-4">
															<button
																className={primaryButton}
																onClick={() => {
																	startWorkoutHandler(day._id);
																}}
															>
																Start Workout
															</button>
														</div>
													)}
												</>
											)}
											{day?.exercises && day.exercises.length > 0 ? (
												day.exercises.map((exercise) => (
													<div
														key={exercise._id}
														className="rounded-lg p-4 mb-3 border border-gray-500 flex items-center justify-between gap-4"
													>
														<div className="flex-1">
															<h4 className="font-bold text-text-primary-light dark:text-text-primary-dark">
																{exercise.reps} {exercise.name}{" "}
																{exercise.weight ? `+${exercise.weight}kg` : ""}{" "}
																x{exercise.sets}
															</h4>

															{exercise.tempo && (
																<p className="text-md text-text-secondary-light dark:text-text-secondary-dark mt-2">
																	Tempo: {exercise.tempo}
																</p>
															)}
															<p className="text-md text-text-secondary-light dark:text-text-secondary-dark">
																Rest: {exercise.rest}
															</p>
															{exercise.notes && (
																<p className="text-md text-text-secondary-light dark:text-text-secondary-dark">
																	Notes: {exercise.notes}
																</p>
															)}
														</div>

														{role == "client" && (
															<>
																{(() => {
																	// Find the workout session for this training day
																	const sessionForDay = workoutSessions.find(
																		(session) =>
																			session.trainingDay === day._id ||
																			session.trainingDay?._id === day._id,
																	);

																	// Find this exercise in the session
																	const sessionExercise =
																		sessionForDay?.exercises?.find(
																			(ex) =>
																				ex.exercise === exercise._id ||
																				ex.exercise?._id === exercise._id ||
																				String(ex.exercise) ===
																					String(exercise._id),
																		);

																	const isCompleted =
																		sessionExercise?.completed;

																	// Get the latest progress entry (progress is now an array)
																	const latestProgress = sessionExercise?.progress?.[sessionExercise.progress.length - 1];

																	return (
																		<>
																			{isCompleted &&
																				latestProgress && (
																					<p className="text-sm text-text-secondary-light dark:text-primary">
																						{latestProgress.reps}{" "}
																						{latestProgress.weight
																							? "+" +
																								latestProgress.weight +
																								"kg"
																							: ""}{" "}
																						{latestProgress.sets
																							? "x" +
																								latestProgress.sets
																							: ""}
																					</p>
																				)}
																			<button
																				className={`${primaryButton} ${isCompleted ? "opacity-50 cursor-not-allowed" : ""}`}
																				onClick={() =>
																					completeExerciseHandler(
																						day._id,
																						exercise._id,
																					)
																				}
																				disabled={isCompleted}
																			>
																				<span className="material-symbols-outlined text-sm">
																					{isCompleted
																						? "check_circle"
																						: "check"}
																				</span>
																			</button>
																		</>
																	);
																})()}
															</>
														)}
													</div>
												))
											) : (
												<p className="text-text-secondary-light dark:text-text-secondary-dark">
													No exercises added yet
												</p>
											)}
										</div>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Review Section */}
					<div className="mt-4 p-6 rounded-xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-sm">
						<div className="flex flex-col gap-4">
							<div className="flex items-center gap-3 mb-2">
								<div className="bg-primary/10 p-2 rounded-full text-primary">
									<span className="material-symbols-outlined">rate_review</span>
								</div>
								<h3 className="text-xl font-bold">Week Check-in</h3>
							</div>

							{plan && plan.weekFeedback?.find(
								(wf) => wf.weekNumber === currentWeek,
							) ? (
								<div className="p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
									<p className="text-text-primary-light dark:text-text-primary-dark">
										{
											plan.weekFeedback.find(
												(wf) => wf.weekNumber === currentWeek,
											)?.feedback
										}
									</p>
								</div>
							) : role === 'client' ? (
								<>
									<label className="flex flex-col gap-2">
										<span className="text-base font-medium leading-normal text-text-primary-light dark:text-text-primary-dark">
											How is the plan going so far?
										</span>
										<textarea
											name="review"
											value={review || ""}
											onChange={(e) => setReview(e.target.value)}
											className="w-full min-h-[120px] rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark p-4 text-base text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light dark:placeholder-text-secondary-dark focus:border-primary focus:ring-1 focus:ring-primary resize-none transition-all"
											placeholder="Share your thoughts with your coach..."
										></textarea>
									</label>
									<div className="flex justify-end pt-2">
										<button
											className={`${primaryButton} transform active:scale-95`}
											onClick={(e) => handleReview(e)}
											disabled={
												!workoutSessions || workoutSessions.length === 0
											}
										>
											<span>Submit Review</span>
											<span className="material-symbols-outlined text-sm">
												send
											</span>
										</button>
									</div>
								</>
							) : <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
									<p className="text-text-primary-light dark:text-text-primary-dark">
										No Feedback Yet...
									</p>
								</div>}
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<Footer />

			<ProgressModal
				isOpen={progressModal.isOpen}
				onConfirm={confirmProgress}
				onCancel={cancelProgress}
				progressModal={progressModal}
				setProgressModal={setProgressModal}
			/>
		</div>
	);
}
export default PlanDetails;
