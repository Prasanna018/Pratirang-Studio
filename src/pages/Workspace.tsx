import { useParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useMemo, useState } from "react";
import { ArrowLeft, Plus, ListTodo, Folder, CalendarDays, ChevronRight } from "lucide-react";
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
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

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
    return map;
  }, [clientTasks]);

  const years = Array.from(grouped.keys()).sort((a, b) => b - a);
  const monthsForYear = selectedYear !== null
    ? Array.from(grouped.get(selectedYear)?.entries() ?? []).sort((a, b) => b[0] - a[0])
    : [];
  const tasksForMonth = selectedYear !== null && selectedMonth !== null
    ? grouped.get(selectedYear)?.get(selectedMonth) ?? []
    : [];

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

  const view: "years" | "months" | "tasks" =
    selectedYear === null ? "years" : selectedMonth === null ? "months" : "tasks";

  return (
    <div className="mx-auto max-w-6xl">
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

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-1.5 text-sm">
        <button
          onClick={() => { setSelectedYear(null); setSelectedMonth(null); }}
          className={`rounded-lg px-2.5 py-1 transition hover:bg-surface-2 ${view === "years" ? "font-semibold text-foreground" : "text-muted-foreground"}`}
        >
          All years
        </button>
        {selectedYear !== null && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <button
              onClick={() => setSelectedMonth(null)}
              className={`rounded-lg px-2.5 py-1 transition hover:bg-surface-2 ${view === "months" ? "font-semibold text-foreground" : "text-muted-foreground"}`}
            >
              {selectedYear}
            </button>
          </>
        )}
        {selectedMonth !== null && selectedYear !== null && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="rounded-lg px-2.5 py-1 font-semibold text-foreground">
              {format(new Date(selectedYear, selectedMonth, 1), "MMMM")}
            </span>
          </>
        )}
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
        <AnimatePresence mode="wait">
          {view === "years" && (
            <motion.div
              key="years"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {years.map((y, i) => {
                const total = Array.from(grouped.get(y)!.values()).reduce((s, arr) => s + arr.length, 0);
                const monthCount = grouped.get(y)!.size;
                return (
                  <motion.button
                    key={y}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedYear(y)}
                    className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-left shadow-soft transition hover:shadow-elevated"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-24 opacity-80 transition group-hover:opacity-100"
                      style={{ background: `linear-gradient(135deg, hsl(${client.color}) 0%, hsl(${client.color} / 0.4) 100%)` }}
                    />
                    <div className="relative flex items-start justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground shadow-soft"
                        style={{ background: `hsl(${client.color})` }}
                      >
                        <Folder className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
                        Year
                      </span>
                    </div>
                    <div className="relative mt-10">
                      <h3 className="font-display text-3xl text-foreground">{y}</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">{monthCount} {monthCount === 1 ? "month" : "months"}</p>
                    </div>
                    <div className="relative mt-5 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{total}</span> tasks
                      </span>
                      <span className="text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
                        Open →
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {view === "months" && selectedYear !== null && (
            <motion.div
              key="months"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {monthsForYear.map(([m, mTasks], i) => (
                <motion.button
                  key={m}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedMonth(m)}
                  className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-left shadow-soft transition hover:shadow-elevated"
                >
                  <div
                    className="absolute inset-x-0 top-0 h-24 opacity-80 transition group-hover:opacity-100"
                    style={{ background: `linear-gradient(135deg, hsl(${client.color}) 0%, hsl(${client.color} / 0.4) 100%)` }}
                  />
                  <div className="relative flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground shadow-soft"
                      style={{ background: `hsl(${client.color})` }}
                    >
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground backdrop-blur">
                      {selectedYear}
                    </span>
                  </div>
                  <div className="relative mt-10">
                    <h3 className="font-display text-3xl text-foreground">{format(new Date(selectedYear, m, 1), "MMMM")}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{format(new Date(selectedYear, m, 1), "MMM yyyy")}</p>
                  </div>
                  <div className="relative mt-5 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{mTasks.length}</span> tasks
                    </span>
                    <span className="text-xs font-medium text-primary opacity-0 transition group-hover:opacity-100">
                      Open →
                    </span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {view === "tasks" && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              <div className="grid grid-cols-12 gap-4 px-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-12 sm:col-span-5">Task</div>
                <div className="hidden sm:col-span-2 sm:block">Type</div>
                <div className="hidden sm:col-span-2 sm:block">Schedule</div>
                <div className="hidden sm:col-span-2 sm:block">Status</div>
                <div className="hidden sm:col-span-1 sm:block" />
              </div>
              <AnimatePresence>
                {tasksForMonth.map((t, i) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    index={i}
                    onEdit={() => { setEditing(t); setOpen(true); }}
                    onDelete={() => { deleteTask(t.id); toast.success("Task deleted"); }}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <TaskFormModal open={open} onClose={() => setOpen(false)} clientId={client.id} task={editing} />
    </div>
  );
}
