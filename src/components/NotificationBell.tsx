import { Bell, Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function NotificationBell() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    enabled: !!user,
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["notifications", user.id] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, qc]);

  const unread = notifications.filter((n) => !n.read).length;

  async function markRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["notifications", user?.id] });
  }

  async function markAllRead() {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    qc.invalidateQueries({ queryKey: ["notifications", user.id] });
  }

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-brand text-[9px] font-bold text-brand-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <button type="button" onClick={markAllRead} className="text-xs text-brand hover:underline">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`border-b border-border px-4 py-3 last:border-0 ${n.read ? "opacity-70" : "bg-brand/5"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!n.read && (
                    <button type="button" onClick={() => markRead(n.id)} aria-label="Mark as read">
                      <Check className="size-3.5 text-brand" />
                    </button>
                  )}
                </div>
                {n.link && (
                  <button
                    type="button"
                    onClick={() => {
                      markRead(n.id);
                      setOpen(false);
                      if (n.link?.startsWith("/analysis/")) {
                        navigate({ to: "/analysis/$id", params: { id: n.link.split("/").pop()! } });
                      } else {
                        navigate({ to: "/dashboard" });
                      }
                    }}
                    className="mt-2 inline-block text-xs font-semibold text-brand hover:underline"
                  >
                    View report →
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
