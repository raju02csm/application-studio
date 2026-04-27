import { Brain, FileText, Target, Mail, Zap, ShieldCheck } from "lucide-react";

const features = [
  { icon: Brain, title: "Smart Job Insights", desc: "Instantly analyze any job posting to extract key requirements, skills, and culture signals." },
  { icon: Target, title: "ATS Optimization", desc: "Beat the bots. Your resume is rewritten with the exact keywords recruiters' systems scan for." },
  { icon: FileText, title: "Tailored Resume", desc: "Get a fully rewritten resume for every job — preserving your truth, sharpening your story." },
  { icon: Mail, title: "Personalized Cover Letters", desc: "AI drafts a 3-paragraph cover letter that speaks directly to the role and company." },
  { icon: Zap, title: "Done in 30 Seconds", desc: "What used to take 2 hours per application now happens before your coffee gets cold." },
  { icon: ShieldCheck, title: "Private & Secure", desc: "Your resume never trains an AI. Your data stays yours, encrypted in transit and at rest." },
];

export const Features = () => (
  <section id="features" className="container py-24">
    <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
      <div className="text-sm font-semibold uppercase tracking-wider text-primary">Features</div>
      <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
        Everything you need to <span className="font-serif italic text-gradient">land the interview</span>
      </h2>
      <p className="text-lg text-muted-foreground">
        Built for the modern job seeker who refuses to copy-paste their way through 200 applications.
      </p>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((f, i) => (
        <div
          key={f.title}
          className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-smooth hover:shadow-elegant hover:-translate-y-1"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-md mb-4 group-hover:scale-110 transition-transform">
            <f.icon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">{f.title}</h3>
          <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);
