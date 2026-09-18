import { Link } from "react-router-dom";

function LoginNavBar({isSignUp}) {
	return (
		<header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f2f4] dark:border-gray-800 bg-white dark:bg-[#1a2632] px-10 py-3 sticky top-0 z-50">
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
				<h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
					FitTrack
				</h2>
			</div>
			<div className="flex gap-2">
				<span className="text-sm font-medium text-slate-600 dark:text-slate-400 self-center mr-2 hidden sm:block">
					{isSignUp ? "Already a member?" : "Not a member yet?"}
				</span>
				<Link
					to={isSignUp ? "/?mode=login" : "/"}
					className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
				>
					<span className="truncate">{isSignUp ? "Log In" : "Sign Up"}</span>
				</Link>
			</div>
		</header>
	);
}

export default LoginNavBar;
