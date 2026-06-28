import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — ThreadCounty" },
      { name: "description", content: "Common questions about ThreadCounty — the platform, AI analysis, pricing, upload limits and accounts." },
      { property: "og:title", content: "ThreadCounty FAQ" },
      { property: "og:description", content: "Answers about the platform, AI accuracy, pricing and accounts." },
    ],
  }),
  component: FAQPage,
});

const GROUPS = [
  {
    title: "Platform",
    items: [
      ["What is ThreadCounty?", "ThreadCounty is an AI platform that analyzes textile structure from fabric images. Upload a photo and receive thread density, warp/weft counts, weave identification and a downloadable lab report."],
      ["Who is it for?", "Textile manufacturers, mills, designers, students, researchers and QC teams. Anyone who needs fast, consistent fabric measurement."],
      ["Do I need special hardware?", "No. A standard phone camera or flatbed scan is enough. For best accuracy, take a macro photo with even lighting."],
    ],
  },
  {
    title: "AI Analysis",
    items: [
      ["How accurate is the analysis?", "Benchmarked at 99.8% alignment with laboratory microscope counts on standard woven fabrics. Accuracy varies for unusual blends or low-resolution photos."],
      ["What metrics does it return?", "Thread density (TPI), warp count, weft count, weave pattern, fabric type classification, confidence score and qualitative AI suggestions."],
      ["Can it handle knitted fabrics?", "Yes, with reduced accuracy on complex jacquard knits. Best results are on woven structures and standard knits."],
    ],
  },
  {
    title: "Pricing & Plans",
    items: [
      ["Is there a free plan?", "Yes — Free includes 5 analyses per month with no credit card required."],
      ["Can I switch plans?", "Anytime, from your profile. Upgrades are immediate; downgrades take effect at the next renewal."],
      ["Do you offer discounts for education?", "Yes — the Student plan is $9/mo. Bulk educational licenses are available; contact us."],
    ],
  },
  {
    title: "Uploads & Limits",
    items: [
      ["What image formats are supported?", "JPG, PNG and JPEG up to 10MB per image."],
      ["Are batch uploads available?", "Yes, on Professional and Enterprise plans."],
      ["Where are my images stored?", "Securely in our cloud storage with per-user access control. Only you (and the admin) can view your uploads."],
    ],
  },
  {
    title: "Account",
    items: [
      ["How do I delete my account?", "From your profile, click 'Delete account'. All your data is permanently removed."],
      ["I forgot my password.", "Use the 'Forgot password?' link on the sign-in page. We'll email you a reset link."],
      ["Can I export my reports?", "Yes — every report has a download button. Bulk export is available on Professional+ plans."],
    ],
  },
];

function FAQPage() {
  return (
    <PublicLayout>
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal direction="up">
            <div className="tag mx-auto mb-4 w-fit">Knowledge base</div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Questions, answered.</h1>
            <p className="mt-4 text-muted-foreground">
              Browse common questions about the platform, accuracy, pricing and accounts.
            </p>
          </ScrollReveal>
        </div>
      </section>
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-3xl space-y-12 px-6">
          {GROUPS.map((g, i) => (
            <ScrollReveal key={g.title} delay={i * 80} duration={500} direction="up" distance="15px">
              <div>
                <div className="tag mb-4">{g.title}</div>
                <Accordion type="single" collapsible className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
                  {g.items.map(([q, a]) => (
                    <AccordionItem key={q} value={q} className="border-b border-border last:border-0">
                      <AccordionTrigger className="px-5 text-left text-sm font-semibold hover:no-underline hover:text-brand transition-colors duration-200">
                        {q}
                      </AccordionTrigger>
                      <AccordionContent className="px-5 text-sm text-muted-foreground leading-relaxed transition-all duration-300">
                        {a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

