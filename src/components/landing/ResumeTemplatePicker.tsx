import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { parseResume } from "@/lib/resumeParser";
import { ResumeTemplate, TEMPLATES, TemplateId } from "./resume-templates/templates";

interface Props {
  resumeText: string;
}

export const ResumeTemplatePicker = ({ resumeText }: Props) => {
  const data = useMemo(() => parseResume(resumeText), [resumeText]);
  const [selected, setSelected] = useState<TemplateId>("modern");
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const download = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const node = previewRef.current.querySelector<HTMLElement>("[data-resume-page]");
      if (!node) throw new Error("Nothing to export");

      const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const img = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      let w = pageW, h = pageW / ratio;
      if (h > pageH) { h = pageH; w = pageH * ratio; }
      pdf.addImage(img, "JPEG", (pageW - w) / 2, 0, w, h);
      const safeName = (data.name || "resume").replace(/[^A-Za-z0-9]+/g, "_");
      pdf.save(`${safeName}_${selected}.pdf`);
      toast({ title: "Downloaded", description: "Your tailored resume PDF is ready." });
    } catch (e: any) {
      toast({ title: "Download failed", description: e?.message ?? "Please try again", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/40 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-lg">Choose a template</h3>
          <p className="text-xs text-muted-foreground">Pick a design and download your tailored resume as PDF.</p>
        </div>
        <Button onClick={download} disabled={downloading} variant="hero">
          {downloading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating PDF…</> : <><Download className="h-4 w-4" /> Download PDF</>}
        </Button>
      </div>

      <div className="grid lg:grid-cols-[280px,1fr]">
        {/* Template list */}
        <div className="border-r border-border p-3 max-h-[640px] overflow-auto bg-muted/10">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {TEMPLATES.map((t) => {
              const active = t.id === selected;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelected(t.id)}
                  className={`text-left rounded-lg border p-3 transition-all ${
                    active ? "border-primary bg-primary-soft shadow-sm" : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-sm">{t.name}</div>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{t.description}</div>
                  <div className="mt-2 h-1.5 rounded-full" style={{ background: t.accent }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div ref={previewRef} className="bg-muted/30 p-6 overflow-auto max-h-[640px]">
          <div className="mx-auto" style={{ width: 794, transform: "scale(0.78)", transformOrigin: "top center" }}>
            <div data-resume-page className="shadow-elegant" style={{ background: "#fff" }}>
              <ResumeTemplate id={selected} data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
