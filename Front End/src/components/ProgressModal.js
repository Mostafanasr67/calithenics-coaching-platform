function ProgressModal({
	isOpen,
	onConfirm,
	onCancel,
	confirmText = "Submit",
	cancelText = "Cancel",
    progressModal, 
    setProgressModal
}) {
	if (!isOpen) return null;

	const dangerButton =
		"flex-1 py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors";
	const safeButton =
		"flex-1 py-2 px-4 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-semibold transition-colors";

   const handleChange = (e) => {
		const { name, value } = e.target;
		setProgressModal((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
        e.preventDefault()

        setProgressModal({isOpen: false})
    }

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
				<h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
					Progress Tracker
				</h2>
				<p className="text-slate-600 dark:text-slate-300 mb-6"></p>
				<form onSubmit={handleSubmit}>
					<label className="block text-md font-bold text-white uppercase mb-2">Reps</label>
					<input
						name="reps"
						value={progressModal.reps || ""}
						className="w-full h-12 rounded-lg border px-4 placeholder:text-slate-500 dark:placeholder:text-slate-400 mb-5"
						placeholder="Reps"
                        onChange={handleChange}
					/>
					<label className="block text-md font-bold text-white uppercase mb-2">Sets</label>
					<input
						name="sets"
						value={progressModal.sets || ""}
						className="w-full h-12 rounded-lg border px-4 placeholder:text-slate-500 dark:placeholder:text-slate-400 mb-5"
						placeholder="Sets"
                        onChange={handleChange}
					/>
                    <label className="block text-md font-bold text-white uppercase mb-2">Weight</label>
					<input
						name="weight"
						value={progressModal.weight || ""}
						className="w-full h-12 rounded-lg border px-4 placeholder:text-slate-500 dark:placeholder:text-slate-400 mb-5"
						placeholder="Weight"
                        onChange={handleChange}
					/>
					
				</form>
				<div className="flex gap-3">
					<button onClick={onCancel} className={dangerButton}>
						{cancelText}
					</button>
					<button onClick={onConfirm} className={safeButton}>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}

export default ProgressModal;
