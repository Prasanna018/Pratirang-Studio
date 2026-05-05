import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import { Plus, Folder, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Modal } from "@/components/common/Modal";
import { Shimmer } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";

export default function Clients() {
  const { clients, tasks, loading, addClient } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [industry, setIndustry] = useState("");

  const colors = ["244 75% 58%", "168 76% 42%", "340 75% 60%", "38 95% 55%", "217 90% 58%", "140 60% 45%"];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addClient({
      name: name.trim(),
      handle: handle.trim() || `@${name.toLowerCase().replace(/\s+/g, "")}`,
      industry: industry.trim() || "General",
      color: colors[Math.floor(Math.random() * colors.length)],
    });
    toast.success("Workspace created");
    setName(""); setHandle(""); setIndustry("");
    setOpen(false);
  };

  const taskCount = (id: string) => tasks.filter((t) => t.clientId === id).length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-5xl tracking-tight">Clients</h1>
          <p className="mt-2 text-muted-foreground">Open a workspace to manage its content pipeline.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex h-11 items-center gap-2 rounded-xl gradient-primary px-5 text-sm font-medium text-primary-foreground shadow-glow transition hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> New workspace
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => <Shimmer key={i} className="h-44 rounded-3xl" />)}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No clients yet"
          description="Create your first workspace to start scheduling content."
          action={
            <button onClick={() => setOpen(true)} className="rounded-xl gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow">
              Create workspace
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={`/clients/${c.id}`}
                className="group relative block overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:shadow-elevated"
              >
                <div
                  className="absolute inset-x-0 top-0 h-24 opacity-80 transition group-hover:opacity-100"
                  style={{ background: `linear-gradient(135deg, hsl(${c.color}) 0%, hsl(${c.color} / 0.4) 100%)` }}
                />
                <div className="relative flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground shadow-soft"
                    style={{ background: `hsl(${c.color})` }}
                  >
                    <Folder className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
                    {c.industry}
                  </span>
                </div>
                <div className="relative mt-10">
                  <h3 className="font-display text-2xl text-foreground">{c.name}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{c.handle}</p>
                </div>
                <div className="relative mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{taskCount(c.id)}</span> tasks
                  </span>
                  <span className="text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
                    Open →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New workspace">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Client name" value={name} onChange={setName} placeholder="Acme Co." />
          <Field label="Handle" value={handle} onChange={setHandle} placeholder="@acme" />
          <Field label="Industry" value={industry} onChange={setIndustry} placeholder="SaaS" />
          <button className="mt-2 h-11 w-full rounded-xl gradient-primary text-sm font-medium text-primary-foreground shadow-glow">
            Create workspace
          </button>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border bg-surface-2 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
