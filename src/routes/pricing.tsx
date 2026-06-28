import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — ThreadCounty" },
      { name: "description", content: "Flexible plans for students, professionals and enterprise mills. Start free, no credit card required." },
      { property: "og:title", content: "ThreadCounty Pricing" },
      { property: "og:description", content: "Free, Student, Professional and Enterprise plans for textile analysis." },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    name: "Free",
    id: "free",
    price: "$0",
    period: "/mo",
    desc: "For trying ThreadCounty.",
    features: ["5 analyses / month", "Web dashboard", "Basic AI insights", "PNG/JPG upload"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Student",
    id: "student",
    price: "$9",
    period: "/mo",
    desc: "For students and researchers.",
    features: ["50 analyses / month", "Weave identification", "PDF report download", "Email support"],
    cta: "Choose Student",
    featured: false,
  },
  {
    name: "Professional",
    id: "professional",
    price: "$49",
    period: "/mo",
    desc: "For working textile professionals.",
    features: ["500 analyses / month", "Batch upload", "Advanced AI suggestions", "Priority processing", "Searchable archive"],
    cta: "Start trial",
    featured: true,
  },
  {
    name: "Enterprise",
    id: "enterprise",
    price: "Custom",
    period: "",
    desc: "For mills and large teams.",
    features: ["Unlimited analyses", "Custom AI training", "Full API access", "Dedicated instance", "SSO & SLA"],
    cta: "Contact sales",
    featured: false,
  },
] as const;

function PricingPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  
  // Checkout Modal State
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[number] | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Form fields
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [nameOnCard, setNameOnCard] = useState("");

  // Fetch current user subscription
  const { data: subscription } = useQuery({
    enabled: !!user,
    queryKey: ["user_subscription", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const currentPlan = subscription?.plan ?? "free";

  const handleSubscribeClick = (plan: typeof PLANS[number]) => {
    if (plan.id === currentPlan) {
      toast.info(`You are already subscribed to the ${plan.name} plan.`);
      return;
    }
    
    if (plan.id === "enterprise") {
      // Directs to contact sales
      return;
    }

    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPlan) return;

    if (selectedPlan.id !== "free") {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        toast.error("Please enter a valid credit card number.");
        return;
      }
      if (!expiry || cvv.length < 3) {
        toast.error("Please enter expiry date and CVV.");
        return;
      }
    }

    setProcessing(true);
    // Simulate transaction delay
    await new Promise((r) => setTimeout(r, 1500));

    const { error } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        plan: selectedPlan.id,
        status: "active",
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: "user_id" });

    setProcessing(false);
    setCheckoutOpen(false);

    if (error) {
      toast.error("Failed to upgrade subscription: " + error.message);
    } else {
      toast.success(`Success! You have activated the ${selectedPlan.name} plan.`);
      qc.invalidateQueries({ queryKey: ["user_subscription"] });
      // Reset checkout form
      setCardNumber("");
      setExpiry("");
      setCvv("");
      setNameOnCard("");
    }
  };

  return (
    <PublicLayout>
      <section className="border-b border-border bg-background py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <ScrollReveal>
            <div className="tag mx-auto mb-4 w-fit">Pricing</div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Scale your analysis.</h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Flexible plans for independent researchers and industrial-scale mills. No credit card to start.
            </p>
            {user && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1.5 text-xs text-brand font-mono">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex size-1.5 rounded-full bg-brand"></span>
                </span>
                ACTIVE PLAN: <span className="font-bold uppercase">{currentPlan}</span>
              </div>
            )}
          </ScrollReveal>
        </div>
      </section>

      <section className="border-b border-border bg-surface py-16">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p, i) => {
            const isCurrent = user && currentPlan === p.id;
            return (
              <ScrollReveal key={p.name} delay={i * 100} duration={600}>
                <div
                  className={`relative flex flex-col rounded-md border bg-card p-6 h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg ${
                    p.featured ? "border-brand shadow-instrument" : "border-border"
                  } ${isCurrent ? "ring-1 ring-brand bg-card" : ""}`}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-sm bg-brand px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-foreground shadow-sm">
                      Most popular
                    </span>
                  )}
                  
                  {isCurrent && (
                    <span className="absolute -top-3 right-3 rounded-sm bg-muted px-2 py-0.5 font-mono text-[8px] font-semibold uppercase tracking-widest border border-border">
                      Current
                    </span>
                  )}

                  <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">{p.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                  <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand animate-scale-in" />
                        <span className="text-foreground/80">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    disabled={isCurrent && p.id !== "free"}
                    onClick={() => handleSubscribeClick(p)}
                    className={`mt-6 h-10 rounded-sm w-full transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] ${
                      p.featured
                        ? "bg-brand text-brand-foreground hover:bg-brand/90"
                        : "bg-card border border-border text-foreground hover:bg-accent"
                    }`}
                    asChild={!user || p.id === "enterprise"}
                  >
                    {p.id === "enterprise" ? (
                      <Link to="/contact">Contact sales</Link>
                    ) : !user ? (
                      <Link to="/auth" search={{ mode: "signup" }}>{p.cta}</Link>
                    ) : (
                      <span>
                        {isCurrent ? "Current Plan" : p.id === "free" ? "Downgrade" : "Upgrade"}
                      </span>
                    )}
                  </Button>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <ScrollReveal>
            <h2 className="text-2xl font-semibold tracking-tight">Need a custom plan?</h2>
            <p className="mt-3 text-muted-foreground">
              Enterprise customers can request volume pricing, on-prem deployment, custom AI training and dedicated SLAs.
            </p>
            <Button asChild variant="outline" className="mt-6 rounded-sm hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Link to="/contact">Talk to sales</Link>
            </Button>
          </ScrollReveal>
        </div>
      </section>


      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border rounded-md font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="size-5 text-brand" /> Secure Checkout
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Confirm your subscription details to activate the plan.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCheckoutSubmit} className="space-y-4 py-2">
            <div className="rounded-sm border border-border bg-surface p-3.5 space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Plan selection</span>
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold">{selectedPlan?.name} Subscription</span>
                <span className="text-sm font-bold font-mono">{selectedPlan?.price}{selectedPlan?.period}</span>
              </div>
            </div>

            {selectedPlan?.id !== "free" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="card-name" className="text-xs text-muted-foreground">Cardholder Name</Label>
                  <Input
                    id="card-name"
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                    placeholder="Anika Roy"
                    required
                    className="h-9 rounded-sm border-border text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="card-num" className="text-xs text-muted-foreground">Card Number</Label>
                  <Input
                    id="card-num"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim())}
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    required
                    className="h-9 rounded-sm border-border text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="card-expiry" className="text-xs text-muted-foreground">Expiration (MM/YY)</Label>
                    <Input
                      id="card-expiry"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value.replace(/\D/g, "").replace(/(.{2})/, "$1/").trim())}
                      placeholder="12/28"
                      maxLength={5}
                      required
                      className="h-9 rounded-sm border-border text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="card-cvv" className="text-xs text-muted-foreground">CVV</Label>
                    <Input
                      id="card-cvv"
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").trim())}
                      placeholder="***"
                      maxLength={4}
                      required
                      className="h-9 rounded-sm border-border text-xs font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center gap-2 rounded-sm border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[11px] text-amber-600 dark:text-amber-400">
              <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <span className="font-semibold">Demo Mode — No real charges.</span>&nbsp;This is a demo checkout. Your card will not be billed. Payment integration is coming soon.
            </div>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground border-t border-border pt-3">
              <ShieldCheck className="size-4 text-brand shrink-0" />
              <span>SSL Encrypted. Safe checkout, cancel anytime.</span>
            </div>

            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCheckoutOpen(false)}
                disabled={processing}
                className="h-10 rounded-sm text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processing}
                className="h-10 rounded-sm text-xs bg-foreground text-background hover:bg-foreground/90 flex gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Activating…
                  </>
                ) : (
                  "Confirm Order"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
