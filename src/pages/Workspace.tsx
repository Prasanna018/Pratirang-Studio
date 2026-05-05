import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, ListTodo, ChevronDown, Folder, FolderOpen, CalendarDays } from "lucide-react";
import { TaskFormModal } from "@/features/tasks/TaskFormModal";
import { TaskRow } from "@/features/tasks/TaskRow";
import { AnimatePresence, motion } from "framer-motion";
import { Task } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { Shimmer } from "@/components/common/Skeleton";
import { toast } from "sonner";
import { format } from "date-fns";

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

  const grouped = useMemo(() => {
    const map = new Map<number, Map<number, Task[]>>();
    for (const t of clientTasks) {
      const d = new Date(t.scheduledAt);
      const y = d.getFullYear();
      const m = d.getMonth();
      if (!map.has(y)) map.set(y, new Map());
      const months = map.get(y)!;
      if (!months.has(m)) months.set(m, []);
      months.get(m)!.push(t);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, months]) => ({
        year,
        months: Array.from(months.entries())
          .sort((a, b) => b[0] - a[0])
          .map(([month, tasks]) => ({ month, tasks })),
      }));
  }, [clientTasks]);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [openYears, setOpenYears] = useState<Record<number, boolean>>({ [currentYear]: true });
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({ [`${currentYear}-${currentMonth}`]: true });

  const toggleYear = (y: number) => setOpenYears((p) => ({ ...p, [y]: !p[y] }));
  const toggleMonth = (k: string) => setOpenMonths((p) => ({ ...p, [k]: !p[k] }));

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
        <div className="space-y-4">
          {grouped.map(({ year, months }) => {
            const yearOpen = openYears[year] ?? false;
            const yearTotal = months.reduce((s, m) => s + m.tasks.length, 0);
            return (
              <div key={year} className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
                <button
                  onClick={() => toggleYear(year)}
                  className="flex w-full items-center justify-between px-5 py-4 transition hover:bg-surface-2"
                >
                  <div className="flex items-center gap-3">
                    {yearOpen ? <FolderOpen className="h-5 w-5 text-primary" /> : <Folder className="h-5 w-5 text-primary" />}
                    <span className="font-display text-2xl">{year}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {yearTotal} {yearTotal === 1 ? "task" : "tasks"}
                    </span>
                  </div>
                  <motion.div animate={{ rotate: yearOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {yearOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 border-t border-border px-3 py-3">
                        {months.map(({ month, tasks: mTasks }) => {
                          const key = `${year}-${month}`;
                          const monthOpen = openMonths[key] ?? false;
                          const label = format(new Date(year, month, 1), "MMMM");
                          return (
                            <div key={key} className="overflow-hidden rounded-2xl border border-border bg-surface-2/50">
                              <button
                                onClick={() => toggleMonth(key)}
                                className="flex w-full items-center justify-between px-4 py-3 transition hover:bg-surface-2"
                              >
                                <div className="flex items-center gap-3">
                                  <CalendarDays className="h-4 w-4 text-accent" />
                                  <span className="text-sm font-semibold">{label}</span>
                                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    {mTasks.length}
                                  </span>
                                </div>
                                <motion.div animate={{ rotate: monthOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
                                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                </motion.div>
                              </button>
                              <AnimatePresence initial={false}>
                                {monthOpen && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="space-y-2 border-t border-border bg-background/40 p-3">
                                      <div className="grid grid-cols-12 gap-4 px-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        <div className="col-span-12 sm:col-span-5">Task</div>
                                        <div className="hidden sm:col-span-2 sm:block">Type</div>
                                        <div className="hidden sm:col-span-2 sm:block">Schedule</div>
                                        <div className="hidden sm:col-span-2 sm:block">Status</div>
                                        <div className="hidden sm:col-span-1 sm:block" />
                                      </div>
                                      <AnimatePresence>
                                        {mTasks.map((t, i) => (
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
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      <TaskFormModal open={open} onClose={() => setOpen(false)} clientId={client.id} task={editing} />
    </div>
  );
}
