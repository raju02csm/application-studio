import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDemo } from "./HeroDemo";

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

        <HeroDemo />
      </div>
    </section>
  );
};
