import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, ListTodo } from "lucide-react";
import { TaskFormModal } from "@/features/tasks/TaskFormModal";
import { TaskRow } from "@/features/tasks/TaskRow";
import { AnimatePresence } from "framer-motion";
import { Task } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { Shimmer } from "@/components/common/Skeleton";
import { toast } from "sonner";

export default function Workspace() {
  const { id } = useParams();
  const { clients, tasks, loading, deleteTask } = useApp();
  const client = clients.find((c) => c.id === id);
  const clientTasks = useMemo(
    () => tasks.filter((t) => t.clientId === id).sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt)),
    [tasks, id]
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Shimmer className="h-12 w-1/2" />
        {[0, 1, 2, 3].map((i) => <Shimmer key={i} className="h-16 rounded-2xl" />)}
      </div>
    );
  }

  if (!client) {
    return (
      <div className="mx-auto max-w-5xl">
        <EmptyState title="Workspace not found" description="This client may have been removed." action={
          <Link to="/clients" className="rounded-xl gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow">Back to clients</Link>
        }/>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/clients" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> All clients
      </Link>

      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-3xl text-primary-foreground shadow-elevated"
            style={{ background: `hsl(${client.color})` }}
          >
            <span className="font-display text-2xl">{client.name.slice(0, 1)}</span>
          </div>
          <div>
            <h1 className="font-display text-5xl tracking-tight">{client.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{client.handle} · {client.industry}</p>
          </div>
        </div>
        <button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="flex h-11 items-center gap-2 rounded-xl gradient-primary px-5 text-sm font-medium text-primary-foreground shadow-glow transition hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> New task
        </button>
      </div>

      {clientTasks.length === 0 ? (
        <EmptyState
          icon={<ListTodo className="h-6 w-6" />}
          title="No tasks yet"
          description="Plan your first piece of content for this client."
          action={
            <button onClick={() => { setEditing(null); setOpen(true); }} className="rounded-xl gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow">
              Create task
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-4 px-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-12 sm:col-span-5">Task</div>
            <div className="hidden sm:col-span-2 sm:block">Type</div>
            <div className="hidden sm:col-span-2 sm:block">Schedule</div>
            <div className="hidden sm:col-span-2 sm:block">Status</div>
            <div className="hidden sm:col-span-1 sm:block" />
          </div>
          <AnimatePresence>
            {clientTasks.map((t, i) => (
              <TaskRow
                key={t.id}
                task={t}
                index={i}
                onEdit={() => { setEditing(t); setOpen(true); }}
                onDelete={() => { deleteTask(t.id); toast.success("Task deleted"); }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <TaskFormModal open={open} onClose={() => setOpen(false)} clientId={client.id} task={editing} />
    </div>
  );
}
