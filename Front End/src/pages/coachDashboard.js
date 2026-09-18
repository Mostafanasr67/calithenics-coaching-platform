import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClientCard from "../components/ClientCard";
import StatsCard from "../components/StatsCard";
import CoachNavBar from "../components/CoachNavBar";
import ConfirmModal from "../components/ConfirmModal";
import Footer from "../components/Footer";

function CoachDashboard() {
	const navigate = useNavigate();
	const [clients, setClients] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [totalClients, setTotalClients] = useState(0);
	const [activeClients, setActiveClients] = useState(0);
	const [filterType, setFilterType] = useState("all");
	const [deleteModal, setDeleteModal] = useState({ isOpen: false, client: null});

	const primaryButton =
		"flex items-center gap-2 justify-center rounded-lg h-12 px-6 bg-primary text-white text-base font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 hover:-translate-y-0.5 transition-all duration-200";

	const calculateExpiresDate = (startDate, duration) => {
		if (!startDate || !duration) return null;
		const date = new Date(startDate);
		date.setDate(date.getDate() + parseInt(duration) * 7);
		return date;
	};

	const sortClientsByExpiry = (clientsList) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		return clientsList
			.map((client) => {
				const expiryDate = calculateExpiresDate(
					client.startDate,
					client.duration,
				);
				const isExpired = expiryDate && expiryDate < today;

				// Automatically mark as Inactive if expired
				if (isExpired && client.state !== "Inactive") {
					return { ...client, state: "Inactive" };
				}
				return client;
			})
			.sort((a, b) => {
				const expiryA = calculateExpiresDate(a.startDate, a.duration);
				const expiryB = calculateExpiresDate(b.startDate, b.duration);

				// Handle null values
				if (!expiryA) return -1;
				if (!expiryB) return 1;

				const isExpiredA = expiryA < today;
				const isExpiredB = expiryB < today;

				// Active clients first, expired clients at the end
				if (!isExpiredA && isExpiredB) return -1;
				if (isExpiredA && !isExpiredB) return 1;

				// If both expired or both not expired, sort by expiry date
				return expiryB - expiryA;
			});
	};

	function handleDeleteClient(clientId, clientStatus) {
		fetch(`http://localhost:8080/clients/${clientId}`, {
			method: "DELETE",
			headers: {
				Authorization: localStorage.getItem("token")
					? `Bearer ${localStorage.getItem("token")}`
					: "",
				"Content-Type": "application/json",
			},
		})
			.then((res) => {
				if (!res.ok) throw new Error("Failed to delete client");
				// Remove the deleted client from the state
				setClients((prevClients) =>
					prevClients.filter((c) => c._id !== clientId),
				);
				setTotalClients((prevTotal) => prevTotal - 1);
				if (clientStatus === "Active") {
					setActiveClients((prevActive) => prevActive - 1);
				}
			})
			.catch((err) => {
				console.error("Error deleting client:", err);
			});
	}

	useEffect(() => {
		const fetchClients = async () => {
			try {
				setLoading(true);
				const token = localStorage.getItem("token");
				const response = await fetch("http://localhost:8080/clients", {
					headers: {
						Authorization: token ? `Bearer ${token}` : "",
						"Content-Type": "application/json",
					},
				});
				if (!response.ok) {
					throw new Error("Failed to fetch clients");
				}
				const data = await response.json();

				// Check for expired clients and update their status
				const today = new Date();
				today.setHours(0, 0, 0, 0);

				const expiredClientsToUpdate = data.filter((client) => {
					if (client.status === "Active" && client.startDate && client.duration) {
						const expiryDate = new Date(client.startDate);
						expiryDate.setDate(expiryDate.getDate() + parseInt(client.duration) * 7);
						return expiryDate < today;
					}
					return false;
				});

				// Update expired clients to "Inactive" in the database
				if (expiredClientsToUpdate.length > 0) {
					await Promise.all(
						expiredClientsToUpdate.map((client) =>
							fetch(`http://localhost:8080/clients/${client._id}`, {
								method: "PATCH",
								headers: {
									Authorization: token ? `Bearer ${token}` : "",
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ status: "Inactive" }),
							})
						)
					);
					
				}

				setTotalClients(data.length);
				const activeCount = data.filter(
					(client) => client.status === "Active",
				).length;
				setActiveClients(activeCount);

				// Sort clients by expiry date before setting
				const sortedClients = sortClientsByExpiry(data);
				setClients(sortedClients);
				setError(null);
			} catch (err) {
				console.error("Error fetching clients:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchClients();
	}, []);

	const handleDeleteClick = (clientId, clientName, clientStatus) => {
		setDeleteModal({ isOpen: true, client: { clientId, clientName, clientStatus } });
	};

	const handleConfirmDelete = () => {
		if (deleteModal.client) {
			handleDeleteClient(deleteModal.client.clientId, deleteModal.client.clientStatus);
			setDeleteModal({ isOpen: false, client: null });
		}
	};

	const handleCancelDelete = () => {
		setDeleteModal({ isOpen: false, client: null });
	};

	return (
		<div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
			{/* Navbar */}
			<CoachNavBar />
			<main className="flex-1 px-4 py-8 md:px-10 lg:px-40">
				<div className="mx-auto max-w-6xl flex flex-col gap-8">
					{/* Page Heading & Actions */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
						<div className="flex flex-col gap-2">
							<h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-900">
								My Roster
							</h1>
							<p className="text-slate-500 dark:text-slate-400 text-base font-normal">
								Manage your clients and their training plans
							</p>
						</div>
						<button
							onClick={() => navigate("/newClient")}
							className={primaryButton}
						>
							<span className="material-symbols-outlined text-[20px]">add</span>
							<span className="truncate">Add New Client</span>
						</button>
					</div>

					{/* Stats Overview */}
					<StatsCard
						totalClients={totalClients}
						activeClients={activeClients}
						onFilterChange={setFilterType}
						currentFilter={filterType}
					/>
					{/* Client List Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{loading ? (
							<div className="col-span-full text-center py-8">
								<p className="text-slate-500 dark:text-slate-400">
									Loading clients...
								</p>
							</div>
						) : error ? (
							<div className="col-span-full text-center py-8">
								<p className="text-red-500">Error: {error}</p>
							</div>
						) : clients.length === 0 ? (
							<div className="col-span-full text-center py-8">
								<p className="text-slate-500 dark:text-slate-400">
									No clients found
								</p>
							</div>
						) : (
							clients
								.filter(
									(client) => filterType === "all" || client.status === "Active",
								)
								.map((client) => (
									<ClientCard
										key={client._id}
										id={client._id}
										state={client.status}
										fullName={client.name}
										programFocus={client.primaryGoal}
										startDate={client.startDate}
										duration={client.duration}
										onCardClick={() => navigate(`/clientDetails/${client._id}`)}
										onEditClick={() => navigate(`/newClient/${client._id}`)}
										onDeleteClick={() =>
											handleDeleteClick(client._id, client.name)
										}
									/>
								))
						)}
					</div>
				</div>
			</main>
			{/* Footer */}
			<Footer />

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={deleteModal.isOpen}
				title="Delete Client"
				message={`Are you sure you want to delete ${deleteModal.client?.clientName}? This action cannot be undone.`}
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
				confirmText="Delete"
				cancelText="Cancel"
				isDangerous={true}
			/>
		</div>
	);
}

export default CoachDashboard;
