import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Live Demo — ThreadCounty" },
      { name: "description", content: "Try the ThreadCounty textile analysis instrument in real-time. No account required." },
    ],
  }),
  component: DemoPage,
});

const SWATCHES = [
  {
    id: "cotton",
    name: "Cotton Twill",
    type: "Twill 2/1 Cotton",
    density: 152, warp: 80, weft: 72,
    confidence: 99.8,
    scanId: "TC-8892",
    patternClass: "weave-pattern bg-[oklch(0.14_0.012_240)]",
    insights: [
      "Slight tension variance in weft quadrant B4.",
      "Consistency score 98.4% vs reference swatch.",
      "Recommended wash-shrinkage tolerance: 1.2%.",
    ],
  },
  {
    id: "denim",
    name: "Indigo Denim",
    type: "Twill 3/1 Indigo Denim",
    density: 112, warp: 62, weft: 50,
    confidence: 99.2,
    scanId: "DN-4771",
    patternClass: "bg-radial from-[oklch(0.35_0.08_240)] to-[oklch(0.20_0.05_240)] bg-[size:12px_12px] bg-[oklch(0.14_0.012_240)]",
    insights: [
      "Heavy warp thread yarn density detected.",
      "Loom tension alignment meets Grade-A specifications.",
      "Weft slub-count variance is within standard 0.05% margin.",
    ],
  },
  {
    id: "linen",
    name: "Raw Flax Linen",
    type: "Plain Weave Flax",
    density: 96, warp: 48, weft: 48,
    confidence: 98.7,
    scanId: "LN-9082",
    patternClass: "bg-[linear-gradient(45deg,oklch(0.22_0.012_240)_25%,transparent_25%),linear-gradient(-45deg,oklch(0.22_0.012_240)_25%,transparent_25%)] bg-[size:18px_18px] bg-[oklch(0.14_0.012_240)]",
    insights: [
      "Organic thickness fluctuations detected in flax fibers.",
      "Pore density distribution: 14% breathability coefficient.",
      "Thread count verified under ISO 7211-2 standards.",
    ],
  },
  {
    id: "silk",
    name: "Mulberry Silk Satin",
    type: "Satin 5-Harness Silk",
    density: 220, warp: 120, weft: 100,
    confidence: 99.9,
    scanId: "SL-3114",
    patternClass: "bg-gradient-to-tr from-[oklch(0.25_0.04_300)] via-[oklch(0.18_0.02_240)] to-[oklch(0.28_0.04_195)] bg-[size:200%_200%]",
    insights: [
      "Ultra-fine filament diameter detected (average 12 microns).",
      "Float length regularity: 99.95% accuracy.",
      "Perfect satin luster rating (Gloss factor: 88).",
    ],
  },
];

