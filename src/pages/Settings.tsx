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
    <div className="mx-auto max-w-4xl space-y-8 px-0 sm:px-4 lg:px-0 pb-12">
      <div>
        <h1 className="font-display text-4xl tracking-tight">Studio Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your team and studio identity.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column: Studio Profile */}
        <div className="md:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl">Branding</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Studio Name</label>
                <input 
                  type="text" 
                  defaultValue={studio?.name}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="Enter studio name"
                />
              </div>
              <button 
                onClick={handleUpdateStudio}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition hover:brightness-110"
              >
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </motion.div>

          <div className="rounded-3xl border border-border bg-surface-2/30 p-6">
            <h3 className="text-sm font-bold text-foreground">Studio ID</h3>
            <p className="mt-1 text-xs text-muted-foreground break-all font-mono">{user?.studio_id}</p>
          </div>
        </div>

        {/* Right Column: Staff Management */}
        <div className="md:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-info" />
                <h2 className="font-display text-xl">Team Management</h2>
              </div>
              <button 
                onClick={() => setShowAddStaff(true)}
                className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/20"
              >
                <UserPlus className="h-4 w-4" /> Add Staff
              </button>
            </div>

            <div className="divide-y divide-border">
              {membersLoading ? (
                [0, 1, 2].map(i => <Shimmer key={i} className="h-16 w-full my-2 rounded-2xl" />)
              ) : members.map(m => (
                <div key={m._id} className="flex items-center justify-between py-4 group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-2 text-primary font-display border border-border">
                      {m.username.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium flex items-center gap-2">
                        {m.username}
                        {m.role === 'admin' && <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full uppercase">Admin</span>}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {m.email}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 mr-4">
                      {m.is_active ? (
                        <span className="flex items-center gap-1 text-[10px] text-success font-medium bg-success/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-destructive font-medium bg-destructive/10 px-2 py-0.5 rounded-full">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </div>
                    
                    {m._id !== user?._id && (
                      <button 
                        onClick={() => handleToggleStatus(m._id, m.is_active)}
                        className={`text-xs font-medium px-3 py-1 rounded-lg transition ${
                          m.is_active 
                            ? "text-destructive hover:bg-destructive/10" 
                            : "text-success hover:bg-success/10"
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
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-elevated"
            >
              <h2 className="font-display text-2xl mb-4">Add Team Member</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address</label>
                  <input 
                    type="email" 
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="staff@studio.com"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Initial Password</label>
                  <input 
                    type="password" 
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-primary"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Role</label>
                  <select 
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                    className="mt-1.5 w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm outline-none focus:border-primary"
                  >
                    <option value="staff">Staff (Standard Access)</option>
                    <option value="admin">Admin (Full Access)</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setShowAddStaff(false)}
                  className="flex-1 rounded-xl bg-surface-2 py-2.5 text-sm font-medium transition hover:bg-border"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddStaff}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-glow transition hover:brightness-110"
                >
                  Create Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
