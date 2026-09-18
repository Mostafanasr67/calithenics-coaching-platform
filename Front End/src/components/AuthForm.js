import { useState } from "react";

function AuthForm({ isSignUp, formState, onChange, onSubmit }) {
	const [showPassword, setShowPassword] = useState(false);

	const inputField = "w-full bg-transparent border-none text-[#111418] dark:text-white h-12 pl-12 pr-4 text-sm font-normal placeholder:text-[#637588] focus:ring-0 focus:outline-none";
	const inputWrapper = "relative flex w-full items-center rounded-lg bg-[#f0f2f4] dark:bg-[#0d131a] focus-within:ring-2 focus-within:ring-primary/50 transition-all";
	const inputIcon = "absolute left-4 text-[#637588] dark:text-slate-500 flex items-center justify-center";
	const label = "text-[#111418] dark:text-white text-sm font-bold leading-normal";

	const handleChange = (e) => {
		onChange(e.target.name, e.target.value);
	};

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-5">
			{isSignUp && (
				<div className="flex flex-col gap-1">
					<label className={label}>Name</label>
					<div className={inputWrapper}>
						<div className={inputIcon}>
							<span className="material-symbols-outlined text-[20px]">person</span>
						</div>
						<input
							className={inputField}
							placeholder="Your full name"
							type="text"
							name="name"
							value={formState.name}
							onChange={handleChange}
							required
						/>
					</div>
				</div>
			)}

			<div className="flex flex-col gap-1">
				<label className={label}>Email Address</label>
				<div className={inputWrapper}>
					<div className={inputIcon}>
						<span className="material-symbols-outlined text-[20px]">mail</span>
					</div>
					<input
						className={inputField}
						placeholder="you@example.com"
						type="email"
						name="email"
						value={formState.email}
						onChange={handleChange}
						required
					/>
				</div>
			</div>

			<div className="flex flex-col gap-1">
				<div className="flex justify-between items-center">
					<label className={label}>Password</label>
				</div>
				<div className={inputWrapper}>
					<div className={inputIcon}>
						<span className="material-symbols-outlined text-[20px]">lock</span>
					</div>
					<input
						className={`${inputField} pr-12`}
						placeholder="••••••••"
						type={showPassword ? "text" : "password"}
						name="password"
						value={formState.password}
						onChange={handleChange}
						required
					/>
					<button
						className="absolute right-4 text-[#637588] dark:text-slate-500 hover:text-primary transition-colors flex items-center justify-center"
						type="button"
						onClick={() => setShowPassword(!showPassword)}
					>
						<span className="material-symbols-outlined text-[20px]">
							{showPassword ? "visibility" : "visibility_off"}
						</span>
					</button>
				</div>
			</div>

			<div className="pt-2">
				<button type="submit" className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary hover:bg-blue-600 text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]">
					<span className="truncate">{isSignUp ? "Sign Up" : "Log In"}</span>
				</button>
			</div>
		</form>
	);
}

export default AuthForm;


