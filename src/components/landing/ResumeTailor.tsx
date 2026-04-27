import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, Copy, Check, Upload, FileText, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Result {
  matchScore: number;
  summary: string;
  missingKeywords: string[];
  matchedKeywords: string[];
  suggestions: string[];
  tailoredResume: string;
  coverLetter: string;
}

const SAMPLE_RESUME = `Jane Doe
Software Engineer | jane@email.com | linkedin.com/in/janedoe

EXPERIENCE
Acme Corp — Software Engineer (2021-Present)
- Built React-based dashboards used by 50,000+ users
- Migrated legacy backend services to Node.js, Python, and PostgreSQL
- Led team of 3 engineers on internal tooling project

Startup XYZ — Junior Developer (2019-2021)
- Developed REST APIs in Python/Django
- Collaborated with designers on user-facing features

EDUCATION
B.S. Computer Science, State University, 2019

SKILLS
JavaScript, TypeScript, React, Node.js, Python, Django, PostgreSQL, Git`;

const SAMPLE_JD = `Senior Full-Stack Engineer at TechCo

We're hiring a Senior Full-Stack Engineer to join our platform team. You'll build scalable web applications used by millions.

Requirements:
- 5+ years building production web apps with React and TypeScript
- Strong backend experience with Python, Node.js, GraphQL, and microservices
- Cloud experience (AWS preferred)
- Familiarity with CI/CD and containerization (Docker, Kubernetes)
- Bonus: experience leading small teams or mentoring engineers`;

const ACCEPTED = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const MAX_BYTES = 8 * 1024 * 1024;

