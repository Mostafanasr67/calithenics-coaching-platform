const heading = "text-[#111418] dark:text-white";
const secondaryText = "text-slate-500 dark:text-slate-400 text-sm";

function LoginFormText({isSignUp}) {
	return (
		<div className="mb-8 text-center md:text-left">
			<h1
				className={`${heading} text-3xl font-black leading-tight tracking-[-0.033em] mb-2`}
			>
				{isSignUp ? "Create Account" : "Welcome Back"}
			</h1>
			<p className={secondaryText}>
				{isSignUp
					? "Sign up to get started with your fitness journey."
					: "Please enter your details to access your dashboard."}
			</p>
		</div>
	);
}

export default LoginFormText;
