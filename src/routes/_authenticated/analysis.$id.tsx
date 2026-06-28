import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Share2, Trash2, Edit3, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/analysis/$id")({
  head: () => ({ meta: [{ title: "Analysis report — ThreadCounty" }] }),
  component: AnalysisPage,
});

function AnalysisPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [density, setDensity] = useState("");
  const [warp, setWarp] = useState("");
  const [weft, setWeft] = useState("");
  const [fabricType, setFabricType] = useState("");
  const [weavePattern, setWeavePattern] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: async () => {
      const { data: report, error } = await supabase
        .from("reports")
        .select("*, upload:uploads(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return report;
    },
  });

  // Populate edit fields
  useEffect(() => {
    if (!data) return;
    setDensity(data.thread_density?.toString() ?? "");
    setWarp(data.warp_count?.toString() ?? "");
    setWeft(data.weft_count?.toString() ?? "");
    setFabricType(data.fabric_type ?? "");
    setWeavePattern(data.weave_pattern ?? "");
    setSuggestions(data.ai_suggestions ?? "");
    setNotes(data.notes ?? "");
  }, [data]);

  // Load image
  useEffect(() => {
    if (!data?.upload?.storage_path) return;
    supabase.storage
      .from("fabric-images")
      .createSignedUrl(data.upload.storage_path, 3600)
      .then(({ data: d }) => setImageUrl(d?.signedUrl ?? null));
  }, [data]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="rounded-md border border-border overflow-hidden">
          <Skeleton className="h-12 w-full" />
          <div className="grid lg:grid-cols-[1.5fr_1fr]">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-8 space-y-4">
              <Skeleton className="h-12 w-24" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  if (!data) {
    return (
      <AppLayout>
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Report not found.</p>
          <Button asChild className="mt-4"><Link to="/history">Back to archive</Link></Button>
        </div>
      </AppLayout>
    );
  }

  // Save edits
  async function saveEdits(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("reports")
      .update({
        thread_density: density ? Number(density) : null,
        warp_count: warp ? Number(warp) : null,
        weft_count: weft ? Number(weft) : null,
        fabric_type: fabricType || null,
        weave_pattern: weavePattern || null,
        ai_suggestions: suggestions || null,
        notes: notes || null,
      })
      .eq("id", id);
      
    setSaving(false);
    if (error) {
      toast.error("Could not save changes: " + error.message);
    } else {
      toast.success("Report updated successfully");
      setIsEditing(false);
      qc.invalidateQueries({ queryKey: ["report", id] });
      qc.invalidateQueries({ queryKey: ["history"] });
    }
  }

  // Print or Download PDF Report
  function downloadReport() {
    window.print();
  }

  async function shareReport() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Report URL copied to clipboard");
    } catch {
      toast.error("Could not copy URL");
    }
  }

  async function deleteReport() {
    if (data!.upload?.storage_path) {
      await supabase.storage.from("fabric-images").remove([data!.upload.storage_path]);
    }
    await supabase.from("uploads").delete().eq("id", data!.upload_id);
    toast.success("Report deleted");
    navigate({ to: "/history" });
  }

  const confidence = data.confidence_score != null ? Number(data.confidence_score) : 0;

  return (
    <AppLayout>
      {/* Styles for print output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          #print-area aside, #print-area div {
            border-color: #ccc !important;
            color: black !important;
            background: transparent !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="mb-6 flex items-center justify-between no-print">
        <Link to="/history" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to archive
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="rounded-sm">
            {isEditing ? <><X className="mr-2 size-3.5" /> Cancel</> : <><Edit3 className="mr-2 size-3.5" /> Edit</>}
          </Button>
          <Button variant="outline" size="sm" onClick={shareReport} className="rounded-sm">
            <Share2 className="mr-2 size-3.5" /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)} className="rounded-sm text-destructive hover:text-destructive border-destructive/20 hover:border-destructive/40">
            <Trash2 className="mr-2 size-3.5" /> Delete
          </Button>
          <Button size="sm" onClick={downloadReport} className="rounded-sm bg-foreground text-background hover:bg-foreground/90">
            <Download className="mr-2 size-3.5" /> PDF / Print Report
          </Button>
        </div>
      </div>

      {isEditing ? (
        /* Edit Mode Form */
        <form onSubmit={saveEdits} className="rounded-md border border-border bg-card p-6 space-y-4 max-w-2xl animate-in fade-in duration-200">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Edit3 className="size-4 text-brand" /> Modify Analysis Metrics
          </h2>
          <p className="text-xs text-muted-foreground">
            Correct automated measurements to record laboratory-grade physical fabric parameters.
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ed-density">Thread Density (TPI)</Label>
              <Input id="ed-density" type="number" step="any" value={density} onChange={(e) => setDensity(e.target.value)} required className="h-9 rounded-sm border-border text-xs" />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="ed-type">Fabric Classification</Label>
              <Input id="ed-type" value={fabricType} onChange={(e) => setFabricType(e.target.value)} required className="h-9 rounded-sm border-border text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ed-warp">Warp Count (/cm)</Label>
              <Input id="ed-warp" type="number" value={warp} onChange={(e) => setWarp(e.target.value)} required className="h-9 rounded-sm border-border text-xs" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ed-weft">Weft Count (/cm)</Label>
              <Input id="ed-weft" type="number" value={weft} onChange={(e) => setWeft(e.target.value)} required className="h-9 rounded-sm border-border text-xs" />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ed-pattern">Weave Pattern</Label>
              <Input id="ed-pattern" value={weavePattern} onChange={(e) => setWeavePattern(e.target.value)} required className="h-9 rounded-sm border-border text-xs" />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ed-sugg">AI Suggestions / Comments</Label>
              <Textarea id="ed-sugg" rows={3} value={suggestions} onChange={(e) => setSuggestions(e.target.value)} className="rounded-sm border-border text-xs" />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="ed-notes">Label &amp; Metadata Notes</Label>
              <Textarea id="ed-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-sm border-border text-xs font-mono" />
            </div>
          </div>

          <div className="flex gap-2 pt-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)} className="rounded-sm">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving} className="rounded-sm bg-foreground text-background hover:bg-foreground/90">
              {saving ? "Saving changes..." : "Save parameters"}
            </Button>
          </div>
        </form>
      ) : (
        /* View Mode Report Card */
        <div id="print-area" className="rounded-md border border-border bg-foreground text-background overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-3 bg-neutral-900">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-widest text-background/50">
                SCAN_ID · {data.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="rounded-sm bg-brand/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-brand">
                {data.status}
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-background/50">
              {new Date(data.created_at).toLocaleString()}
            </span>
          </div>

          <div className="grid lg:grid-cols-[1.5fr_1fr]">
            <div className="p-6 lg:p-10 bg-neutral-950">
              {imageUrl ? (
                <img src={imageUrl} alt="Analyzed fabric" className="w-full rounded-sm border border-white/10 object-cover aspect-[4/3]" />
              ) : (
                <div className="aspect-[4/3] w-full rounded-sm border border-white/10 weave-pattern" />
              )}
              <div className="mt-4 flex justify-between font-mono text-[10px] uppercase tracking-widest text-background/40">
                <span>{data.upload?.original_filename}</span>
                <span>{data.upload?.file_size ? (Number(data.upload.file_size) / 1024).toFixed(1) + " KB" : ""}</span>
              </div>
            </div>

            <aside className="border-l border-white/10 p-6 lg:p-8 space-y-6 bg-neutral-900">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-background/40">Thread density</div>
                <div className="mt-1 font-mono text-4xl tracking-tight">
                  {data.thread_density ?? "—"} <span className="text-xs text-background/40">TPI</span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden bg-white/10">
                  <div className="h-full bg-brand" style={{ width: `${confidence * 100}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Mini label="Warp" value={`${data.warp_count ?? "—"} /cm`} />
                <Mini label="Weft" value={`${data.weft_count ?? "—"} /cm`} />
              </div>
              <Mini label="Fabric type" value={data.fabric_type ?? "—"} />
              <Mini label="Weave pattern" value={data.weave_pattern ?? "—"} />
              <Mini label="Confidence" value={`${(confidence * 100).toFixed(2)}%`} accent />
            </aside>
          </div>

          {/* AI Suggestions */}
          <div className="border-t border-white/10 px-6 py-6 lg:px-10 bg-neutral-950">
            <div className="font-mono text-[10px] uppercase tracking-widest text-background/40">AI Insights &amp; Suggestions</div>
            <div className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-background/80">
              {data.ai_suggestions || "No additional insights."}
            </div>
          </div>

          {/* Label Scan Notes */}
          {data.notes && (
            <div className="border-t border-white/10 px-6 py-6 lg:px-10 bg-neutral-900">
              <div className="font-mono text-[10px] uppercase tracking-widest text-background/40">Label Specification Notes</div>
              <div className="mt-3 whitespace-pre-wrap text-xs font-mono leading-relaxed text-background/60">
                {data.notes}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this report?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the analysis report and its source fabric image. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteReport}
              className="rounded-sm bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-sm border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-background/40">{label}</div>
      <div className={`mt-0.5 text-sm font-medium ${accent ? "text-brand" : "text-background"}`}>{value}</div>
    </div>
  );
}