const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result as string;
      resolve(r.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const ResumeTailor = () => {
  const [resume, setResume] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const loadSample = () => {
    setFile(null);
    setResume(SAMPLE_RESUME);
    setJd(SAMPLE_JD);
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      toast({ title: "File too large", description: "Max 8MB. Try a smaller file.", variant: "destructive" });
      return;
    }
    setFile(f);
    setResume("");
  };

  const tailor = async () => {
    if ((!resume.trim() && !file) || !jd.trim()) {
      toast({ title: "Missing input", description: "Add your resume (file or text) and the job description.", variant: "destructive" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const body: any = { jobDescription: jd };
      if (file) {
        const data = await fileToBase64(file);
        body.resumeFile = { data, name: file.name, type: file.type };
      } else {
        body.resume = resume;
      }
      const { data, error } = await supabase.functions.invoke("tailor-resume", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as Result);
      toast({ title: "Resume tailored!", description: `Match score: ${data.matchScore}/100` });
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e: any) {
      toast({ title: "Something went wrong", description: e.message ?? "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="tool" className="container py-24">
      <div className="max-w-2xl mx-auto text-center mb-12 space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-primary">Try it now</div>
        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
          See your <span className="font-serif italic text-gradient">match score</span> in seconds
        </h2>
        <p className="text-lg text-muted-foreground">
          Upload a PDF, DOC, or DOCX — or paste your resume. Add a job description and let our AI do the rest.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <ResumeInput
          file={file}
          onFile={handleFile}
          onClearFile={() => setFile(null)}
          value={resume}
          onChange={(v) => { setResume(v); if (v) setFile(null); }}
        />
        <InputCard label="Job Description" value={jd} onChange={setJd} placeholder="Paste the job posting here..." />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Button onClick={tailor} disabled={loading} variant="hero" size="xl" className="min-w-[240px]">
          {loading ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Tailoring...</>
          ) : (
            <><Sparkles className="h-5 w-5" /> Tailor My Resume</>
          )}
        </Button>
        <Button onClick={loadSample} variant="outline" size="xl" disabled={loading}>
          Try with sample data
        </Button>
      </div>

      {result && <Results result={result} />}
    </section>
  );
};

const ResumeInput = ({
  file, onFile, onClearFile, value, onChange,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
  onClearFile: () => void;
  value: string;
  onChange: (v: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40">
        <span className="font-semibold text-sm">Your Resume</span>
        <span className="text-xs text-muted-foreground">
          {file ? `${(file.size / 1024).toFixed(0)} KB` : `${value.length} chars`}
        </span>
      </div>

      {file ? (
        <div className="p-5 flex-1 flex flex-col items-center justify-center text-center gap-3 min-h-[280px]">
          <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-md">
            <FileText className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-sm break-all">{file.name}</div>
            <div className="text-xs text-muted-foreground">Will be parsed on submit</div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearFile}>
            <X className="h-4 w-4" /> Remove
          </Button>
        </div>
      ) : (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault(); setDrag(false);
              const f = e.dataTransfer.files?.[0];
              if (f) onFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className={`m-4 rounded-xl border-2 border-dashed cursor-pointer p-5 text-center transition-colors ${
              drag ? "border-primary bg-primary-soft" : "border-border bg-muted/20 hover:border-primary/40 hover:bg-primary-soft/40"
            }`}
          >
            <Upload className="h-5 w-5 mx-auto text-primary mb-1.5" />
            <div className="text-sm font-semibold">Upload PDF, DOC, or DOCX</div>
            <div className="text-xs text-muted-foreground mt-0.5">Drag & drop or click — up to 8MB</div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="px-5 pb-2 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">or paste text</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your resume here..."
            className="min-h-[180px] border-0 rounded-none resize-none focus-visible:ring-0 font-mono text-sm bg-transparent"
          />
        </>
      )}
    </div>
  );
};

const InputCard = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) => (
  <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
    <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/40">
      <span className="font-semibold text-sm">{label}</span>
      <span className="text-xs text-muted-foreground">{value.length} chars</span>
    </div>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-[280px] border-0 rounded-none resize-none focus-visible:ring-0 font-mono text-sm bg-transparent"
    />
  </div>
);

const Results = ({ result }: { result: Result }) => {
  const scoreColor = result.matchScore >= 80 ? "text-primary" : result.matchScore >= 60 ? "text-warning" : "text-destructive";
  return (
    <div id="results" className="mt-16 max-w-6xl mx-auto space-y-6 animate-fade-up">
      <div className="rounded-2xl border border-border bg-card shadow-elegant p-8 grid md:grid-cols-[auto,1fr] gap-8 items-center">
        <div className="text-center">
          <div className={`text-7xl font-bold ${scoreColor}`}>{result.matchScore}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1">Match Score</div>
          <div className="mt-3 w-32 mx-auto h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-primary rounded-full transition-all duration-1000" style={{ width: `${result.matchScore}%` }} />
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">{result.summary}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <KeywordList icon={CheckCircle2} title="Matched" items={result.matchedKeywords} variant="success" />
            <KeywordList icon={AlertCircle} title="Missing" items={result.missingKeywords} variant="warning" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />AI Suggestions</h3>
        <ul className="space-y-3">
          {result.suggestions.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary-soft text-primary text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-foreground/90">{s}</span>
            </li>
          ))}
        </ul>
      </div>

      <Tabs defaultValue="resume" className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        <TabsList className="w-full justify-start rounded-none bg-muted/40 border-b border-border h-12 p-0">
          <TabsTrigger value="resume" className="rounded-none data-[state=active]:bg-card h-full px-6">Tailored Resume</TabsTrigger>
          <TabsTrigger value="cover" className="rounded-none data-[state=active]:bg-card h-full px-6">Cover Letter</TabsTrigger>
        </TabsList>
        <TabsContent value="resume" className="m-0">
          <CopyableText text={result.tailoredResume} />
        </TabsContent>
        <TabsContent value="cover" className="m-0">
          <CopyableText text={result.coverLetter} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const KeywordList = ({ icon: Icon, title, items, variant }: { icon: any; title: string; items: string[]; variant: "success" | "warning" }) => (
  <div>
    <div className={`flex items-center gap-2 text-sm font-semibold mb-2 ${variant === "success" ? "text-primary" : "text-warning"}`}>
      <Icon className="h-4 w-4" /> {title} ({items.length})
    </div>
    <div className="flex flex-wrap gap-1.5">
      {items.slice(0, 12).map((k) => (
        <span key={k} className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
          variant === "success" ? "bg-primary-soft text-primary border-primary/10" : "bg-warning/10 text-warning border-warning/20"
        }`}>{k}</span>
      ))}
    </div>
  </div>
);

const CopyableText = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative">
      <Button onClick={copy} variant="outline" size="sm" className="absolute top-4 right-4 z-10">
        {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy</>}
      </Button>
      <pre className="p-6 pt-14 whitespace-pre-wrap font-sans text-sm leading-relaxed max-h-[600px] overflow-auto">{text}</pre>
    </div>
  );
};
