import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { extractText, getDocumentProxy } from "https://esm.sh/unpdf@0.12.1";
import mammoth from "https://esm.sh/mammoth@1.8.0/mammoth.browser.js";

async function decodeFile(base64: string, mimeType: string, filename: string): Promise<string> {
  const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const lower = (filename || "").toLowerCase();

  // PDF
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) {
    const pdf = await getDocumentProxy(binary);
    const { text } = await extractText(pdf, { mergePages: true });
    return Array.isArray(text) ? text.join("\n") : text;
  }

  // DOCX
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ arrayBuffer: binary.buffer });
    return result.value;
  }

  // Legacy DOC — best-effort plain extraction
  if (mimeType === "application/msword" || lower.endsWith(".doc")) {
    // Strip non-printable bytes; not perfect but usable for simple .doc files
    const text = new TextDecoder("utf-8", { fatal: false }).decode(binary);
    return text.replace(/[^\x09\x0A\x0D\x20-\x7E]+/g, " ").replace(/\s+/g, " ").trim();
  }

  // Plain text fallback
  return new TextDecoder("utf-8", { fatal: false }).decode(binary);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resume, resumeFile, jobDescription } = await req.json();

    let resumeText = (resume ?? "").toString();

    if (resumeFile && resumeFile.data) {
      try {
        resumeText = await decodeFile(resumeFile.data, resumeFile.type ?? "", resumeFile.name ?? "");
      } catch (err) {
        console.error("File parsing error:", err);
        return new Response(
          JSON.stringify({ error: "Could not read that file. Try a different PDF or paste the text directly." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    if (!resumeText.trim() || !jobDescription) {
      return new Response(JSON.stringify({ error: "Resume content and job description are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const systemPrompt = `You are an elite ATS resume optimization expert and career coach. You analyze resumes against job descriptions and produce tailored, ATS-friendly rewrites plus a personalized cover letter.

CRITICAL REWRITE RULES for tailoredResume:
1. You MUST meaningfully rewrite the resume — DO NOT return the original text unchanged.
2. You MUST naturally weave EVERY item from missingKeywords into the resume body (Summary, Experience bullets, Skills section). Each missing keyword should appear at least once in a truthful, contextually relevant place.
   - If a missing keyword is a tool/tech (e.g. "Docker", "GraphQL", "Kubernetes"), add it to the Skills section AND, where plausible, to an experience bullet (e.g. "...containerized services with Docker...").
   - If a missing keyword is a concept (e.g. "microservices", "CI/CD", "mentoring"), reframe an existing bullet to reflect it.
   - PYTHON ECOSYSTEM PRIORITY: Always recognize, preserve, and elevate Python and its ecosystem (Django, Flask, FastAPI, pandas, NumPy, PyTorch, TensorFlow, scikit-learn, Celery, SQLAlchemy, pytest, Poetry, Airflow, Pydantic, asyncio, Jupyter, etc.). If the JD mentions Python or any Python framework/library, ensure it is prominently placed in the Professional Summary, grouped first under Skills (e.g. "Languages: Python, ..."), and reflected in at least 2 experience bullets with concrete Pythonic phrasing (e.g. "Built async REST APIs with FastAPI and Pydantic", "Automated ETL pipelines with pandas and Airflow"). Never drop Python skills that exist in the original resume.
3. Rewrite EVERY experience bullet to be impact-driven: start with a strong action verb, quantify outcomes where possible, and mirror phrasing from the job description.
4. Add a "PROFESSIONAL SUMMARY" section at the top (2-3 lines) tailored to the target role, using language from the JD.
5. Reorder and expand the SKILLS section so JD-relevant skills appear first; group them (e.g. "Languages:", "Frameworks:", "Cloud & DevOps:").
6. Preserve all true facts (employers, dates, degrees, real metrics) — never fabricate jobs, dates, or degrees. You MAY infer reasonable scope/impact phrasing.
7. The tailoredResume MUST be visibly different and longer/richer than the input. If the input is short, expand bullets with plausible detail consistent with the role.

Output via the provided function with these fields:
- matchScore: integer 0-100 (score the ORIGINAL resume vs the JD, before your rewrite)
- summary: 1-2 sentence assessment of the original
- missingKeywords: important JD keywords missing from the ORIGINAL resume
- matchedKeywords: JD keywords already present in the ORIGINAL resume
- suggestions: 4-7 concrete improvements you applied
- tailoredResume: the fully rewritten resume that incorporates ALL missingKeywords (per rules above)
- coverLetter: a personalized 3-paragraph cover letter for this role`;

    const userPrompt = `JOB DESCRIPTION:\n${jobDescription}\n\n---\n\nCANDIDATE RESUME:\n${resumeText}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_tailored_application",
              description: "Return the tailored resume analysis and outputs",
              parameters: {
                type: "object",
                properties: {
                  matchScore: { type: "integer", minimum: 0, maximum: 100 },
                  summary: { type: "string" },
                  missingKeywords: { type: "array", items: { type: "string" } },
                  matchedKeywords: { type: "array", items: { type: "string" } },
                  suggestions: { type: "array", items: { type: "string" } },
                  tailoredResume: { type: "string" },
                  coverLetter: { type: "string" },
                },
                required: ["matchScore", "summary", "missingKeywords", "matchedKeywords", "suggestions", "tailoredResume", "coverLetter"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_tailored_application" } },
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No structured output returned" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const result = JSON.parse(toolCall.function.arguments);
    // Echo back the parsed resume text so the UI can show it
    result.parsedResumePreview = resumeText.slice(0, 400);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tailor-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
