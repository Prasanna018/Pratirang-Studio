import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users, ArrowUpRight, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { Modal } from "@/components/common/Modal";
import { Shimmer } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import { fetcher, apiRequest } from "@/lib/api";
import { Client, Task } from "@/types";

/** Stable Unsplash image seeded by client name */
function clientImage(name: string) {
  const seed = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const themes = ["creative,design", "photography,studio", "office,workspace", "branding,marketing", "team,collaborate", "digital,agency"];
  const theme = themes[seed % themes.length];
  return `https://source.unsplash.com/400x200/?${theme}&sig=${seed}`;
}

/** Gradient overlay per card index */
const OVERLAYS = [
  "linear-gradient(135deg, rgba(109,40,217,0.7), rgba(30,10,60,0.85))",
  "linear-gradient(135deg, rgba(217,70,40,0.6), rgba(30,10,10,0.85))",
  "linear-gradient(135deg, rgba(20,100,180,0.6), rgba(10,20,50,0.85))",
  "linear-gradient(135deg, rgba(40,170,100,0.6), rgba(10,30,20,0.85))",
  "linear-gradient(135deg, rgba(200,80,140,0.6), rgba(40,10,30,0.85))",
  "linear-gradient(135deg, rgba(180,140,20,0.6), rgba(40,30,5,0.85))",
];

export default function Clients() {
  const { data: clients = [], isLoading: clientsLoading } = useSWR<Client[]>("/workspaces", fetcher);
  const { data: tasks = [], isLoading: tasksLoading } = useSWR<Task[]>("/tasks", fetcher);
  const { mutate } = useSWRConfig();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loading = clientsLoading || tasksLoading;
  const taskCount = (id: string) => tasks.filter((t) => t.workspace_id === id).length;
  const pendingCount = (id: string) => tasks.filter((t) => t.workspace_id === id && t.status === "pending").length;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await apiRequest("/workspaces", "POST", { client_name: name.trim(), description: description.trim() });
      toast.success("Workspace created");
      mutate("/workspaces");
      setName(""); setDescription(""); setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create workspace");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-tight text-foreground lg:text-5xl">Clients</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {loading ? "Loading workspaces…" : `${clients.length} workspace${clients.length !== 1 ? "s" : ""} · open one to manage its content pipeline`}
          </p>
        </div>
        <motion.button
          whileHover={{ y: -2, boxShadow: "0 12px 32px rgba(124,58,237,0.45)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setOpen(true)}
          className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-glow transition"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
        >
          <Plus className="h-4 w-4" /> New workspace
        </motion.button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <Shimmer key={i} className="h-60 rounded-3xl" />)}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No clients yet"
          description="Create your first workspace to start scheduling content."
          action={
            <button onClick={() => setOpen(true)}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-glow"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
              Create workspace
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }}
            >
              <Link
                to={`/clients/${c._id}`}
                className="group relative block overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-shadow hover:shadow-elevated"
              >
                {/* Image Header */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={clientImage(c.client_name)}
                    alt={c.client_name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Color overlay */}
                  <div
                    className="absolute inset-0"
                    style={{ background: OVERLAYS[i % OVERLAYS.length] }}
                  />
                  {/* Client initial */}
                  <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                    <span className="font-display text-xl font-bold text-white">
                      {c.client_name.slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                  {/* Workspace tag */}
                  <div className="absolute right-3 top-3 rounded-full bg-black/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm">
                    Workspace
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <h3 className="font-display text-xl text-foreground">{c.client_name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {c.description || "No description added yet."}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        <span className="font-semibold text-foreground">{taskCount(c._id)}</span> tasks
                      </span>
                      {pendingCount(c._id) > 0 && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: "hsl(var(--warning)/0.15)", color: "hsl(var(--warning))" }}>
                          {pendingCount(c._id)} pending
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      Open <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* New workspace modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="New workspace">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Client name" value={name} onChange={setName} placeholder="Acme Co." />
          <Field label="Description" value={description} onChange={setDescription} placeholder="Manage social media for Acme" />
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="mt-2 h-11 w-full rounded-xl text-sm font-semibold text-white shadow-glow"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            Create workspace
          </motion.button>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border bg-surface-2 px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </div>
  );
}
