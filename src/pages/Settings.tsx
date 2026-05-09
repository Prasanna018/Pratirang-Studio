import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Building2, 
  UserPlus, 
  Shield, 
  Trash2, 
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  XCircle,
  Mail,
  MoreVertical
} from "lucide-react";
import useSWR, { mutate } from "swr";
import { fetcher, apiRequest } from "@/lib/api";
import { User, Studio } from "@/types";
import { toast } from "sonner";
import { Shimmer } from "@/components/common/Skeleton";

export default function Settings() {
  const { user, refreshUser } = useApp();
  const isAdmin = user?.role === "admin";
  const { data: studio, isLoading: studioLoading } = useSWR<Studio>(isAdmin ? "/studio/me" : null, fetcher);
  const { data: members = [], isLoading: membersLoading } = useSWR<User[]>(isAdmin ? "/studio/members" : null, fetcher);

  const [studioName, setStudioName] = useState("");
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaff, setNewStaff] = useState({ email: "", password: "", role: "staff" as const });

  const handleUpdateStudio = async () => {
    try {
      await apiRequest("/studio/settings", "PUT", { name: studioName || studio?.name });
      toast.success("Studio settings updated");
      await refreshUser(); // Update global user/studio state
      mutate("/studio/me");
    } catch {
      toast.error("Failed to update studio");
    }
  };

  const handleToggleStatus = async (memberId: string, currentStatus: boolean) => {
    try {
      await apiRequest(`/studio/members/${memberId}`, "PATCH", { is_active: !currentStatus });
      toast.success("Member status updated");
      mutate("/studio/members");
    } catch (err: any) {
      toast.error(err.message || "Failed to update member");
    }
  };

  const handleAddStaff = async () => {
    try {
      await apiRequest("/studio/members", "POST", newStaff);
      toast.success("Staff member added");
      setShowAddStaff(false);
      setNewStaff({ email: "", password: "", role: "staff" });
      mutate("/studio/members");
    } catch (err: any) {
      toast.error(err.message || "Failed to add staff");
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Shield className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-display">Staff Access</h2>
        <p className="text-muted-foreground max-w-sm mt-2">
          Your account is registered to your studio. Only administrators can manage team members and studio branding.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      {/* Profile hero card */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
      >
        {/* Background gradient bar */}
        <div className="h-24 w-full" style={{ background: "linear-gradient(135deg, #1e0a3c, #3b1069, #7c3aed 80%)" }} />
        <div className="px-8 pb-8">
          {/* Avatar overlapping banner */}
          <div className="-mt-10 mb-4 flex items-end gap-5">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-card font-display text-3xl font-bold text-white shadow-elevated"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 8px 24px rgba(124,58,237,0.5)" }}
            >
              {user?.username?.slice(0, 1).toUpperCase()}
            </div>
            <div className="pb-1">
              <h2 className="font-display text-2xl text-foreground">{user?.username}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ background: "hsl(var(--primary)/0.12)", color: "hsl(var(--primary))" }}
                >
                  {user?.role || "staff"}
                </span>
                <span className="text-xs text-muted-foreground">{user?.studio_name || "Pratirang Studio"}</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface-2/50 px-4 py-3 text-xs text-muted-foreground">
            Studio ID: <span className="font-mono text-foreground">{user?.studio_id || "—"}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Branding */}
        <div className="md:col-span-1 space-y-5">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <div className="mb-5 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "hsl(var(--primary)/0.1)" }}>
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-display text-lg text-foreground">Branding</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Studio Name</label>
                <input
                  type="text"
                  defaultValue={studio?.name}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-surface-2 px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  placeholder="Enter studio name"
                />
              </div>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUpdateStudio}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-glow transition"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
              >
                <Save className="h-4 w-4" /> Save Changes
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Team */}
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "hsl(var(--info)/0.1)" }}>
                  <Users className="h-4 w-4 text-info" />
                </div>
                <h2 className="font-display text-lg text-foreground">Team</h2>
              </div>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAddStaff(true)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white shadow-glow transition"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
              >
                <UserPlus className="h-3.5 w-3.5" /> Add Staff
              </motion.button>
            </div>

            <div className="divide-y divide-border">
              {membersLoading
                ? [0, 1, 2].map((i) => <Shimmer key={i} className="my-2 h-16 w-full rounded-2xl" />)
                : members.map((m) => (
                    <div key={m._id} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl font-display font-bold text-white shadow-md"
                          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                        >
                          {m.username.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            {m.username}
                            {m.role === "admin" && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                                style={{ background: "hsl(var(--primary)/0.12)", color: "hsl(var(--primary))" }}>
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" /> {m.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                          style={m.is_active
                            ? { background: "hsl(var(--success)/0.1)", color: "hsl(var(--success))" }
                            : { background: "hsl(var(--destructive)/0.1)", color: "hsl(var(--destructive))" }}
                        >
                          {m.is_active ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {m.is_active ? "Active" : "Inactive"}
                        </span>
                        {m._id !== user?._id && (
                          <button
                            onClick={() => handleToggleStatus(m._id, m.is_active)}
                            className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                              m.is_active ? "text-destructive hover:bg-destructive/10" : "text-success hover:bg-success/10"
                            }`}
                          >
                            {m.is_active ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddStaff(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-elevated"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-foreground">Add Team Member</h2>
                  <p className="text-xs text-muted-foreground">They'll set their password on first login.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email Address</label>
                  <input type="email" value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="staff@studio.com"
                    className="h-11 w-full rounded-xl border border-border bg-surface-2 px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Initial Password</label>
                  <input type="password" value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="h-11 w-full rounded-xl border border-border bg-surface-2 px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Role</label>
                  <select value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                    className="h-11 w-full rounded-xl border border-border bg-surface-2 px-4 text-sm text-foreground outline-none transition focus:border-primary"
                  >
                    <option value="staff">Staff — Standard Access</option>
                    <option value="admin">Admin — Full Access</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowAddStaff(false)}
                  className="flex-1 rounded-xl border border-border bg-surface-2 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface-3">
                  Cancel
                </button>
                <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
                  onClick={handleAddStaff}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-glow"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
                  Create Account
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
