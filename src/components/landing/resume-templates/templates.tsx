import { ParsedResume, ResumeSection } from "@/lib/resumeParser";

/**
 * Resume templates render an A4-sized page (794 × 1123 px @ 96dpi)
 * suitable for html2canvas → jsPDF export.
 *
 * All templates use plain inline styles (NOT design tokens) so the
 * exported PDF looks identical regardless of the app theme.
 */

export type TemplateId =
  | "classic"
  | "modern"
  | "executive"
  | "minimal"
  | "creative"
  | "technical"
  | "elegant"
  | "compact";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  accent: string;
}

export const TEMPLATES: TemplateMeta[] = [
  { id: "classic",   name: "Classic",   description: "Timeless serif, centered header", accent: "#1f2937" },
  { id: "modern",    name: "Modern",    description: "Two-column with sidebar",         accent: "#4f46e5" },
  { id: "executive", name: "Executive", description: "Bold name, refined spacing",      accent: "#0f172a" },
  { id: "minimal",   name: "Minimal",   description: "Clean, lots of whitespace",       accent: "#111111" },
  { id: "creative",  name: "Creative",  description: "Coral accent bar",                accent: "#f97316" },
  { id: "technical", name: "Technical", description: "Mono headers, dense layout",      accent: "#0ea5e9" },
  { id: "elegant",   name: "Elegant",   description: "Gold rule, italic headline",      accent: "#a16207" },
  { id: "compact",   name: "Compact",   description: "Single column, tight spacing",    accent: "#374151" },
];

const PAGE: React.CSSProperties = {
  width: 794,
  minHeight: 1123,
  background: "#fff",
  color: "#111",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: 11,
  lineHeight: 1.45,
  boxSizing: "border-box",
};

const renderItems = (items: string[]) =>
  items.map((it, i) => {
    const lines = it.split("\n");
    const [first, ...rest] = lines;
    return (
      <div key={i} style={{ marginBottom: 6 }}>
        <div>• {first}</div>
        {rest.map((r, j) => (
          <div key={j} style={{ marginLeft: 12 }}>{r}</div>
        ))}
      </div>
    );
  });

const sectionsExcept = (data: ParsedResume, names: RegExp) =>
  data.sections.filter((s) => !names.test(s.title));

const findSection = (data: ParsedResume, re: RegExp): ResumeSection | undefined =>
  data.sections.find((s) => re.test(s.title));

// ---------- Templates ----------

const Classic = ({ data }: { data: ParsedResume }) => (
  <div style={{ ...PAGE, padding: 56, fontFamily: "Georgia, 'Times New Roman', serif" }}>
    <div style={{ textAlign: "center", borderBottom: "2px solid #1f2937", paddingBottom: 14, marginBottom: 18 }}>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 1 }}>{data.name.toUpperCase()}</div>
      {data.headline && <div style={{ fontStyle: "italic", marginTop: 4 }}>{data.headline}</div>}
      {data.contacts.length > 0 && (
        <div style={{ marginTop: 6, fontSize: 10 }}>{data.contacts.join("  •  ")}</div>
      )}
    </div>
    {data.sections.map((s, i) => (
      <section key={i} style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, borderBottom: "1px solid #999", paddingBottom: 3, marginBottom: 8 }}>
          {s.title}
        </h2>
        {renderItems(s.items)}
      </section>
    ))}
  </div>
);

const Modern = ({ data }: { data: ParsedResume }) => {
  const skills = findSection(data, /skill|expertise|competenc/i);
  const edu = findSection(data, /education|academic/i);
  const sidebarTitles = new Set([skills?.title, edu?.title].filter(Boolean) as string[]);
  const main = data.sections.filter((s) => !sidebarTitles.has(s.title));
  return (
    <div style={{ ...PAGE, display: "flex" }}>
      <aside style={{ width: 240, background: "#4f46e5", color: "#fff", padding: 28 }}>
        <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.15 }}>{data.name}</div>
        {data.headline && <div style={{ marginTop: 4, opacity: 0.9 }}>{data.headline}</div>}
        {data.contacts.length > 0 && (
          <div style={{ marginTop: 16, fontSize: 10, lineHeight: 1.7 }}>
            {data.contacts.map((c, i) => <div key={i}>{c}</div>)}
          </div>
        )}
        {[skills, edu].filter(Boolean).map((s, i) => (
          <div key={i} style={{ marginTop: 22 }}>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8, opacity: 0.85 }}>{s!.title}</div>
            <div style={{ fontSize: 10.5 }}>{renderItems(s!.items)}</div>
          </div>
        ))}
      </aside>
      <main style={{ flex: 1, padding: 32 }}>
        {main.map((s, i) => (
          <section key={i} style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: "#4f46e5", marginBottom: 8 }}>{s.title}</h2>
            {renderItems(s.items)}
          </section>
        ))}
      </main>
    </div>
  );
};

