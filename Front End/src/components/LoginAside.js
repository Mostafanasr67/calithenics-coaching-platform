function LoginAside() {
    const outerClass =
        "relative overflow-hidden rounded-[1.5rem] mb-8 h-150"
        

    return (
        <div className={outerClass}>
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage:
                        'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDd8pRGyScgDgG8ZXgnmerhU89aGCvM8zLQb4s8ir2-p02f5ZzRj_uNtwU1atoRLD2r8LEd0OsqupJ399JZfLBoRUh3CPfVevTsLBeYw-p0Ma37cdq5rzeD2rWb5BAfygtnwSF5n9jLYrquYFC_gSERa93SAWyCDwYi7wMdCjHeWnD-irILLHoaQb8n8EBPIa3gmS2odffeb-d1cbpLRcz-PzRxvnW9ShhOF0COFcXz_qEOh6DN5s1wZT0Vsiqq6jQLFSyQ32Hg7N0")',
                }}
            ></div>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
                <div className="relative z-10 text-white">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 mb-4 w-fit">
                        <span className="material-symbols-outlined text-sm">
                            verified
                        </span>
                        <span className="text-xs font-bold tracking-wide uppercase">
                            Trusted by Pro Athletes
                        </span>
                    </div>
                    <h2 className="text-3xl font-black leading-tight mb-2">
                        Push Your Limits
                    </h2>
                    <p className="text-white/80 font-medium text-lg leading-relaxed">
                        Join thousands of coaches and athletes tracking their journey
                        to peak performance.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginAside;