import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Upload as UploadIcon, FileText, Database, Activity, ArrowRight, ImageIcon, Bell, Clock } from "lucide-react";
import { AppLayout, PageHeader, StatCard } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { NotificationBell } from "@/components/NotificationBell";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ThreadCounty" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data } = useQuery({
    enabled: !!userId,
    queryKey: ["dashboard", userId],
    queryFn: async () => {
      const response = await fetchApi("/dashboard");
      return {
        uploads: { length: response.uploads_count },
        reports: response.recent_reports,
        profile: response.profile,
        subscription: response.subscription,
        notifications: response.notifications,
        totalBytes: response.total_bytes,
        activity: response.activity,
      };
    },
  });
  const name = data?.profile?.full_name ?? user?.email?.split("@")?.[0] ?? "there";
  const planLabel = data?.subscription?.plan ?? "free";
  const storageMb = data ? (data.totalBytes / 1024 / 1024).toFixed(1) : "0.0";

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Workspace"
        title={`Welcome, ${name}.`}
        description="Your textile analysis instrument. Upload a sample to begin."
        action={
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button asChild className="rounded-sm bg-foreground text-background hover:bg-foreground/90">
              <Link to="/upload"><UploadIcon className="mr-2 size-4" /> New analysis</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in-up animate-duration-500" style={{ animationDelay: "0ms" }}>
          <StatCard 
            label="Total uploads" 
            value={!data ? <Skeleton className="h-7 w-12" /> : <AnimatedNumber value={data.uploads.length} />} 
            icon={ImageIcon} 
          />
        </div>
        <div className="animate-fade-in-up animate-duration-500" style={{ animationDelay: "100ms" }}>
          <StatCard 
            label="Reports" 
            value={!data ? <Skeleton className="h-7 w-12" /> : <AnimatedNumber value={data.reports.length} />} 
            hint="Last 5 shown below" 
            icon={FileText} 
          />
        </div>
        <div className="animate-fade-in-up animate-duration-500" style={{ animationDelay: "200ms" }}>
          <StatCard 
            label="Storage used" 
            value={!data ? <Skeleton className="h-7 w-20" /> : <AnimatedNumber value={Number(storageMb)} suffix=" MB" decimals={1} />} 
            icon={Database} 
          />
        </div>
        <div className="animate-fade-in-up animate-duration-500" style={{ animationDelay: "300ms" }}>
          <StatCard 
            label="Current plan" 
            value={!data ? <Skeleton className="h-7 w-16" /> : <span className="uppercase font-mono text-base">{planLabel}</span>} 
            icon={Activity} 
          />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-md border border-border bg-card animate-fade-in-up animate-duration-600" style={{ animationDelay: "400ms" }}>
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">Recent reports</h2>
            <Link to="/history" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </header>
          {!data ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : (data?.reports ?? []).length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-border">
              {data!.reports.map((r, i) => (
                <li key={r.id} className="transition-all duration-300 hover:bg-accent/50">
                  <Link
                    to="/analysis/$id"
                    params={{ id: r.id }}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{r.fabric_type ?? "Untitled scan"}</div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-brand">
                        {r.confidence_score != null ? `${(Number(r.confidence_score) * 100).toFixed(1)}%` : "—"}
                      </span>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform duration-300 hover:translate-x-1" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="rounded-md border border-border bg-card p-5 animate-fade-in-up animate-duration-600" style={{ animationDelay: "500ms" }}>
          <h2 className="text-sm font-semibold">Quick actions</h2>
          <div className="mt-4 space-y-2">
            <QuickLink to="/upload" label="Upload fabric image" />
            <QuickLink to="/history" label="Browse archive" />
            <QuickLink to="/profile" label="Edit profile" />
            <QuickLink to="/pricing" label="Upgrade plan" />
          </div>
          <div className="mt-6 rounded-sm border border-border bg-surface p-4">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Account</div>
            <div className="mt-1 truncate text-sm font-medium">{user?.email}</div>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Member since</div>
            <div className="mt-1 text-sm">
              {data?.profile?.created_at ? new Date(data.profile.created_at).toLocaleDateString() : "—"}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-border bg-card p-5 animate-fade-in-up animate-duration-600" style={{ animationDelay: "600ms" }}>
          <header className="mb-4 flex items-center gap-2">
            <Clock className="size-4 text-brand" />
            <h2 className="text-sm font-semibold">Activity timeline</h2>
          </header>
          {!data ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (data.activity ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet. Upload a fabric image to get started.</p>
          ) : (
            <ol className="relative space-y-4 border-l border-border pl-4">
              {data.activity.map((item) => (
                <li key={`${item.type}-${item.id}`} className="relative">
                  <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-brand ring-4 ring-background" />
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {item.type === "report" ? "Report" : "Upload"} · {new Date(item.at).toLocaleString()}
                  </div>
                  {item.type === "report" && (
                    <Link to="/analysis/$id" params={{ id: item.id }} className="mt-1 inline-block text-xs text-brand hover:underline">
                      View report
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-md border border-border bg-card p-5 animate-fade-in-up animate-duration-600" style={{ animationDelay: "700ms" }}>
          <header className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-brand" />
              <h2 className="text-sm font-semibold">Notifications</h2>
            </div>
          </header>
          {!data ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (data.notifications ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">You're all caught up. New analysis alerts will appear here.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.notifications.map((n) => (
                <li key={n.id} className={`py-3 first:pt-0 ${n.read ? "opacity-60" : ""}`}>
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-sm border border-border bg-surface px-3 py-2.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand"
    >
      {label}
      <ArrowRight className="size-3.5" />
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="px-5 py-16 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full bg-surface-2">
        <ImageIcon className="size-5 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-semibold">No analyses yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">Upload your first fabric image to get started.</p>
      <Button asChild className="mt-5 rounded-sm bg-foreground text-background hover:bg-foreground/90">
        <Link to="/upload">Start an analysis</Link>
      </Button>
    </div>
  );
}

function AnimatedNumber({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === undefined || value === null || isNaN(value)) return;
    const start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 1000; // ms
    const steps = 30;
    const stepTime = duration / steps;
    const increment = (end - start) / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(end);
      } else {
        setDisplayValue(Number((start + increment * currentStep).toFixed(decimals)));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, decimals]);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
}