const Executive = ({ data }: { data: ParsedResume }) => (
  <div style={{ ...PAGE, padding: 56 }}>
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -0.5, color: "#0f172a" }}>{data.name}</div>
      {data.headline && <div style={{ fontSize: 14, color: "#475569", marginTop: 2 }}>{data.headline}</div>}
      {data.contacts.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 10, color: "#475569" }}>{data.contacts.join("   |   ")}</div>
      )}
      <div style={{ height: 4, background: "#0f172a", marginTop: 14, width: 80 }} />
    </div>
    {data.sections.map((s, i) => (
      <section key={i} style={{ marginBottom: 16, display: "grid", gridTemplateColumns: "150px 1fr", gap: 16 }}>
        <h2 style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#0f172a", margin: 0 }}>{s.title}</h2>
        <div>{renderItems(s.items)}</div>
      </section>
    ))}
  </div>
);

const Minimal = ({ data }: { data: ParsedResume }) => (
  <div style={{ ...PAGE, padding: 72, fontFamily: "Helvetica, Arial, sans-serif" }}>
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 24, fontWeight: 300, letterSpacing: 4, textTransform: "uppercase" }}>{data.name}</div>
      {data.headline && <div style={{ fontSize: 11, color: "#666", marginTop: 6 }}>{data.headline}</div>}
      {data.contacts.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 10, color: "#666" }}>{data.contacts.join("   ·   ")}</div>
      )}
    </div>
    {data.sections.map((s, i) => (
      <section key={i} style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "#999", marginBottom: 8 }}>{s.title}</h2>
        {renderItems(s.items)}
      </section>
    ))}
  </div>
);

const Creative = ({ data }: { data: ParsedResume }) => (
  <div style={{ ...PAGE, padding: 0 }}>
    <div style={{ background: "linear-gradient(135deg,#f97316,#fb923c)", color: "#fff", padding: "36px 48px" }}>
      <div style={{ fontSize: 30, fontWeight: 800 }}>{data.name}</div>
      {data.headline && <div style={{ marginTop: 4, opacity: 0.95 }}>{data.headline}</div>}
      {data.contacts.length > 0 && (
        <div style={{ marginTop: 10, fontSize: 10 }}>{data.contacts.join("  •  ")}</div>
      )}
    </div>
    <div style={{ padding: "28px 48px" }}>
      {data.sections.map((s, i) => (
        <section key={i} style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, color: "#f97316", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6, borderLeft: "4px solid #f97316", paddingLeft: 8 }}>
            {s.title}
          </h2>
          {renderItems(s.items)}
        </section>
      ))}
    </div>
  </div>
);

const Technical = ({ data }: { data: ParsedResume }) => (
  <div style={{ ...PAGE, padding: 48, fontFamily: "Menlo, Consolas, 'Courier New', monospace", fontSize: 10.5 }}>
    <div style={{ borderBottom: "2px dashed #0ea5e9", paddingBottom: 12, marginBottom: 14 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#0ea5e9" }}>{data.name}</div>
      {data.headline && <div style={{ marginTop: 2, color: "#334155" }}>// {data.headline}</div>}
      {data.contacts.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 10, color: "#334155" }}>{data.contacts.join("  |  ")}</div>
      )}
    </div>
    {data.sections.map((s, i) => (
      <section key={i} style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 12, color: "#0ea5e9", marginBottom: 6 }}>## {s.title.toLowerCase()}</h2>
        <div style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>{renderItems(s.items)}</div>
      </section>
    ))}
  </div>
);

const Elegant = ({ data }: { data: ParsedResume }) => (
  <div style={{ ...PAGE, padding: 60, fontFamily: "Georgia, serif" }}>
    <div style={{ textAlign: "center", marginBottom: 22 }}>
      <div style={{ fontSize: 32, fontWeight: 400, letterSpacing: 2 }}>{data.name}</div>
      <div style={{ height: 1, background: "#a16207", width: 80, margin: "10px auto" }} />
      {data.headline && <div style={{ fontStyle: "italic", color: "#555" }}>{data.headline}</div>}
      {data.contacts.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 10, color: "#555" }}>{data.contacts.join("   ·   ")}</div>
      )}
    </div>
    {data.sections.map((s, i) => (
      <section key={i} style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 13, fontStyle: "italic", color: "#a16207", marginBottom: 6, textAlign: "center" }}>~ {s.title} ~</h2>
        {renderItems(s.items)}
      </section>
    ))}
  </div>
);

const Compact = ({ data }: { data: ParsedResume }) => (
  <div style={{ ...PAGE, padding: 36, fontSize: 10, lineHeight: 1.35 }}>
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{data.name}</div>
      <div style={{ fontSize: 10, color: "#374151" }}>
        {[data.headline, ...data.contacts].filter(Boolean).join("  •  ")}
      </div>
    </div>
    {data.sections.map((s, i) => (
      <section key={i} style={{ marginBottom: 10 }}>
        <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#374151", borderBottom: "1px solid #d1d5db", marginBottom: 4 }}>
          {s.title}
        </h2>
        {renderItems(s.items)}
      </section>
    ))}
  </div>
);

const MAP: Record<TemplateId, React.FC<{ data: ParsedResume }>> = {
  classic: Classic,
  modern: Modern,
  executive: Executive,
  minimal: Minimal,
  creative: Creative,
  technical: Technical,
  elegant: Elegant,
  compact: Compact,
};

export const ResumeTemplate = ({ id, data }: { id: TemplateId; data: ParsedResume }) => {
  const Comp = MAP[id] ?? Classic;
  return <Comp data={data} />;
};
