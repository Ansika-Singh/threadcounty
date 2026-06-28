import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — ThreadCounty" },
      { name: "description", content: "Our mission: bring laboratory-grade textile measurement to every mill, designer and researcher through computer vision." },
      { property: "og:title", content: "About ThreadCounty" },
      { property: "og:description", content: "Computer vision built for the textile industry." },
    ],
  }),
  component: AboutPage,
});

const TIMELINE = [
  { y: "2023", t: "Founded", d: "Started in a small lab with a Leica microscope and a frustration with manual thread counting." },
  { y: "2024", t: "Vision 1.0", d: "First computer vision model trained on 200K fabric samples." },
  { y: "2025", t: "First mill deployment", d: "Loomworks Mills runs ThreadCounty on every batch in production QC." },
  { y: "2026", t: "Vision 2.0", d: "4.2M samples, 99.8% accuracy, full weave structure recognition." },
];

const TEAM = [
  { n: "Anika Roy", r: "CEO & Co-founder", b: "Former QC lead at Loomworks Mills. 12 years in textile inspection." },
  { n: "Dr. Priya Subramaniam", r: "Chief Research Officer", b: "Textile chemistry PhD, ex-NIFT. Authored 30+ papers on weave analysis." },
  { n: "Marc Geffroy", r: "Head of Design", b: "Designed weaves for Hermès and Atelier 19 before joining ThreadCounty." },
  { n: "Yuki Tanaka", r: "Head of Engineering", b: "Computer vision at scale. Previously at a major imaging-instruments company." },
];

function AboutPage() {
  return (
    <PublicLayout>
      <section className="border-b border-border bg-background py-24">
        <div className="mx-auto max-w-4xl px-6">
          <ScrollReveal direction="up">
            <div className="tag mb-4">Our story</div>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              We're building the precision instrument the textile industry was missing.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Thread density is the most fundamental quality metric in textile manufacturing — and for
              decades, the only way to measure it was a magnifier and a steady hand. ThreadCounty
              replaces that with computer vision that's faster, more consistent, and globally
              available.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-border bg-surface py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-2">
          <ScrollReveal direction="left" distance="20px">
            <div>
              <div className="tag mb-3">Mission</div>
              <h2 className="text-2xl font-semibold tracking-tight">Make laboratory-grade textile measurement universally accessible.</h2>
              <p className="mt-3 text-muted-foreground">
                Whether you're a student in a textile college, a designer sourcing swatches, or a QC
                team running a 50,000-meter day — you should have the same precision instrument.
              </p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right" distance="20px">
            <div>
              <div className="tag mb-3">Vision</div>
              <h2 className="text-2xl font-semibold tracking-tight">A world where every meter of fabric is measured, traced, and trusted.</h2>
              <p className="mt-3 text-muted-foreground">
                Supply-chain confidence starts with measurement. We're building the standard layer of
                data underneath the global textile economy.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="tag mb-4">Technology</div>
            <h2 className="text-3xl font-semibold tracking-tight">What's under the hood.</h2>
          </ScrollReveal>
          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
            {[
              { t: "Computer vision", d: "Custom convolutional models trained on 4.2M textile samples spanning natural and synthetic fibers." },
              { t: "Edge inference", d: "Sub-1.5-second analysis on standard cloud hardware. No GPU required for end users." },
              { t: "ISO alignment", d: "Output metrics align with ISO 7211-2 thread count methodology for direct compliance use." },
            ].map((x, i) => (
              <ScrollReveal key={x.t} delay={i * 100} duration={500}>
                <div className="bg-card p-8 h-full border border-transparent hover:border-brand/20 hover:bg-surface/10 transition-all duration-300">
                  <h3 className="text-base font-semibold">{x.t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{x.d}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface py-20">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="tag mb-4">Team</div>
            <h2 className="text-3xl font-semibold tracking-tight">The people building ThreadCounty.</h2>
          </ScrollReveal>
          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((m, i) => (
              <ScrollReveal key={m.n} delay={i * 100} duration={500} direction="up">
                <div className="bg-card p-6 h-full border border-transparent hover:border-brand/20 hover:shadow-lg transition-all duration-300 group">
                  <div className="aspect-square w-full rounded-sm weave-pattern bg-surface-2 transition-transform duration-500 group-hover:scale-[1.02]" />
                  <h3 className="mt-4 text-base font-semibold">{m.n}</h3>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-brand">{m.r}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{m.b}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-3xl px-6">
          <ScrollReveal>
            <div className="tag mb-4">Timeline</div>
            <h2 className="text-3xl font-semibold tracking-tight">How we got here.</h2>
          </ScrollReveal>
          <ol className="mt-10 space-y-8 border-l border-border pl-6">
            {TIMELINE.map((t, i) => (
              <ScrollReveal key={t.y} delay={i * 120} direction="right" distance="15px">
                <li className="relative group">
                  <span className="absolute -left-[31px] top-1.5 size-3 rounded-full bg-brand ring-4 ring-background transition-transform duration-300 group-hover:scale-125" />
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t.y}</div>
                  <h3 className="mt-1 text-lg font-semibold group-hover:text-brand transition-colors">{t.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.d}</p>
                </li>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </section>
    </PublicLayout>
  );
}