function DemoPage() {
  const [activeSwatch, setActiveSwatch] = useState(SWATCHES[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [displayDensity, setDisplayDensity] = useState(0);
  const [displayWarp, setDisplayWarp] = useState(0);
  const [displayWeft, setDisplayWeft] = useState(0);
  const [displayConfidence, setDisplayConfidence] = useState(0);

  const runAnimation = (s: typeof SWATCHES[0]) => {
    setIsScanning(true);
    setDisplayDensity(0); setDisplayWarp(0); setDisplayWeft(0); setDisplayConfidence(0);
    const steps = 30; const duration = 1200; let step = 0;
    const t = setInterval(() => {
      step++;
      const p = 1 - Math.pow(1 - step / steps, 3);
      setDisplayDensity(Math.round(s.density * p));
      setDisplayWarp(Math.round(s.warp * p));
      setDisplayWeft(Math.round(s.weft * p));
      setDisplayConfidence(Number((s.confidence * p).toFixed(1)));
      if (step >= steps) {
        clearInterval(t);
        setDisplayDensity(s.density); setDisplayWarp(s.warp); setDisplayWeft(s.weft);
        setDisplayConfidence(s.confidence); setIsScanning(false);
      }
    }, duration / steps);
  };

  useEffect(() => { runAnimation(activeSwatch); }, [activeSwatch]);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="border-b border-border bg-background py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <div className="tag mx-auto mb-4 w-fit">Live Demo</div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            See the instrument in action.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Select any fabric specimen below and watch the computer vision engine scan and classify it in real-time.
            No account required.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-sm bg-foreground text-background hover:bg-foreground/90 text-sm font-semibold tracking-wide">
              <Link to="/auth" search={{ mode: "signup" }}>
                Start free analysis <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-sm text-sm font-semibold tracking-wide">
              <Link to="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Instrument */}
      <section className="bg-foreground py-16 text-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="overflow-hidden rounded-lg border border-white/10 bg-[oklch(0.18_0.012_240)] shadow-2xl">
            {/* Swatch selector */}
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 p-4 bg-neutral-900 overflow-x-auto">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-background/40 mr-2">Select Specimen:</span>
              {SWATCHES.map((sw) => (
                <button
                  key={sw.id}
                  onClick={() => { if (!isScanning) setActiveSwatch(sw); }}
                  disabled={isScanning}
                  className={`rounded-sm px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-widest border transition-all duration-300 ${
                    isScanning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  } ${
                    activeSwatch.id === sw.id
                      ? "border-brand bg-brand text-brand-foreground shadow-[0_0_8px_oklch(0.50_0.10_195/0.4)]"
                      : "border-white/10 bg-white/[0.02] text-background/60 hover:border-white/30 hover:text-background"
                  }`}
                >
                  {sw.name}
                </button>
              ))}
            </div>

            <div className="grid gap-px bg-white/10 lg:grid-cols-[1fr_320px]">
              <div className="bg-[oklch(0.18_0.012_240)] p-6 lg:p-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-background/50">SCAN_ID · {activeSwatch.scanId}</span>
                    <span className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest transition-colors duration-300 ${
                      isScanning ? "bg-yellow-500/20 text-yellow-500" : "bg-brand/20 text-brand animate-pulse"
                    }`}>
                      {isScanning ? "Scanning..." : "Verified"}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-background/40">DEMO MODE</span>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-white/10 bg-[oklch(0.14_0.012_240)] shadow-inner">
                    <div className={`absolute inset-0 transition-all duration-700 ${activeSwatch.patternClass}`} />
                    <div className="absolute inset-0 grid-pattern opacity-30" />
                    {isScanning && <div className="absolute left-0 right-0 h-0.5 bg-brand shadow-[0_0_12px_var(--color-brand)] scan-laser z-10" />}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center">
                      <div className={`size-16 rounded-full border border-brand/40 flex items-center justify-center ${isScanning ? "animate-ping" : "animate-pulse"}`} />
                      <div className="absolute size-3 rounded-full border border-brand bg-brand/20" />
                    </div>
                    {!isScanning && (
                      <div className="absolute inset-0 pointer-events-none animate-in fade-in">
                        <span className="absolute left-[35%] top-[45%] size-1.5 rounded-full bg-brand animate-ping" />
                        <span className="absolute left-[65%] top-[55%] size-1.5 rounded-full bg-brand animate-ping" style={{ animationDelay: "450ms" }} />
                        <span className="absolute left-[50%] top-[30%] size-1.5 rounded-full bg-brand animate-ping" style={{ animationDelay: "900ms" }} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-5">
                    <DMetric label="Thread Density" value={displayDensity.toString()} unit="TPI" bar={displayDensity / 240} />
                    <div className="grid grid-cols-2 gap-3">
                      <DMini label="Warp" value={`${displayWarp} /cm`} />
                      <DMini label="Weft" value={`${displayWeft} /cm`} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <DMini label="Fabric Type" value={activeSwatch.type} />
                      <DMini label="Confidence" value={`${displayConfidence}%`} accent={!isScanning} />
                    </div>
                    <Link
                      to="/auth"
                      search={{ mode: "signup" }}
                      className={`flex w-full items-center justify-center rounded-sm py-3 font-mono text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 gap-2 ${
                        isScanning
                          ? "bg-white/10 text-background/40 pointer-events-none"
                          : "bg-background text-foreground hover:bg-brand hover:text-brand-foreground hover:shadow-md"
                      }`}
                    >
                      {isScanning ? (
                        <><Loader2 className="size-3 animate-spin text-brand" /> Scanning...</>
                      ) : (
                        <>Analyze your own fabric <ArrowRight className="size-3" /></>
                      )}
                    </Link>
                  </div>
                </div>
              </div>

              <aside className="bg-[oklch(0.14_0.012_240)] p-6 lg:p-8 flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-background/40">AI Insights & QC</span>
                  <ul className="mt-4 space-y-4 text-[13px] leading-relaxed text-background/70">
                    {activeSwatch.insights.map((ins, idx) => (
                      <li
                        key={idx}
                        className={`transition-all duration-500 transform ${isScanning ? "opacity-30 translate-x-2" : "opacity-100 translate-x-0"}`}
                        style={{ transitionDelay: `${idx * 150}ms` }}
                      >
                        <span className="text-brand mr-2 font-bold">+</span>{ins}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8 border-t border-white/10 pt-4 font-mono text-[9px] text-background/30 text-right">
                  THREADCOUNT VISION V2.4 · DEMO
                </div>
              </aside>
            </div>
          </div>

          {/* Stats Row */}
          <dl className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {[["12M+","Fibers analyzed"],["0.2s","Processing latency"],["99.8%","Detection accuracy"],["140+","Fabric variants"]].map(([v,l]) => (
              <div key={l} className="text-center">
                <div className="text-3xl font-semibold tracking-tight text-background">{v}</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-background/40">{l}</div>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </PublicLayout>
  );
}

function DMetric({ label, value, unit, bar }: { label: string; value: string; unit?: string; bar: number }) {
  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-widest text-background/50">{label}</span>
      <div className="mt-1 font-mono text-3xl tracking-tight text-background">
        {value} {unit && <span className="text-xs text-background/40">{unit}</span>}
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden bg-white/10">
        <div className="h-full bg-brand transition-all duration-500 ease-out" style={{ width: `${bar * 100}%` }} />
      </div>
    </div>
  );
}

function DMini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-sm border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-background/40">{label}</div>
      <div className={`mt-0.5 text-sm font-medium ${accent ? "text-brand" : "text-background"}`}>{value}</div>
    </div>
  );
}
