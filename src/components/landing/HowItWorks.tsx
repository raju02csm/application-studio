const steps = [
  { num: "01", title: "Paste your resume", desc: "Drop in your current resume — any format, any length. We'll handle the rest." },
  { num: "02", title: "Add the job posting", desc: "Paste the job description from LinkedIn, Indeed, or any company career page." },
  { num: "03", title: "Get your tailored kit", desc: "An ATS score, a rewritten resume, and a custom cover letter — all in 30 seconds." },
];

export const HowItWorks = () => (
  <section id="how" className="bg-gradient-soft py-24 border-y border-border">
    <div className="container">
      <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-primary">How it works</div>
        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
          From job post to interview-ready in <span className="font-serif italic text-gradient">three steps</span>
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8 relative">
        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" aria-hidden />
        {steps.map((s) => (
          <div key={s.num} className="relative text-center space-y-4">
            <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-full bg-card border-2 border-primary shadow-glow">
              <span className="text-2xl font-bold text-gradient">{s.num}</span>
            </div>
            <h3 className="text-xl font-bold">{s.title}</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
