import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How does AI resume tailoring work?", a: "We analyze the job posting to extract requirements, skills, and language patterns the employer (and their ATS) cares about. Then we rewrite your resume — keeping every fact true — to emphasize the most relevant experience and weave in the right keywords." },
  { q: "Why should I use ATS-optimized resumes?", a: "Over 90% of large employers use Applicant Tracking Systems to filter resumes before a human ever sees them. If your resume doesn't contain the right keywords in the right structure, you're rejected automatically — no matter how qualified you are." },
  { q: "How much time can I save?", a: "Users report going from 1–2 hours per tailored application to under a minute. If you apply to 30 jobs a month, that's roughly 50 hours back." },
  { q: "Can it generate cover letters?", a: "Yes — every tailoring includes a personalized 3-paragraph cover letter referencing the company, role, and your most relevant experience." },
  { q: "Which job boards does it work with?", a: "Any of them. Just paste the job description text — LinkedIn, Indeed, Greenhouse, Lever, company career pages, even Slack job channels." },
  { q: "Is my data private and secure?", a: "Yes. Your resume is never used to train AI models. Data is encrypted in transit and at rest, and you can delete everything at any time." },
  { q: "Is it free?", a: "Yes — get started free with no credit card. Premium features for power users are coming soon." },
];

export const FAQ = () => (
  <section id="faq" className="bg-gradient-soft py-24 border-y border-border">
    <div className="container max-w-3xl">
      <div className="text-center mb-12 space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-primary">FAQ</div>
        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
          Questions, <span className="font-serif italic text-gradient">answered</span>
        </h2>
      </div>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="rounded-xl border border-border bg-card px-6 shadow-sm">
            <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed pb-5">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
