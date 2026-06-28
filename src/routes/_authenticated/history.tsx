import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Trash2, Download, FileText } from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "Archive — ThreadCounty" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<{ reportId: string; storagePath?: string | null; uploadId?: string } | null>(null);

  const { data, isLoading } = useQuery({
    enabled: !!user,
    queryKey: ["history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reports")
        .select("*, upload:uploads(original_filename, file_size, storage_path)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const fabricTypes = Array.from(new Set((data ?? []).map((r) => r.fabric_type).filter(Boolean))) as string[];

  const filtered = (data ?? []).filter((r) => {
    const matchSearch = !search ||
      (r.fabric_type ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.upload?.original_filename ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || r.fabric_type === filter;
    return matchSearch && matchFilter;
  });

  async function del() {
    if (!deleteTarget) return;
    const { reportId, storagePath, uploadId } = deleteTarget;
    if (storagePath) await supabase.storage.from("fabric-images").remove([storagePath]);
    if (uploadId) await supabase.from("uploads").delete().eq("id", uploadId);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["history"] });
    setDeleteTarget(null);
  }

  function downloadCsv() {
    if (!filtered.length) return;
    const headers = ["id", "created_at", "fabric_type", "weave_pattern", "thread_density", "warp_count", "weft_count", "confidence", "filename"];
    const rows = filtered.map((r) => [
      r.id, r.created_at, r.fabric_type, r.weave_pattern, r.thread_density,
      r.warp_count, r.weft_count, r.confidence_score, r.upload?.original_filename,
    ].map((v) => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `threadcounty-archive-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Archive"
        title="Your analysis history"
        description="Search, filter, download or delete previous reports."
        action={
          <Button onClick={downloadCsv} variant="outline" className="rounded-sm" disabled={!filtered.length}>
            <Download className="mr-2 size-4" /> Export CSV
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by fabric type or filename…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-sm"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-56 rounded-sm">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All fabric types</SelectItem>
            {fabricTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="size-8 rounded-sm" />
              </div>
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="py-16 text-center">
            <FileText className="mx-auto size-6 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No reports match.</p>
            <Button asChild className="mt-4 rounded-sm bg-foreground text-background hover:bg-foreground/90">
              <Link to="/upload">Run a new analysis</Link>
            </Button>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface">
              <tr>
                <Th>Source</Th>
                <Th>Fabric</Th>
                <Th>Pattern</Th>
                <Th className="text-right">TPI</Th>
                <Th className="text-right">Confidence</Th>
                <Th>Date</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-accent/40">
                  <Td>
                    <Link to="/analysis/$id" params={{ id: r.id }} className="font-medium hover:text-brand truncate">
                      {r.upload?.original_filename ?? "—"}
                    </Link>
                  </Td>
                  <Td>{r.fabric_type ?? "—"}</Td>
                  <Td className="text-muted-foreground">{r.weave_pattern ?? "—"}</Td>
                  <Td className="text-right font-mono">{r.thread_density ?? "—"}</Td>
                  <Td className="text-right font-mono text-brand">
                    {r.confidence_score != null ? `${(Number(r.confidence_score) * 100).toFixed(1)}%` : "—"}
                  </Td>
                  <Td className="text-muted-foreground font-mono text-xs">
                    {new Date(r.created_at).toLocaleDateString()}
                  </Td>
                  <Td className="text-right">
                    <button
                      onClick={() => setDeleteTarget({ reportId: r.id, storagePath: r.upload?.storage_path, uploadId: r.upload_id })}
                      className="grid size-8 place-items-center rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the report and its fabric image. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={del}
              className="rounded-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground ${className ?? ""}`}>{children}</th>;
}
function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>;
}
