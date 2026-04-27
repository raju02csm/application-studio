import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { extractText, getDocumentProxy } from "https://esm.sh/unpdf@0.12.1";
import { extractRawText } from "https://esm.sh/mammoth@1.8.0/mammoth.browser.js";

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
    const result = await extractRawText({ arrayBuffer: binary.buffer });
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

Your output MUST be returned by calling the provided function with these fields:
- matchScore: integer 0-100 representing the overall ATS match score
- summary: 1-2 sentence assessment
- missingKeywords: array of important keywords from the JD missing in the resume
- matchedKeywords: array of keywords already present that align with JD
- suggestions: array of 4-7 concrete improvements
- tailoredResume: rewritten resume optimized for this JD (preserve all factual info, only enhance phrasing/keywords)
- coverLetter: a personalized 3-paragraph cover letter for this role`;

    const userPrompt = `JOB DESCRIPTION:\n${jobDescription}\n\n---\n\nCANDIDATE RESUME:\n${resumeText}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
