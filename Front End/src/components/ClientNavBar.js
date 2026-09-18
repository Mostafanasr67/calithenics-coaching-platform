import { useNavigate, useLocation } from "react-router-dom";

function ClientNavBar() {
	const navigate = useNavigate();
	const location = useLocation();
	const userId = localStorage.getItem("userId");

	const handleHome = () => {
		navigate("/", { replace: true });
	};

	return (
		<header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 md:px-10">
			<div className="flex items-center gap-4">
				<div className="size-8 text-primary">
					<svg
						className="w-full h-full"
						fill="none"
						viewBox="0 0 48 48"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"
							fill="currentColor"
						></path>
					</svg>
				</div>
				<h2 className="text-lg font-bold leading-tight tracking-tight dark:text-white">
					FitTrack
				</h2>
			</div>
			<div className="flex items-center gap-4 md:gap-8">
				<nav className="hidden md:flex items-center gap-6">
					<a
						className={`text-sm font-medium leading-normal transition-colors dark:text-slate-300 ${
							location.pathname === `/clientDetails/${userId}`
								? "text-primary underline"
								: "hover:text-primary"
						}`}
						href={`/clientDetails/${localStorage.getItem("userId")}`}
					>
						Plans
					</a>
					<a
						className={`text-sm font-medium leading-normal hover:text-primary transition-colors dark:text-slate-300 ${location.pathname === "/about" ? "text-primary underline" : "hover:text-primary"}`}
						href="/about"
					>
						About
					</a>
				</nav>
				<button
					onClick={handleHome}
					className="flex items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-wide hover:bg-primary/90 transition-colors"
				>
					<span className="truncate">Logout</span>
				</button>
			</div>
		</header>
	);
}

export default ClientNavBar;
