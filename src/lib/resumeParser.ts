// Lightweight heuristic parser that converts a plain-text resume into
// structured sections so the templates can render it nicely.

export interface ResumeSection {
  title: string;
  items: string[]; // each item may be multi-line (joined with \n)
}

export interface ParsedResume {
  name: string;
  headline: string;
  contacts: string[];
  summary: string;
  sections: ResumeSection[];
}

const SECTION_HEADINGS = [
  "summary", "profile", "objective", "about",
  "experience", "work experience", "professional experience", "employment",
  "education", "academic", "qualifications",
  "skills", "technical skills", "core skills", "core competencies", "expertise",
  "projects", "selected projects",
  "certifications", "certificates", "licenses",
  "awards", "achievements", "honors",
  "publications", "languages", "interests", "volunteer", "activities",
];

const isHeading = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 60) return false;
  const lower = trimmed.toLowerCase().replace(/[:\-–—]+$/, "").trim();
  if (SECTION_HEADINGS.includes(lower)) return true;
  // ALL CAPS short line is likely a heading
  const letters = trimmed.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 3 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) return true;
  return false;
};

const CONTACT_RE = /(@|https?:\/\/|linkedin|github|gitlab|portfolio|\+?\d[\d\s().-]{6,}\d|\b[\w.-]+@[\w.-]+\.\w+\b)/i;

export function parseResume(text: string): ParsedResume {
  const raw = (text || "").replace(/\r/g, "").trim();
  const lines = raw.split("\n").map((l) => l.replace(/\s+$/g, ""));

  // ---- Header detection (name + contacts) ----
  let cursor = 0;
  while (cursor < lines.length && !lines[cursor].trim()) cursor++;

  let name = "";
  let headline = "";
  const contacts: string[] = [];

  if (cursor < lines.length) {
    name = lines[cursor].trim().replace(/\s*\|\s*/g, " · ");
    cursor++;
  }

  // Next 1-4 non-empty lines: headline + contacts (until first heading or empty gap)
  let scanned = 0;
  while (cursor < lines.length && scanned < 6) {
    const line = lines[cursor].trim();
    if (!line) { cursor++; scanned++; continue; }
    if (isHeading(line)) break;
    if (CONTACT_RE.test(line)) {
      // split combined contact lines on common separators
      line.split(/\s*[|·•]\s*/).map((p) => p.trim()).filter(Boolean).forEach((p) => contacts.push(p));
    } else if (!headline && line.length < 90) {
      headline = line;
    } else {
      contacts.push(line);
    }
    cursor++;
    scanned++;
  }

  // If the "name" line is actually a combined header like "Jane Doe | Engineer | jane@x.com"
  if (name.includes(" · ") && contacts.length === 0 && !headline) {
    const parts = name.split(" · ").map((p) => p.trim());
    name = parts.shift() || name;
    parts.forEach((p) => (CONTACT_RE.test(p) ? contacts.push(p) : (headline ||= p)));
  }

  // ---- Section parsing ----
  const sections: ResumeSection[] = [];
  let current: ResumeSection | null = null;
  let buffer: string[] = [];

  const flushItem = () => {
    if (!current) return;
    const item = buffer.join("\n").trim();
    if (item) current.items.push(item);
    buffer = [];
  };
  const flushSection = () => {
    flushItem();
    if (current && current.items.length) sections.push(current);
    current = null;
  };

  for (; cursor < lines.length; cursor++) {
    const line = lines[cursor];
    const trimmed = line.trim();

    if (isHeading(trimmed)) {
      flushSection();
      current = { title: trimmed.replace(/[:\-–—]+$/, "").trim(), items: [] };
      continue;
    }

    if (!current) {
      // Pre-section content goes into a synthetic Summary
      current = { title: "Summary", items: [] };
    }

    if (!trimmed) {
      flushItem();
      continue;
    }

    // Bullet line starts a new item
    if (/^[-•*–·]\s+/.test(trimmed)) {
      flushItem();
      buffer.push(trimmed.replace(/^[-•*–·]\s+/, ""));
    } else {
      buffer.push(trimmed);
    }
  }
  flushSection();

  // Pull a summary out for convenience
  let summary = "";
  const summaryIdx = sections.findIndex((s) => /summary|profile|objective|about/i.test(s.title));
  if (summaryIdx >= 0) {
    summary = sections[summaryIdx].items.join(" ");
  }

  return { name: name || "Your Name", headline, contacts, summary, sections };
}
