import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import { Plus, Folder, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Modal } from "@/components/common/Modal";
import { Shimmer } from "@/components/common/Skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import { fetcher, apiRequest } from "@/lib/api";
import { Client, Task } from "@/types";

export default function Clients() {
  const { data: clients = [], isLoading: clientsLoading } = useSWR<Client[]>("/workspaces", fetcher);
  const { data: tasks = [], isLoading: tasksLoading } = useSWR<Task[]>("/tasks", fetcher);
  const { mutate } = useSWRConfig();
  
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const loading = clientsLoading || tasksLoading;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await apiRequest("/workspaces", "POST", {
        client_name: name.trim(),
        description: description.trim()
      });
      toast.success("Workspace created");
      mutate("/workspaces");
      setName(""); 
      setDescription("");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create workspace");
    }
  };

  const taskCount = (id: string) => tasks.filter((t) => t.workspace_id === id).length;

  return (
    <div className="mx-auto max-w-6xl px-0 sm:px-4 lg:px-0">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">Clients</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">Open a workspace to manage its content pipeline.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl gradient-primary px-5 text-sm font-medium text-primary-foreground shadow-glow transition hover:-translate-y-0.5"
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
              key={c._id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={`/clients/${c._id}`}
                className="group relative block overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:shadow-elevated"
              >
                <div
                  className="absolute inset-x-0 top-0 h-24 opacity-80 transition group-hover:opacity-100 bg-gradient-to-br from-primary/20 to-primary/5"
                />
                <div className="relative flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft"
                  >
                    <Folder className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
                    Workspace
                  </span>
                </div>
                <div className="relative mt-10">
                  <h3 className="font-display text-2xl text-foreground">{c.client_name}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{c.description || "No description"}</p>
                </div>
                <div className="relative mt-5 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{taskCount(c._id)}</span> tasks
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
          <Field label="Description" value={description} onChange={setDescription} placeholder="Manage social media for Acme" />
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
