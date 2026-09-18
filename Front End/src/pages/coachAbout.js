import ClientNavBar from "../components/ClientNavBar";
import CoachNavBar from "../components/CoachNavBar";
import Footer from "../components/Footer";
import ProfilePicture from "../utils/ProfilePicture.jpeg";
import CoverPhoto from "../utils/CoverPhoto.jpeg";

function CoachAbout() {
	const role = localStorage.getItem("role");
	const id = localStorage.getItem("id");

	const badge = "px-3 py-1 rounded-full text-xs font-bold";
	const button =
		"px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2";
	const cardStyle =
		"bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark p-6 shadow-sm";
	const statCard =
		"bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark text-center shadow-sm";
	const navLink =
		"text-text-secondary-light dark:text-text-secondary-dark font-medium hover:text-primary transition-colors";

	return (
		<div className="overflow-x-hidden min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark font-display">
			{/* Header */}
			{role === "coach" ? <CoachNavBar /> : <ClientNavBar />}

			<main className="flex-1 flex flex-col items-center py-5 px-4 md:px-10 lg:px-40">
				<div className="flex flex-col max-w-[960px] w-full gap-6">
					{/* Breadcrumbs */}
					<div className="flex flex-wrap gap-2 text-sm">
						<a
							className={navLink}
							href={
								role == "coach" ? "/coachDashboard" : `/clientDetails/${id}`
							}
						>
							{role == "coach" ? "Dashboard" : "Plans"}
						</a>
						<span className={navLink}>/</span>
						<span className="text-text-primary-light dark:text-text-primary-dark font-medium">
							Coach Profile
						</span>
					</div>

					{/* Profile Header Card */}
					<div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
						<div className="h-48 bg-gradient-to-r from-blue-600 to-cyan-500 relative overflow-hidden">
							<img
								src={CoverPhoto}
								alt="Cover"
								className="w-full h-full object-cover"
								style={{ objectPosition: "center 30%" }}
							/>
						</div>
						<div className="px-6 pb-6 relative">
							<div className="flex flex-col md:flex-row gap-4 items-start">
								<div className="-mt-16 relative">
									<img
										src={ProfilePicture}
										alt="Profile"
										className="size-32 rounded-full ring-4 ring-white dark:ring-surface-dark object-cover"
									/>
								</div>
								<div className="flex-1 mt-4 md:mt-2 flex flex-col md:flex-row justify-between w-full gap-4">
									<div>
										<h1 className="text-4xl md:text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-3 mt-3">
											Mostafa Nasr
										</h1>
										<p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-medium text-lg">
											Calisthenics Coach & Personal Trainer
										</p>
										<div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
											<span className="flex items-center gap-1">
												<span className="material-symbols-outlined text-[18px]">
													location_on
												</span>{" "}
												Cairo, Egypt
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Main Content Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Left Sidebar */}
						<div className="flex flex-col gap-6 lg:col-span-1">
							{/* About Card */}
							<div className={cardStyle}>
								<h3 className="font-bold text-lg mb-4 text-text-primary-light dark:text-text-primary-dark">
									About Me
								</h3>
								<p className="text-text-secondary-light dark:text-text-secondary-dark text-sm leading-relaxed mb-4">
									Passionate about helping individuals reach their peak
									performance through Calisthenics and functional fitness. With
									3 years of coaching experience in Raw Calisthenics, including
									1 year as Head Coach, I now provide personalized training at
									Rage Egypt. I've competed in national championships and earned
									multiple medals.
								</p>
								<div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border-light dark:border-border-dark">
									<div className="flex items-center gap-3 text-sm">
										<span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">
											mail
										</span>
										<span className="text-text-primary-light dark:text-text-primary-dark font-medium">
											mostafanasr2003@hotmail.com
										</span>
									</div>
								</div>
							</div>
						</div>

						{/* Right Content */}
						<div className="flex flex-col gap-6 lg:col-span-2">
							{/* Stats Grid */}
							<div className="grid grid-cols-3 gap-4">
								<div className={statCard}>
									<div className="text-2xl md:text-3xl font-bold text-primary mb-1">
										3+
									</div>
									<div className="text-[10px] md:text-xs font-medium uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">
										Years Coaching
									</div>
								</div>
								<div className={statCard}>
									<div className="text-2xl md:text-3xl font-bold text-primary mb-1">
										200+
									</div>
									<div className="text-[10px] md:text-xs font-medium uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">
										Happy Clients
									</div>
								</div>
								<div className={statCard}>
									<div className="text-2xl md:text-3xl font-bold text-primary mb-1">
										14
									</div>
									<div className="text-[10px] md:text-xs font-medium uppercase tracking-wide text-text-secondary-light dark:text-text-secondary-dark">
										Medals
									</div>
								</div>
							</div>

							{/* Experience Card */}
							<div className={cardStyle}>
								<div className="flex items-center justify-between mb-6">
									<h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
										Experience
									</h3>
								</div>
								<div className="flex flex-col gap-6 relative">
									<div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-border-light dark:bg-border-dark"></div>

									{/* Experience Item 1 */}
									<div className="flex gap-4 relative group">
										<div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-surface-dark shadow-sm">
											<span className="material-symbols-outlined text-[20px]">
												fitness_center
											</span>
										</div>
										<div className="pb-2">
											<h4 className="font-bold text-text-primary-light dark:text-text-primary-dark text-base">
												Coach @ Raw Calisthenics
											</h4>
											<p className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium mb-1">
												2023 - 2025
											</p>
											<p className="text-sm text-text-primary-light dark:text-gray-500 leading-relaxed">
												Trained athletes in Calisthenics fundamentals and
												advanced techniques. Prepared competitors for national
												championships.
											</p>
										</div>
									</div>

									{/* Experience Item 2 */}

									<div className="flex gap-4 relative group">
										<div className="size-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-surface-dark shadow-sm">
											<span className="material-symbols-outlined text-[20px]">
												school
											</span>
										</div>
										<div className="pb-2">
											<h4 className="font-bold text-text-primary-light dark:text-text-primary-dark text-base">
												Head Coach @ Raw Calisthenics
											</h4>
											<p className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium mb-1">
												2025 - 2026
											</p>
											<p className="text-sm text-text-primary-light dark:text-gray-500 leading-relaxed">
												Led the coaching team, developed training programs, and
												managed multiple athletes. Competed in national
												championships.
											</p>
										</div>
									</div>

									{/* Experience Item 3 */}
									<div className="flex gap-4 relative group">
										<div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-surface-dark shadow-sm">
											<span className="material-symbols-outlined text-[20px]">
												person
											</span>
										</div>
										<div className="pb-2">
											<h4 className="font-bold text-text-primary-light dark:text-text-primary-dark text-base">
												Personal Trainer @ Rage Egypt
											</h4>
											<p className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium mb-1">
												April 2026 - Present
											</p>
											<p className="text-sm text-text-primary-light dark:text-gray-500 leading-relaxed">
												Providing personalized training sessions and customized
												fitness plans. Specializing in Calisthenics and
												functional strength training.
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Certifications Card */}
							<div className={cardStyle}>
								<div className="flex items-center justify-between mb-4">
									<h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
										Achievements
									</h3>
								</div>
								<div className="flex flex-col gap-4">
									{/* Medal 1 */}
									<div className="flex gap-3 items-start p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
										<span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-2xl shrink-0">
											emoji_events
										</span>
										<div>
											<p className="font-bold text-text-primary-light dark:text-text-primary-dark">
												Gold Medal
											</p>
											<p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
												Power Middle Weight - National Championships - May 2026
											</p>
										</div>
									</div>

									{/* Medal 2 */}
									<div className="flex gap-3 items-start p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800/30">
										<span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-2xl shrink-0">
											emoji_events
										</span>
										<div>
											<p className="font-bold text-text-primary-light dark:text-text-primary-dark">
												Bronze Medal
											</p>
											<p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
												Strength Middle Weight - National Championships -
												February 2025
											</p>
										</div>
									</div>

									{/* Medal 3 */}
									<div className="flex gap-3 items-start p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-900/10 rounded-lg border border-slate-200 dark:border-slate-800/30">
										<span className="material-symbols-outlined text-slate-600 dark:text-slate-400 text-2xl shrink-0">
											emoji_events
										</span>
										<div>
											<p className="font-bold text-text-primary-light dark:text-text-primary-dark">
												Silver Medal
											</p>
											<p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
												Strength Middle Weight - National Championships - June
												2023
											</p>
										</div>
									</div>

									{/* Calisthenics Medals */}
									<div className="flex gap-3 items-start p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
										<span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-2xl shrink-0">
											emoji_events
										</span>
										<div>
											<p className="font-bold text-text-primary-light dark:text-text-primary-dark">
												11 Calisthenics Medals
											</p>
											<p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
												Multiple medals in regional tournaments and private
												competitions (2023-2025)
											</p>
										</div>
									</div>

									{/* Swimming Medals */}
									<div className="flex gap-3 items-start p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/30">
										<span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-2xl shrink-0">
											emoji_events
										</span>
										<div>
											<p className="font-bold text-text-primary-light dark:text-text-primary-dark">
												2 Swimming Medals
											</p>
											<p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
												Silver in 200m Breaststroke and Bronze in 50m
												Breaststroke in National Championships (2018-2020)
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<Footer />
		</div>
	);
}

export default CoachAbout;
