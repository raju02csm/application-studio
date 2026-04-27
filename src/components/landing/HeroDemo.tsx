import { useEffect, useState } from "react";
import { FileText, Sparkles, CheckCircle2, Upload, Briefcase } from "lucide-react";

/**
 * Self-contained, looping screen-recording style walkthrough.
 * Beats: 1) Upload PDF  2) Paste JD  3) Tailoring...  4) Score reveal  5) Reset
 * Pure frame-derived state via interval — no video file needed.
 */

const TOTAL = 1200; // ms per beat
const BEATS = 5;

export const HeroDemo = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % BEATS), TOTAL);
    return () => clearInterval(id);
  }, []);

  const beat = tick;

  return (
    <div className="relative animate-float">
      <div className="absolute -inset-10 bg-primary/15 blur-3xl rounded-full" aria-hidden />
      <div className="absolute -inset-10 bg-accent/10 blur-3xl rounded-full -z-10" aria-hidden />
      <div className="relative rounded-2xl border border-border bg-card shadow-elegant overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/40">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          <div className="ml-3 text-xs text-muted-foreground font-medium truncate">
            letmeapply.ai · Tailoring for Senior Engineer
          </div>
          <div className="ml-auto flex gap-1">
            {Array.from({ length: BEATS }).map((_, i) => (
              <span
                key={i}
                className={`h-1 w-6 rounded-full transition-all duration-500 ${
                  i === beat ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-5 space-y-4 min-h-[440px]">
          {/* Beat 0: Upload */}
          <DropZone active={beat === 0} done={beat >= 1} />

          {/* Beat 1: JD paste */}
          <JdPaste active={beat === 1} done={beat >= 2} />

          {/* Beat 2: Analyzing */}
          {beat === 2 && <Analyzing />}

          {/* Beats 3-4: Result */}
          {beat >= 3 && <ScoreCard />}
        </div>
      </div>
    </div>
  );
};

const DropZone = ({ active, done }: { active: boolean; done: boolean }) => (
  <div
    className={`rounded-xl border-2 border-dashed p-4 transition-all duration-500 ${
      done
        ? "border-primary/30 bg-primary-soft/40"
        : active
        ? "border-primary bg-primary-soft scale-[1.01]"
        : "border-border bg-muted/30"
    }`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`grid h-10 w-10 place-items-center rounded-lg transition-colors ${
          done ? "bg-gradient-primary text-primary-foreground" : "bg-card border border-border"
        }`}
      >
        {done ? <FileText className="h-5 w-5" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
      </div>
      <div className="flex-1 min-w-0">
        {done ? (
          <>
            <div className="text-sm font-semibold truncate">jane_doe_resume.pdf</div>
            <div className="text-xs text-muted-foreground">142 KB · parsed in 0.6s</div>
          </>
        ) : (
          <>
            <div className="text-sm font-semibold">{active ? "Dropping resume..." : "Upload your resume"}</div>
            <div className="text-xs text-muted-foreground">PDF, DOC, DOCX or paste text</div>
          </>
        )}
      </div>
      {done && <CheckCircle2 className="h-5 w-5 text-success" />}
    </div>
    {active && (
      <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-gradient-primary animate-shimmer" style={{ width: "70%" }} />
      </div>
    )}
  </div>
);

const JdPaste = ({ active, done }: { active: boolean; done: boolean }) => (
  <div
    className={`rounded-xl border p-4 transition-all duration-500 ${
      active ? "border-primary bg-primary-soft/60" : done ? "border-border bg-muted/30" : "border-border bg-muted/10"
    }`}
  >
    <div className="flex items-center gap-2 mb-2">
      <Briefcase className="h-4 w-4 text-primary" />
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Job description
      </span>
      {done && <CheckCircle2 className="h-4 w-4 text-success ml-auto" />}
    </div>
    <div className="space-y-1.5">
      {[100, 92, 78, 88].map((w, i) => (
        <div
          key={i}
          className="h-2 rounded-full bg-foreground/10 overflow-hidden"
          style={{ width: `${w}%` }}
        >
          {(active || done) && (
            <div
              className="h-full bg-gradient-to-r from-primary/60 to-accent/60 transition-all"
              style={{
                width: active ? `${(i + 1) * 25}%` : "100%",
                transitionDelay: `${i * 80}ms`,
                transitionDuration: "500ms",
              }}
            />
          )}
        </div>
      ))}
    </div>
  </div>
);

const Analyzing = () => (
  <div className="rounded-xl border border-primary/30 bg-gradient-soft p-6 text-center space-y-4 animate-fade-up">
    <div className="relative mx-auto h-14 w-14">
      <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-accent animate-spin" />
      <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
    </div>
    <div className="space-y-1">
      <div className="font-semibold">AI is tailoring your resume</div>
      <div className="text-sm text-muted-foreground">Analyzing keywords · matching skills · rewriting bullets</div>
    </div>
  </div>
);

const ScoreCard = () => (
  <div className="space-y-4 animate-fade-up">
    <div className="flex items-center justify-between">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Match Score</div>
      <div className="flex items-baseline gap-1">
        <div className="text-4xl font-bold text-gradient">94</div>
        <div className="text-sm text-muted-foreground">/ 100</div>
      </div>
    </div>
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <div className="h-full bg-gradient-primary rounded-full" style={{ width: "94%" }} />
    </div>
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        Skills matched
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["Python", "React", "TypeScript", "AWS", "Kubernetes", "GraphQL", "CI/CD", "PostgreSQL"].map((s, i) => (
          <span
            key={s}
            className="text-xs px-2.5 py-1 rounded-md bg-primary-soft text-primary font-medium border border-primary/15 animate-fade-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            ✓ {s}
          </span>
        ))}
      </div>
    </div>
    <div className="rounded-lg border border-accent/30 bg-accent-soft p-3 text-sm">
      <div className="font-semibold text-accent text-xs uppercase tracking-wider mb-1">AI suggestion</div>
      <p className="text-foreground/80">
        Add "distributed systems" and "performance optimization" to highlight senior-level expertise.
      </p>
    </div>
  </div>
);
