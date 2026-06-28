import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Shield, Users, ImageIcon, Mail, Trash2, ShieldAlert,
  Database, Activity, ArrowRight, UserCheck, ShieldOff,
  Sparkles, CheckCircle, Clock
} from "lucide-react";
import { AppLayout, PageHeader, StatCard } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — ThreadCounty" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Check if admin
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

  // Fetch Admin Data
  const { data: adminData, isLoading } = useQuery({
    enabled: !!isAdmin,
    queryKey: ["admin_dashboard_data"],
    queryFn: async () => {
      const [usersRes, rolesRes, subsRes, uploadsRes, reportsRes, contactsRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("user_roles").select("*"),
        supabase.from("subscriptions").select("*"),
        supabase.from("uploads").select("*"),
        supabase.from("reports").select("*"),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
      ]);

      const users = usersRes.data ?? [];
      const roles = rolesRes.data ?? [];
      const subs = subsRes.data ?? [];
      const uploads = uploadsRes.data ?? [];
      const reports = reportsRes.data ?? [];
      const contacts = contactsRes.data ?? [];

      // Combine user profiles with roles and subscriptions
      const fullUsers = users.map((u) => {
        const uRole = roles.find((r) => r.user_id === u.id)?.role ?? "user";
        const uSub = subs.find((s) => s.user_id === u.id) ?? { plan: "free", status: "active" };
        return {
          ...u,
          role: uRole,
          plan: uSub.plan,
          subStatus: uSub.status,
        };
      });

      // Combine reports with original filename
      const fullReports = reports.map((r) => {
        const up = uploads.find((u) => u.id === r.upload_id);
        const owner = users.find((u) => u.id === r.user_id);
        return {
          ...r,
          original_filename: up?.original_filename ?? "Deleted fabric",
          storage_path: up?.storage_path ?? null,
          owner_email: owner?.email ?? "Unknown user",
          owner_name: owner?.full_name ?? "—",
        };
      });

      return {
        users: fullUsers,
        uploads,
        reports: fullReports,
        contacts,
      };
    },
  });

  // Toggle developer admin role for testing ease
  async function toggleDevAdmin() {
    if (!user) return;
    const currentIsAdmin = isAdmin;
    if (currentIsAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", user.id).eq("role", "admin");
      if (error) { toast.error(error.message); return; }
      setIsAdmin(false);
      toast.success("Dev Mode: Revoked admin role.");
      navigate({ to: "/dashboard" });
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: user.id, role: "admin" });
      if (error) { toast.error(error.message); return; }
      setIsAdmin(true);
      toast.success("Dev Mode: Granted admin role!");
      qc.invalidateQueries({ queryKey: ["admin_dashboard_data"] });
    }
  }

  // Manage Roles
  async function changeUserRole(userId: string, newRole: "user" | "admin") {
    if (userId === user?.id) {
      toast.warning("Cannot demote yourself from admin interface.");
      return;
    }
    // Delete existing roles and insert new one
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    if (error) {
      toast.error("Failed to change role: " + error.message);
    } else {
      toast.success("User role updated successfully");
      qc.invalidateQueries({ queryKey: ["admin_dashboard_data"] });
    }
  }

  // Manage Subscription Plans
  async function changeUserPlan(userId: string, newPlan: "free" | "student" | "professional" | "enterprise") {
    const { error } = await supabase
      .from("subscriptions")
      .upsert({ user_id: userId, plan: newPlan, status: "active" }, { onConflict: "user_id" });

    if (error) {
      toast.error("Failed to update plan: " + error.message);
    } else {
      toast.success("User subscription plan updated");
      qc.invalidateQueries({ queryKey: ["admin_dashboard_data"] });
    }
  }

  async function deleteUserAccount(userId: string) {
    if (userId === user?.id) {
      toast.warning("Cannot delete your own account from admin panel.");
      return;
    }
    if (!confirm("Permanently delete this user and all their data?")) return;
    const { error } = await supabase.rpc("admin_delete_user", { target_user_id: userId });
    if (error) {
      toast.error("Failed to delete user: " + error.message);
    } else {
      toast.success("User deleted");
      qc.invalidateQueries({ queryKey: ["admin_dashboard_data"] });
    }
  }

  // Delete User Report
  async function deleteReport(reportId: string, uploadId: string, storagePath?: string | null) {
    if (!confirm("Permanently delete this report and fabric image? This cannot be undone.")) return;
    if (storagePath) {
      await supabase.storage.from("fabric-images").remove([storagePath]);
    }
    await supabase.from("uploads").delete().eq("id", uploadId);
    toast.success("Report and image deleted");
    qc.invalidateQueries({ queryKey: ["admin_dashboard_data"] });
  }

  // Delete Contact Message
  async function deleteContact(contactId: string) {
    if (!confirm("Delete this contact message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", contactId);
    if (error) {
      toast.error("Could not delete message");
    } else {
      toast.success("Message deleted");
      qc.invalidateQueries({ queryKey: ["admin_dashboard_data"] });
    }
  }

  if (isAdmin === false) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-md bg-card">
          <ShieldAlert className="size-16 text-muted-foreground animate-pulse mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Only administrators are authorized to view this page. If you are testing this application, you can toggle Admin Role using the developer bypass below.
          </p>
          <Button onClick={toggleDevAdmin} className="mt-6 rounded-sm bg-brand text-brand-foreground hover:bg-brand/90">
            Developer Mode: Become Admin
          </Button>
        </div>
      </AppLayout>
    );
  }

  if (isLoading || isAdmin === null) {
    return (
      <AppLayout>
        <div className="py-20 text-center text-muted-foreground">Loading Admin Instrument Panel…</div>
      </AppLayout>
    );
  }

  const { users = [], uploads = [], reports = [], contacts = [] } = adminData || {};

  // Analytics Helpers
  const totalStorageBytes = uploads.reduce((acc, curr) => acc + Number(curr.file_size || 0), 0);
  const totalStorageMb = (totalStorageBytes / 1024 / 1024).toFixed(2);

  // Subscriptions distribution chart data
  const subData = [
    { name: "Free", value: users.filter((u) => u.plan === "free").length },
    { name: "Student", value: users.filter((u) => u.plan === "student").length },
    { name: "Professional", value: users.filter((u) => u.plan === "professional").length },
    { name: "Enterprise", value: users.filter((u) => u.plan === "enterprise").length },
  ].filter((d) => d.value > 0);

  const COLORS = ["#7B8C80", "#C8B195", "#556259", "#A68A78"];

  // Fabric analysis type distribution
  const fabricDataMap = reports.reduce((acc: Record<string, number>, curr) => {
    const t = curr.fabric_type || "Unknown Type";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const fabricChartData = Object.entries(fabricDataMap).map(([name, count]) => ({
    name,
    count,
  }));

  // Registration over time data
  const regDatesMap = users.reduce((acc: Record<string, number>, curr) => {
    const date = new Date(curr.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const regChartData = Object.entries(regDatesMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <AppLayout>
      <PageHeader
        eyebrow="Admin Panel"
        title="Instrument Command Center"
        description="Monitor user directories, upload logs, contact responses, and analytical trends."
        action={
          <Button onClick={toggleDevAdmin} variant="outline" className="rounded-sm border-dashed">
            Dev: Resign Admin
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Mill Users" value={users.length} icon={Users} />
        <StatCard label="Analytic Scans" value={reports.length} icon={Activity} />
        <StatCard label="Images Uploaded" value={uploads.length} icon={ImageIcon} />
        <StatCard label="Storage Utilization" value={`${totalStorageMb} MB`} icon={Database} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-surface rounded-sm p-1 border border-border">
          <TabsTrigger value="overview" className="rounded-sm text-xs py-1.5 uppercase font-semibold font-mono tracking-wider">Overview</TabsTrigger>
          <TabsTrigger value="users" className="rounded-sm text-xs py-1.5 uppercase font-semibold font-mono tracking-wider">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="uploads" className="rounded-sm text-xs py-1.5 uppercase font-semibold font-mono tracking-wider">Fabric Scans ({reports.length})</TabsTrigger>
          <TabsTrigger value="contacts" className="rounded-sm text-xs py-1.5 uppercase font-semibold font-mono tracking-wider">Inquiries ({contacts.length})</TabsTrigger>
        </TabsList>

        {/* OVERVIEW ANALYTICS */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Registrations Chart */}
            <div className="rounded-md border border-border bg-card p-5">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Registration Growth</h3>
              <div className="h-64">
                {regChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={regChartData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ background: "rgba(30, 30, 30, 0.8)", border: "1px solid #333", fontSize: 11 }} />
                      <Line type="monotone" dataKey="count" name="New Users" stroke="#C8B195" strokeWidth={2} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Subscriptions Distribution */}
            <div className="rounded-md border border-border bg-card p-5">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Subscriptions Allocation</h3>
              <div className="h-64 flex items-center">
                {subData.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No data available</div>
                ) : (
                  <>
                    <div className="w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={subData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {subData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: "rgba(30, 30, 30, 0.8)", border: "1px solid #333", fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 space-y-2">
                      {subData.map((d, index) => (
                        <div key={d.name} className="flex items-center gap-2 text-xs">
                          <span className="size-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="font-mono uppercase font-semibold text-foreground/80">{d.name}</span>
                          <span className="text-muted-foreground">({d.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Fabric Type Stats */}
          <div className="rounded-md border border-border bg-card p-5">
            <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Fabric Type Distribution</h3>
            <div className="h-72">
              {fabricChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">No scanned data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fabricChartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ background: "rgba(30, 30, 30, 0.8)", border: "1px solid #333", fontSize: 11 }} />
                    <Bar dataKey="count" name="Analyses Run" fill="#7B8C80" radius={[2, 2, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </TabsContent>

        {/* USER DIRECTORY */}
        <TabsContent value="users">
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-surface">
                <TableRow>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">User</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Company / Title</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Registered</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">System Role</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Subscription</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No users registered.</TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} className="hover:bg-accent/40">
                      <TableCell className="font-medium">
                        <div>
                          <div className="text-sm font-semibold">{u.full_name || "—"}</div>
                          <div className="text-xs text-muted-foreground font-mono">{u.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{u.company || "—"}</div>
                        <div className="text-xs text-muted-foreground">{u.job_title || "—"}</div>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.role}
                          onValueChange={(val: "user" | "admin") => changeUserRole(u.id, val)}
                        >
                          <SelectTrigger className="w-28 h-8 text-xs font-semibold uppercase tracking-wider rounded-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">USER</SelectItem>
                            <SelectItem value="admin">ADMIN</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={u.plan}
                          onValueChange={(val: "free" | "student" | "professional" | "enterprise") => changeUserPlan(u.id, val)}
                        >
                          <SelectTrigger className="w-36 h-8 text-xs font-semibold uppercase tracking-wider rounded-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">FREE PLAN</SelectItem>
                            <SelectItem value="student">STUDENT PLAN</SelectItem>
                            <SelectItem value="professional">PROFESSIONAL</SelectItem>
                            <SelectItem value="enterprise">ENTERPRISE</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {u.id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteUserAccount(u.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* SCANS & UPLOADS */}
        <TabsContent value="uploads">
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-surface">
                <TableRow>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Owner</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Original File</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Fabric Details</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Calculations</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No textile reports run.</TableCell>
                  </TableRow>
                ) : (
                  reports.map((r) => (
                    <TableRow key={r.id} className="hover:bg-accent/40">
                      <TableCell>
                        <div>
                          <div className="text-sm font-semibold">{r.owner_name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{r.owner_email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-xs font-mono text-muted-foreground">
                        {r.original_filename}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-semibold">{r.fabric_type || "—"}</div>
                        <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{r.weave_pattern || "—"}</div>
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        <div>Density: <span className="font-semibold text-brand">{r.thread_density ?? "—"} TPI</span></div>
                        <div>Warp/Weft: {r.warp_count ?? "—"} / {r.weft_count ?? "—"}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild size="sm" variant="ghost" className="h-8 rounded-sm">
                            <Link to="/analysis/$id" params={{ id: r.id }} className="text-xs font-medium">View</Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteReport(r.id, r.upload_id, r.storage_path)}
                            className="h-8 rounded-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* INQUIRIES & CONTACT MESSAGES */}
        <TabsContent value="contacts">
          <div className="rounded-md border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader className="bg-surface">
                <TableRow>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Inquirer</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Subject</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Message</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider">Date Submitted</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase font-bold tracking-wider text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No inquiries submitted.</TableCell>
                  </TableRow>
                ) : (
                  contacts.map((c) => (
                    <TableRow key={c.id} className="hover:bg-accent/40">
                      <TableCell>
                        <div className="text-sm font-semibold">{c.name}</div>
                        <a href={`mailto:${c.email}`} className="text-xs text-brand font-mono hover:underline">{c.email}</a>
                      </TableCell>
                      <TableCell className="font-medium text-xs max-w-[150px] truncate">
                        {c.subject || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[300px] whitespace-pre-wrap leading-relaxed py-3">
                        {c.message}
                      </TableCell>
                      <TableCell className="text-xs font-mono">
                        {new Date(c.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteContact(c.id)}
                          className="h-8 rounded-sm text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
