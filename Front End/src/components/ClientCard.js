const cardStyle =
	"group flex flex-col bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300";
const secondaryButton =
	"flex-1 py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors";
const primaryTextButton =
	"flex-1 py-2 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm transition-colors";

function ClientCard({ id, state, fullName, programFocus, secondaryGoal, startDate, duration, onCardClick, onEditClick, onDeleteClick }) {
	const formatDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		const day = String(date.getDate()).padStart(2, "0");
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const year = date.getFullYear();
		return `${day}-${month}-${year}`;
	};

	const calculateExpiresDate = () => {
		if (!startDate || !duration) return null;
		const date = new Date(startDate);
		date.setDate(date.getDate() + parseInt(duration) * 7); // duration is in weeks
		return date.toISOString().split('T')[0];
	};

	const getStateBadgeColor = () => {
		switch (state) {
			case "Active":
				return "bg-green-500 text-white";
			case "Inactive":
				return "bg-red-500 text-white";
			default:
				return "bg-gray-500 text-white";
		}
	};

	const getDotColor = () => {
		switch (state) {
			case "Active":
				return "bg-green-500";
			case "Inactive":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	return (
		<div className={`${cardStyle} cursor-pointer`} >
			<div className="relative h-32 bg-slate-100 dark:bg-slate-700" onClick={onCardClick}>
				<div
					className="absolute inset-0 bg-cover bg-center opacity-80"
					style={{
						backgroundImage:
							'url("https://lh3.googleusercontent.com/aida-public/AB6AXuChCIq0XfamBMMF_gASEnHT9HpVAoC9tOLyvnjXcLcJRKGbYqND9IFEk2JjDo8Ur2MfZylGZy_IjPO79agWFGRf8eK6mTnAuQc6Ki2Dx7tgxgd5oi8ObE4Qln6svRaEmFuvBdcvMvDMby7RqZ7mwwDnIQ0CyLG88p6t9dWh23hM9vveaenz-gbQL9k3pj0RFfnmynOtv4T_zwq9Q6AftwPdeHt5xE8Dwi-fWCPov3ZLjkzcJboPb345NSLZDR9L3cp22-TWG5THS3A")',
					}}
				></div>
				<div className="absolute top-3 right-3 flex items-center gap-2">
					<span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStateBadgeColor()}`}>
						<span className={`size-1.5 rounded-full ${getDotColor()} animate-pulse`}></span>
						{state}
					</span>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onEditClick && onEditClick();
						}}
						title="Edit client"
						className="w-9 h-9 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-primary/10 transition-colors"
					>
						<span className="material-symbols-outlined text-[18px]">edit</span>
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onDeleteClick && onDeleteClick();
						}}
						title="Delete client"
						className="w-9 h-9 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-primary/10 transition-colors"
					>
						<span className="material-symbols-outlined text-[18px]">delete</span>
					</button>
				</div>
			</div>
			<div className="px-5 pt-0 pb-5 flex flex-col grow">
				
				<div className="flex justify-between items-start mb-2" onClick={onCardClick}>
					<div>
						<h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">
							{fullName}
						</h3>
						<p className="text-sm text-slate-500 dark:text-slate-400">
							{programFocus}
						</p>
						{secondaryGoal && (
							<p className="text-xs text-slate-400 dark:text-slate-500">
								• {secondaryGoal}
							</p>
						)}
					</div>
				</div>
			<div className="flex flex-col gap-3 text-xs text-slate-400 mb-6">
				{calculateExpiresDate() && (
					<div className="flex items-center gap-2">
						<span className="material-symbols-outlined text-[16px]">
							calendar_today
						</span>
						<span>Expires {formatDate(calculateExpiresDate())}</span>
					</div>
				)}
				</div>
				<div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-3">
					
					<button className={primaryTextButton} onClick={onCardClick}>View Plans</button>
				</div>
			</div>
		</div>
	);
}

export default ClientCard;
