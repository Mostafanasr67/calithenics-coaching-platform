function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel", isDangerous = false }) {
	if (!isOpen) return null;

	const dangerButton = "flex-1 py-2 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors";
	const safeButton = "flex-1 py-2 px-4 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 font-semibold transition-colors";

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 max-w-sm w-full mx-4">
				<h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
					{title}
				</h2>
				<p className="text-slate-600 dark:text-slate-300 mb-6">
					{message}
				</p>
				<div className="flex gap-3">
					<button
						onClick={onCancel}
						className={safeButton}
					>
						{cancelText}
					</button>
					<button
						onClick={onConfirm}
						className={isDangerous ? dangerButton : safeButton}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}

export default ConfirmModal;
