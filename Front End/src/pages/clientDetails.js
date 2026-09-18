import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CoachNavBar from "../components/CoachNavBar";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ClientNavBar from "../components/ClientNavBar";
import Footer from "../components/Footer";
import ConfirmModal from "../components/ConfirmModal";

function ClientDetails() {
	const { id } = useParams();
	const cleanId = id?.trim();
	const [clientData, setClientData] = useState(null);
	const [plans, setPlans] = useState([]);
	const [carouselIndex, setCarouselIndex] = useState(0);
	const [loggedInUserRole, setLoggedInUserRole] = useState(null);
	const navigate = useNavigate();
	const [deleteModal, setDeleteModal] = useState({ isOpen: false, planId: null, planTitle: null });

	useEffect(() => {
		const role = localStorage.getItem('role');
		setLoggedInUserRole(role);
	}, []);

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		const monthNames = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];
		const month = monthNames[date.getMonth()];
		const year = date.getFullYear();
		return `${month} ${year}`;
	};

	useEffect(() => {
		const fetchClientData = async () => {
			try {
				const token = localStorage.getItem("token");
				const response = await fetch(`http://localhost:8080/clients/${cleanId}`, {
					headers: {
						Authorization: token ? `Bearer ${token}` : "",
						"Content-Type": "application/json",
					},
				});

				if (!response.ok) {
					const errorData = await response.json();
					console.error("Server error:", errorData);
					throw new Error(errorData.message || "Failed to fetch clients");
				}
				const data = await response.json();
				setClientData(data);
			} catch (error) {
				console.error("Error fetching client data:", error);
			}
		};

		const fetchPlans = async () => {
			try {
				const token = localStorage.getItem("token");
				const response = await fetch(
					`http://localhost:8080/clients/${cleanId}/plan`,
					{
						headers: {
							Authorization: token ? `Bearer ${token}` : "",
							"Content-Type": "application/json",
						},
					},
				);

				if (response.ok) {
					const data = await response.json();
					// Handle both single plan and array of plans
					if (data.plan) {
						const planArray = Array.isArray(data.plan)
							? data.plan
							: [data.plan];
						
						setPlans(sortPlansByExpiry(planArray));
					} else if (Array.isArray(data)) {
						setPlans(sortPlansByExpiry(data));
					} else {
						setPlans([]);
					}
				}
			} catch (error) {
				console.error("Error fetching plans:", error);
				setPlans([]);
			}
		};

		fetchClientData();
		fetchPlans();
	}, [cleanId]);

	const sortPlansByExpiry = (plans) => {
		return plans.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
	}

	const handleDeletePlan = async (planId) => {
		try {
			const token = localStorage.getItem("token");
			const response = await fetch(
				`http://localhost:8080/clients/${cleanId}/plan/${planId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: token ? `Bearer ${token}` : "",
						"Content-Type": "application/json",
					},
				},
			);

			if (response.ok) {
				setPlans((prevPlans) =>
					prevPlans.filter((plan) => plan._id !== planId),
				);
			} else {
				console.error("Failed to delete plan");
			}
		} catch (error) {
			console.error("Error deleting plan:", error);
		}
	};

	const handleDeleteClick = (planId, planTitle) => {
		setDeleteModal({ isOpen: true, planId, planTitle });
	}

	const handleConfirmDelete = () => {
		if (deleteModal.planId) {
			handleDeletePlan(deleteModal.planId);
		}
		setDeleteModal({ isOpen: false, planId: null, planTitle: null });
	}

	const handleCancelDelete = () => {
		setDeleteModal({ isOpen: false, planId: null, planTitle: null });
	}

	// Common class variables
	const navLink =
		"text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors";
	const badge =
		"inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold";
	const button =
		"inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all";
	const primaryButton = `${button} bg-primary text-white hover:bg-primary-dark`;
	const secondaryButton = `${button} bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark hover:bg-border-light dark:hover:bg-border-dark`;

	return (
		<div className="bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark font-display antialiased min-h-screen flex flex-col">
			{/* Top Navigation */}
			{loggedInUserRole === 'coach' ? <CoachNavBar /> : <ClientNavBar />}

			<main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
				{/* Client Header Card */}
				<div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6 sm:p-8">
					<div className="flex flex-col md:flex-row gap-6 md:gap-8 md:items-start">
						<div className="flex-grow flex flex-col justify-center">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
								<div>
									<h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
										{clientData?.name || "Loading..."}
									</h1>
									<div className="flex items-center gap-2 mt-1">
										<span
											className={`${badge} bg-green-100 text-green-800 dark:text-green-400`}
										>
											{clientData?.status}
										</span>
										<span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
											• Active since {formatDate(clientData?.createdAt)}
										</span>
									</div>
								</div>
								<div className="flex gap-3">
									
								{loggedInUserRole === 'coach' && <Link
										to={`/newClient/${clientData?._id}`}
										className={primaryButton}
									>
										<span className="material-symbols-outlined text-[20px]">
											edit
										</span>
										Edit Profile
									</Link>}
								</div>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 border-t border-border-light dark:border-border-dark pt-6">
								<div>
									<p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
										Primary Goal
									</p>
									<p className="mt-1 text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
										{clientData?.primaryGoal || "N/A"}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
										Secondary Goal
									</p>
									<p className="mt-1 text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
										{clientData?.secondaryGoal || "N/A"}
									</p>
								</div>
								<div>
									<p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
										Duration
									</p>
									<p className="mt-1 text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
										{clientData?.duration || "N/A"}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Performance Numbers Section */}
				<section className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
							Current Performance
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Max Reps Section */}
						<div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
							<p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-4">
								Max Reps
							</p>
							<div className="space-y-3">
								<div>
									<span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
										Muscle Ups
									</span>
									<p className="text-2xl font-bold text-primary">
										{clientData?.test?.maxMuscleUps || 0}
									</p>
								</div>
								<div>
									<span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
										Dips
									</span>
									<p className="text-2xl font-bold text-primary">
										{clientData?.test?.maxDips || 0}
									</p>
								</div>
								<div>
									<span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
										Pull Ups
									</span>
									<p className="text-2xl font-bold text-primary">
										{clientData?.test?.maxPullUps || 0}
									</p>
								</div>
								<div>
									<span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
										Push Ups
									</span>
									<p className="text-2xl font-bold text-primary">
										{clientData?.test?.maxPushUps || 0}
									</p>
								</div>
							</div>
						</div>

						{/* 1RM Section */}
						<div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
							<p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-4">
								1 Rep Max
							</p>
							<div className="space-y-3">
								<div>
									<span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
										Muscle Ups
									</span>
									<p className="text-2xl font-bold text-primary">
										{clientData?.test?.oneRepMaxMuscleUps || 0}
									</p>
								</div>
								<div>
									<span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
										Dips
									</span>
									<p className="text-2xl font-bold text-primary">
										{clientData?.test?.oneRepMaxDips || 0}
									</p>
								</div>
								<div>
									<span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
										Pull Ups
									</span>
									<p className="text-2xl font-bold text-primary">
										{clientData?.test?.oneRepMaxPullUps || 0}
									</p>
								</div>
							</div>
						</div>

						{/* Physical Stats Section */}
						<div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark p-6">
							<p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-4">
								Physical Stats
							</p>
							<div className="space-y-3">
								<div>
									<span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
										Weight
									</span>
									<p className="text-2xl font-bold text-primary">
										{clientData?.weight || "N/A"}{" "}
										<span className="text-sm">kg</span>
									</p>
								</div>
								<div>
									<span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
										Height
									</span>
									<p className="text-2xl font-bold text-primary">
										{clientData?.height || "N/A"}{" "}
										<span className="text-sm">cm</span>
									</p>
								</div>
								<div>
									<span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
										Age
									</span>
									<p className="text-2xl font-bold text-primary">
										{clientData?.age || "N/A"}
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Plan History Grid */}
				<section className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
							Training History
						</h2>
						<div className="flex gap-2">
							{loggedInUserRole === 'coach' && <Link
								to={`/newPlan/${clientData?._id}`}
								className={primaryButton}
							>
								<span className="material-symbols-outlined text-[20px]">
									add
								</span>
								Create Plan
							</Link>}
						</div>
					</div>

					{plans.length === 0 ? (
						<div className="text-center py-12 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark">
							<p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
								No training plans yet
							</p>
						{loggedInUserRole === 'coach' && <Link
								to={`/newPlan/${clientData?._id}`}
								className={primaryButton}
							>
								<span className="material-symbols-outlined">add</span>
								Create First Plan
							</Link>}
						</div>
					) : (
						<div className="relative">
							{/* Carousel Container */}
							<div className="overflow-hidden">
								<div
									className="flex transition-transform duration-300 ease-in-out"
									style={{
										transform: `translateX(-${carouselIndex * (100 / 3)}%)`,
									}}
								>
									{plans.map((plan) => (
										<div
											key={plan._id}
											className="w-1/3 flex-shrink-0 px-3 cursor-pointer"
										>
											<div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-border-light dark:border-border-dark overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
												<div className="p-5 flex-grow">
													<div className="flex justify-between items-start mb-4">
														<div
															onClick={() =>
																navigate(
																	`/clients/${cleanId}/planDetails/${plan._id}`,
																)
															}
														>
															<h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
																{plan.title}
															</h3>
															<p className="text-lg text-text-secondary-light dark:text-text-secondary-dark mt-5 font-bold">
																{plan.mainGoal}
															</p>
														</div>
														<div className="flex items-center gap-3">
															<span
																className={`${badge} ${plan?.status === "Active" ? "bg-green-100 text-green-800 dark:text-green-400" : "bg-red-100 text-red-800 dark:text-red-400"}`}
															>
																{plan?.status}
															</span>
														{loggedInUserRole === 'coach' && <Link
																className="p-2 rounded-lg text-primary hover:bg-primary hover:text-white transition-all"
																title="Edit Plan"
																to={`/newPlan/${clientData?._id}/${plan._id}`}
															>
																<span className="material-symbols-outlined text-[20px]">
																	edit
																</span>
															</Link>}
														{loggedInUserRole === 'coach' && <Link
																className="p-2 rounded-lg text-primary hover:bg-primary hover:text-white transition-all"
																title="View Plan"
																onClick={() => handleDeleteClick(plan._id, plan.title)}
															>
																<span className="material-symbols-outlined text-[20px]">
																	delete
																</span>
															</Link>}
														</div>
													</div>
													<div
														className="space-y-4"
														onClick={() =>
															navigate(`/clients/${cleanId}/planDetails/${plan._id}`)
														}
													>
														<div>
															<div className="flex text-md font-bold mb-2">
																<span className="text-text-secondary-light dark:text-text-secondary-dark mr-2">
																	Duration:
																</span>
																<span className="font-medium text-text-primary-light dark:text-text-primary-dark">
																	{new Date(
																		plan.startDate,
																	).toLocaleDateString()}{" "}
																	-{" "}
																	{new Date(plan.endDate).toLocaleDateString()}
																</span>
															</div>
														</div>
														<div className="pt-2">
															<p className="text-md font-bold text-text-secondary-light dark:text-text-secondary-dark mb-1">
																Training Days: {plan.trainingDays?.length || 0}
															</p>
														</div>
													</div>
												</div>
												<div className="bg-background-light dark:bg-background-dark px-5 py-3 border-t border-border-light dark:border-border-dark flex justify-between items-center">
													<span className="text-xs text-text-secondary-light dark:text-text-secondary-dark"></span>
													<Link
														to={`/clients/${cleanId}/planDetails/${plan._id}`}
														className="text-sm font-medium text-primary hover:text-primary-dark"
													>
														View Details →
													</Link>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Carousel Navigation */}
							{plans.length > 3 && (
								<div className="flex justify-between items-center mt-4">
									<button
										onClick={() =>
											setCarouselIndex(Math.max(0, carouselIndex - 1))
										}
										disabled={carouselIndex === 0}
										className="p-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
									>
										<span className="material-symbols-outlined">
											chevron_left
										</span>
									</button>
									<div className="flex gap-1">
										{Array.from({ length: Math.ceil(plans.length / 3) }).map(
											(_, i) => (
												<button
													key={i}
													onClick={() => setCarouselIndex(i)}
													className={`h-2 rounded-full transition-all ${
														carouselIndex === i
															? "bg-primary w-6"
															: "bg-border-light dark:bg-border-dark w-2"
													}`}
												></button>
											),
										)}
									</div>
									<button
										onClick={() =>
											setCarouselIndex(
												Math.min(
													Math.ceil(plans.length / 3) - 1,
													carouselIndex + 1,
												),
											)
										}
										disabled={carouselIndex === Math.ceil(plans.length / 3) - 1}
										className="p-2 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:bg-background-light dark:hover:bg-background-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
									>
										<span className="material-symbols-outlined">
											chevron_right
										</span>
									</button>
								</div>
							)}
						</div>
					)}
				</section>
			</main>

			<Footer />

			<ConfirmModal
				isOpen={deleteModal.isOpen}
				title="Delete Plan"
				message={`Are you sure you want to delete ${deleteModal.planTitle}? This action cannot be undone.`}
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
				confirmText="Delete"
				cancelText="Cancel"
				isDangerous={true}
			/>
		</div>
	);
}

export default ClientDetails;
