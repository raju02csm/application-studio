import { Star } from "lucide-react";

const reviews = [
  { initials: "DP", name: "Dylan Phillips", role: "Software Engineer",
    quote: "The Tailored Resume Editor is ridiculously cool. I had so much fun checking off each suggestion and watching the match score go up. AI suggestions are incredibly on-point." },
  { initials: "BC", name: "Brianna Chen", role: "Product Designer",
    quote: "Went from 2% callback rate to landing 4 interviews in a week. The ATS score is a game-changer — finally I know why my resume keeps getting filtered out." },
  { initials: "MR", name: "Marcus Reyes", role: "Data Scientist",
    quote: "I applied to 47 jobs in one weekend with custom cover letters for each. Two weeks later I had three offers. This thing is unfair." },
];

export const Testimonials = () => (
  <section className="container py-24">
    <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
      <div className="text-sm font-semibold uppercase tracking-wider text-primary">Loved by job seekers</div>
      <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
        Real reviews from <span className="font-serif italic text-gradient">real applicants</span>
      </h2>
    </div>
    <div className="grid md:grid-cols-3 gap-6">
      {reviews.map((r) => (
        <div key={r.name} className="rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col gap-4">
          <div className="flex gap-0.5 text-primary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
          <p className="text-foreground/90 leading-relaxed flex-1">"{r.quote}"</p>
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold">
              {r.initials}
            </div>
            <div>
              <div className="font-semibold text-sm">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.role}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);
