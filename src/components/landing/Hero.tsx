import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden />
      <div className="container relative grid lg:grid-cols-2 gap-12 lg:gap-8 items-center py-20 lg:py-28">
        <div className="space-y-8 animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Job Application Assistant
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            Tailor your resume in{" "}
            <span className="font-serif italic text-gradient">30 seconds</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Stop spending hours customizing resumes. Our AI analyzes any job posting and rewrites your resume to beat the ATS — with a personalized cover letter included.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="xl" variant="hero" asChild>
              <a href="#tool">
                Get Started Free <ArrowRight className="ml-1 h-5 w-5" />
              </a>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <a href="#how">See how it works</a>
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            {["No credit card required", "ATS-optimized", "Instant results"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> {f}
              </div>
            ))}
          </div>
        </div>

        <ResumeMockup />
      </div>
    </section>
  );
};

const ResumeMockup = () => (
  <div className="relative animate-float">
    <div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-full" aria-hidden />
    <div className="relative rounded-2xl border border-border bg-card shadow-elegant overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/40">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
        <div className="ml-3 text-xs text-muted-foreground font-medium">Senior Software Engineer · NVIDIA</div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Match Score</div>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold text-gradient">94</div>
            <div className="text-xs text-muted-foreground">/100</div>
          </div>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-[94%] bg-gradient-primary rounded-full animate-shimmer" />
        </div>
        <div className="space-y-3 pt-2">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Skills Matched</div>
          <div className="flex flex-wrap gap-1.5">
            {["React", "TypeScript", "AWS", "Kubernetes", "GraphQL", "Python", "CI/CD", "PostgreSQL"].map((s) => (
              <span key={s} className="text-xs px-2.5 py-1 rounded-md bg-primary-soft text-primary font-medium border border-primary/10">
                ✓ {s}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-primary/20 bg-primary-soft/50 p-3 text-sm">
          <div className="font-semibold text-primary text-xs uppercase tracking-wider mb-1">AI Suggestion</div>
          <p className="text-foreground/80">Add "distributed systems" and "performance optimization" to highlight your senior-level expertise.</p>
        </div>
      </div>
    </div>
  </div>
);
