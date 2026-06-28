import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert,
  Zap
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

import { toast } from "sonner";

type Mode = "login" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    mode: (s.mode === "signup" || s.mode === "forgot" ? s.mode : "login") as Mode,
    code: s.code as string | undefined,
    error: s.error as string | undefined,
    error_description: s.error_description as string | undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — ThreadCounty" },
      { name: "description", content: "Sign in or create your ThreadCounty account to start analyzing fabric samples." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();

  // Redirect signed-in users away
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <div className="grid min-h-screen lg:grid-cols-12 bg-[#FBFBFA] selection:bg-brand/10 selection:text-brand-dark overflow-hidden relative">
      {/* Decorative gradient background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] rounded-full bg-[#14B8A6]/5 blur-[100px] pointer-events-none" />
      
      {/* Left panel: Auth forms */}
      <div className="lg:col-span-5 flex flex-col p-6 sm:p-10 lg:p-12 justify-between z-10 min-h-screen">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            Back to site <ArrowRight className="size-3" />
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <AuthPanel />
        </div>

        <div className="text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
          © {new Date().getFullYear()} ThreadCounty Labs · Intelligent Metrology
        </div>
      </div>

      {/* Right panel: Premium Inspections Dashboard Mockup */}
      <aside className="lg:col-span-7 relative hidden overflow-hidden border-l border-border bg-neutral-950 lg:flex flex-col justify-between p-12 text-white">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-brand/5 blur-[150px] pointer-events-none" />

        <div className="flex items-center justify-between z-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400/80 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-brand animate-pulse" />
            Inspection System Active
          </div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            v2.4.92 / SECURE
          </div>
        </div>

        {/* Live scanning mockup container */}
        <div className="relative flex-1 flex flex-col justify-center items-center py-6 z-10">
          <div className="relative w-full max-w-md aspect-square rounded-xl border border-white/5 bg-neutral-900/40 backdrop-blur-md shadow-2xl p-6 flex flex-col justify-between overflow-hidden group">
            {/* Ambient HUD grid lines */}
            <div className="absolute inset-0 border border-white/5 m-4 pointer-events-none rounded opacity-30" />
            
            {/* Upper tags */}
            <div className="flex justify-between items-center z-10 font-mono text-[9px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="size-1 bg-[#14B8A6] rounded-full animate-ping" />
                Live spec: Twill_Weave_04
              </span>
              <span>MAG: 400X</span>
            </div>

            {/* Scanning Scope */}
            <div className="relative w-48 h-48 my-auto mx-auto rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
              {/* Rotating target grid */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent animate-[spin_20s_linear_infinite]" 
                   style={{ backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.1) 1px, transparent 1px)", backgroundSize: "12px 12px" }} 
              />
              
              {/* Scanning sweep beam */}
              <div className="absolute left-0 top-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#14B8A6]/60 to-transparent shadow-[0_0_10px_#14B8A6] animate-[bounce_4s_ease-in-out_infinite]" />
              
              {/* Core focus reticle */}
              <div className="size-32 rounded-full border border-brand/20 border-dashed animate-[spin_40s_linear_infinite]" />
              <div className="absolute size-4 border border-brand/40 rounded-full" />
              <div className="absolute w-6 h-px bg-[#14B8A6]/50" />
              <div className="absolute h-6 w-px bg-[#14B8A6]/50" />
              
              {/* Circular scope data indicator */}
              <svg className="absolute inset-0 size-full -rotate-90 opacity-40" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="transparent" stroke="#14B8A6" strokeWidth="1" strokeDasharray="10 30" />
                <circle cx="50" cy="50" r="44" fill="transparent" stroke="#0F766E" strokeWidth="0.5" strokeDasharray="200 40" className="animate-[spin_30s_linear_infinite]" />
              </svg>
            </div>

            {/* Under HUD metrics grid */}
            <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4 font-mono z-10">
              <div className="bg-neutral-900/60 p-2 rounded border border-white/5">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Density</span>
                <span className="text-[11px] font-semibold text-white">88 threads/cm</span>
              </div>
              <div className="bg-neutral-900/60 p-2 rounded border border-white/5">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Warp/Weft</span>
                <span className="text-[11px] font-semibold text-brand">54 : 34</span>
              </div>
              <div className="bg-neutral-900/60 p-2 rounded border border-white/5">
                <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Confidence</span>
                <span className="text-[11px] font-semibold text-[#14B8A6]">99.82%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footnote testimonial */}
        <div className="z-10 max-w-md">
          <blockquote className="text-xl font-medium leading-relaxed text-slate-200">
            "The optical thread counting interface is unbelievably fast and accurate. Our QC process went from minutes to a click."
          </blockquote>
          <div className="mt-5 flex items-center gap-3 border-t border-white/5 pt-4">
            <div>
              <div className="text-xs font-semibold text-white">Anika Roy</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
                Head of Quality, Loomworks Mills
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}




function AuthPanel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleEnter() {
    setLoading(true);
    
    // Generate a completely random fresh email every time to completely bypass 
    // any existing user state or unconfirmed email blocks in Supabase!
    const randomId = Math.random().toString(36).substring(7);
    const demoEmail = `demo_${randomId}@threadcounty.com`;
    const demoPassword = "ThreadCountyDemo123!";

    const { error: signUpError } = await supabase.auth.signUp({
      email: demoEmail,
      password: demoPassword,
      options: {
        data: { full_name: "Demo Guest" },
      },
    });

    if (signUpError) {
      // If signup fails (maybe rate limited), fallback to anonymous sign in
      const { error: anonError } = await supabase.auth.signInAnonymously();
      setLoading(false);
      
      if (anonError) {
        toast.error(`Access failed: ${anonError.message}. Supabase is blocking new sessions.`);
      } else {
        toast.success("Welcome! Demo account initialized anonymously.");
        navigate({ to: "/dashboard" });
      }
    } else {
      // Because we added an auto-confirm SQL trigger, signUp creates a confirmed user on the backend.
      // But signUp doesn't give us a session if confirmation is required in settings, 
      // so we MUST sign in manually to get the token!
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      setLoading(false);
      
      if (signInError) {
        toast.error(`Login failed: ${signInError.message}. Retrying as guest...`);
        // Fallback to anonymous signin one last time
        const { error: finalAnonError } = await supabase.auth.signInAnonymously();
        if (finalAnonError) {
            toast.error("Complete auth failure. Please disable Email Confirmations in Supabase.");
        } else {
            toast.success("Welcome! Demo account initialized anonymously.");
            navigate({ to: "/dashboard" });
        }
      } else {
        toast.success("Welcome! Demo account initialized.");
        navigate({ to: "/dashboard" });
      }
    }
  }

  return (
    <div className="space-y-8 max-w-sm w-full mx-auto flex flex-col items-center text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 leading-tight">Welcome to ThreadCounty</h1>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          The world's most advanced AI-powered optical thread counting and textile analysis platform.
        </p>
      </div>

      <div className="w-full pt-4">
        <Button 
          type="button" 
          onClick={handleEnter}
          disabled={loading} 
          className="w-full h-14 rounded-xl bg-brand text-brand-foreground hover:bg-brand-dark hover:scale-[1.02] shadow-[0_0_20px_rgba(20,184,166,0.3)] font-semibold text-lg transition-all"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="size-5 border-2 border-brand-foreground/30 border-t-brand-foreground rounded-full animate-spin" />
              Initializing System...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Zap className="size-5" />
              Enter Application
            </span>
          )}
        </Button>
      </div>
      
      <p className="text-xs text-slate-500 max-w-xs mx-auto pt-6 border-t border-border/50">
        This is a guaranteed 1-click access portal that bypasses all email verification and manual login steps for hackathon demonstration purposes.
      </p>
    </div>
  );
}

