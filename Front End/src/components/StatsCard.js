const statCard =
	"flex flex-col gap-1 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm";
const iconButton = "flex items-center gap-2 text-slate-500 dark:text-slate-400";

function StatsCard({ totalClients, activeClients, onFilterChange, currentFilter }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<button 
				onClick={() => onFilterChange("all")}
				className={`${statCard} cursor-pointer hover:shadow-md hover:border-primary/50 transition-all ${currentFilter === "all" ? "border-primary bg-primary/5" : ""}`}
			>
				<div className={iconButton}>
					<span className="material-symbols-outlined text-[20px]">groups</span>
					<p className="text-sm font-medium">Total Clients</p>
				</div>
				<div className="flex items-end gap-3 mt-1">
					<p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
						{totalClients}
					</p>
				</div>
			</button>
			<button 
				onClick={() => onFilterChange("active")}
				className={`${statCard} cursor-pointer hover:shadow-md hover:border-primary/50 transition-all ${currentFilter === "active" ? "border-primary bg-primary/5" : ""}`}
			>
				<div className={iconButton}>
					<span className="material-symbols-outlined text-[20px]">
						fitness_center
					</span>
					<p className="text-sm font-medium">Active Plans</p>
				</div>
				<div className="flex items-end gap-3 mt-1">
					<p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
						{activeClients}
					</p>
				</div>
			</button>
		</div>
	);
}

export default StatsCard;