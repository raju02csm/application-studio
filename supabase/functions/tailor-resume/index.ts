import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { resume, jobDescription } = await req.json();
    if (!resume || !jobDescription) {
      return new Response(JSON.stringify({ error: "resume and jobDescription are required" }), {
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

    const userPrompt = `JOB DESCRIPTION:\n${jobDescription}\n\n---\n\nCANDIDATE RESUME:\n${resume}`;

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
