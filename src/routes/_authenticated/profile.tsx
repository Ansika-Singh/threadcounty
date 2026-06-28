import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, UploadIcon, Trash2 } from "lucide-react";
import { AppLayout, PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — ThreadCounty" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const { data: profile } = useQuery({
    enabled: !!user,
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? "");
    setCompany(profile.company ?? "");
    setJobTitle(profile.job_title ?? "");
    setBio(profile.bio ?? "");
    if (profile.avatar_url) {
      if (profile.avatar_url.startsWith("http")) {
        setAvatarUrl(profile.avatar_url);
      } else {
        supabase.storage.from("avatars").createSignedUrl(profile.avatar_url, 3600).then(({ data }) => {
          setAvatarUrl(data?.signedUrl ?? null);
        });
      }
    }
  }, [profile]);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: fullName, company, job_title: jobTitle, bio,
    }).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  async function changePassword() {
    if (pw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setPwSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password changed");
    setPw("");
  }

  async function uploadAvatar(file: File) {
    if (!user) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    setUploadingAvatar(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { setUploadingAvatar(false); toast.error("Upload failed"); return; }
    await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
    setAvatarUrl(data?.signedUrl ?? null);
    setUploadingAvatar(false);
    toast.success("Avatar updated");
  }

  async function deleteAccount() {
    if (!confirm("Permanently delete your account and all data? This cannot be undone.")) return;
    if (!confirm("Are you absolutely sure?")) return;
    const { error } = await supabase.rpc("delete_user_self");
    await supabase.auth.signOut();
    if (error) {
      toast.message("Signed out. Contact support if full deletion did not complete.");
    } else {
      toast.success("Account deleted");
    }
    navigate({ to: "/" });
  }

  const { data: activity } = useQuery({
    enabled: !!user,
    queryKey: ["profile-activity", user?.id],
    queryFn: async () => {
      const [reports, uploads] = await Promise.all([
        supabase.from("reports").select("id, fabric_type, created_at").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("uploads").select("id, original_filename, created_at").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(10),
      ]);
      return [
        ...(reports.data ?? []).map((r) => ({ type: "report" as const, label: r.fabric_type ?? "Analysis", at: r.created_at, id: r.id })),
        ...(uploads.data ?? []).map((u) => ({ type: "upload" as const, label: u.original_filename, at: u.created_at, id: u.id })),
      ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 12);
    },
  });

  const initials = (fullName || user?.email || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <AppLayout>
      <PageHeader eyebrow="Account" title="Profile settings" description="Manage your personal information, password and account." />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <aside className="space-y-6">
          <div className="rounded-md border border-border bg-card p-6 text-center">
            <Avatar className="mx-auto size-24">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar" />}
              <AvatarFallback className="bg-brand/20 text-brand">{initials}</AvatarFallback>
            </Avatar>
            <h3 className="mt-4 text-base font-semibold">{fullName || "Untitled"}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <label className="mt-4 inline-block">
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }}
                disabled={uploadingAvatar}
              />
              <span className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent">
                {uploadingAvatar ? <Loader2 className="size-3.5 animate-spin" /> : <UploadIcon className="size-3.5" />}
                Change photo
              </span>
            </label>
          </div>

          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-5">
            <h3 className="text-sm font-semibold text-destructive">Danger zone</h3>
            <p className="mt-1 text-xs text-muted-foreground">Permanently delete your account and all uploaded data.</p>
            <Button variant="destructive" size="sm" onClick={deleteAccount} className="mt-3 rounded-sm">
              <Trash2 className="mr-2 size-3.5" /> Delete account
            </Button>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-md border border-border bg-card p-6">
            <h2 className="text-sm font-semibold">Personal information</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fn">Full name</Label>
                <Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="em">Email</Label>
                <Input id="em" value={user?.email ?? ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="co">Company</Label>
                <Input id="co" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jt">Job title</Label>
                <Input id="jt" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="bi">Bio</Label>
                <Textarea id="bi" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
            </div>
            <Button onClick={save} disabled={saving} className="mt-5 rounded-sm bg-foreground text-background hover:bg-foreground/90">
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </section>

          <section className="rounded-md border border-border bg-card p-6">
            <h2 className="text-sm font-semibold">Change password</h2>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="np">New password</Label>
                <Input id="np" type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Min 8 characters" />
              </div>
              <Button onClick={changePassword} disabled={pwSaving || !pw} className="rounded-sm bg-foreground text-background hover:bg-foreground/90">
                {pwSaving ? "Updating…" : "Update password"}
              </Button>
            </div>
          </section>

          <section className="rounded-md border border-border bg-card p-6">
            <h2 className="text-sm font-semibold">Recent activity</h2>
            {!activity || activity.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {activity.map((item) => (
                  <li key={`${item.type}-${item.id}`} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <span className="font-medium">{item.label}</span>
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{item.type}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">{new Date(item.at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
