import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { LayoutDashboard, Upload, History, User, LogOut, Scan, Shield, BarChart3 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AIChatbot } from "@/components/AIChatbot";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { toast } from "sonner";

export function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(!!data);
      });
  }, [user]);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.navigate({ to: "/auth", search: { mode: "login" } });
  }

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/upload", label: "New Analysis", icon: Upload },
    { to: "/compare", label: "Compare", icon: BarChart3 },
    { to: "/history", label: "Archive", icon: History },
    { to: "/profile", label: "Profile", icon: User },
    ...(isAdmin ? [{ to: "/admin", label: "Admin Panel", icon: Shield }] : []),
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-sidebar md:flex md:flex-col">
        <div className="flex h-14 items-center border-b border-border px-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((n) => {
            const active = pathname === n.to || pathname.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="hidden h-14 items-center justify-end gap-2 border-b border-border bg-background/80 px-6 backdrop-blur-md md:flex">
          <NotificationBell />
          <ThemeToggle className="size-8" />
        </header>
        <header className="flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md md:hidden">
          <Logo />
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle className="size-8" />
            <Button size="sm" onClick={signOut} variant="ghost">
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <div className="flex md:hidden border-b border-border overflow-x-auto bg-surface">
          {navItems.map((n) => {
            const active = pathname === n.to || pathname.startsWith(n.to + "/");
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`shrink-0 px-4 py-3 text-xs font-medium uppercase tracking-wider ${
                  active ? "text-foreground border-b-2 border-brand" : "text-muted-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </div>
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
        </main>
      </div>

      {/* Floating Textile AI Chatbot */}
      <AIChatbot />
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <div className="tag mb-3">{eyebrow}</div>}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon }: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: typeof Scan;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <div className="mt-3 text-2xl font-semibold text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
