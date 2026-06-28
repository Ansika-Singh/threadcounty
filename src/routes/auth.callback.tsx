import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Authenticating — ThreadCounty" }] }),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase client automatically processes the code/token in the URL.
    // We check the session to trigger the dashboard redirect.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        toast.success("Signed in successfully.");
        navigate({ to: "/dashboard" });
      } else {
        // Wait briefly for client token exchange to complete if not instant
        const t = setTimeout(() => {
          supabase.auth.getSession().then(({ data: d }) => {
            if (d.session) {
              toast.success("Signed in successfully.");
              navigate({ to: "/dashboard" });
            } else {
              toast.error("Authentication session exchange failed. Please sign in again.");
              navigate({ to: "/auth", search: { mode: "login" } });
            }
          });
        }, 1500);
        return () => clearTimeout(t);
      }
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="size-8 animate-spin text-brand" />
        <h1 className="text-base font-semibold text-foreground">Completing authentication...</h1>
        <p className="text-xs text-muted-foreground">Exchanging secure authorization tokens, please wait.</p>
      </div>
    </div>
  );
}
