import { useMemo, useState } from "react";
import { isSameDay, isSameMonth, format } from "date-fns";
import { TaskRow } from "@/features/tasks/TaskRow";
import { TaskFormModal } from "@/features/tasks/TaskFormModal";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, CalendarDays, Filter } from "lucide-react";
import { Task, Client } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { Shimmer } from "@/components/common/Skeleton";
import { ExportMenu } from "@/components/common/ExportMenu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import useSWR, { useSWRConfig } from "swr";
import { fetcher, apiRequest } from "@/lib/api";

type Filter = "today" | "tomorrow" | "upcoming" | "month" | "custom";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "today",    label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "upcoming", label: "Upcoming" },
  { id: "month",    label: "This month" },
  { id: "custom",   label: "Pick date" },
];

export default function Work() {
  const { mutate } = useSWRConfig();
  const [filter, setFilter] = useState<Filter>("today");
  const [customDate, setCustomDate] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const endpoint = ["today", "tomorrow", "upcoming"].includes(filter)
    ? `/tasks?filter=${filter}`
    : "/tasks";

  const { data: tasks = [], isLoading: tasksLoading } = useSWR<Task[]>(endpoint, fetcher);
  const { data: clients = [], isLoading: clientsLoading } = useSWR<Client[]>("/workspaces", fetcher);

  const filtered = useMemo(() => {
    if (["today", "tomorrow", "upcoming"].includes(filter)) return tasks;
    return tasks
      .filter((t) => {
        const d = new Date(t.scheduled_date);
        if (filter === "month") return isSameMonth(d, new Date());
        if (filter === "custom" && customDate) return isSameDay(d, new Date(customDate));
        return true;
      })
      .sort((a, b) => +new Date(a.scheduled_date) - +new Date(b.scheduled_date));
  }, [tasks, filter, customDate]);

  const clientName = (t: Task) =>
    t.client_name || clients.find((c) => c._id === t.workspace_id)?.client_name || "—";

  const handleDelete = async (taskId: string) => {
    try {
      await apiRequest(`/tasks/${taskId}`, "DELETE");
      toast.success("Task deleted");
      mutate(endpoint);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task");
    }
  };

  const loading = tasksLoading || clientsLoading;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-tight text-foreground lg:text-5xl">Work</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${filtered.length} task${filtered.length !== 1 ? "s" : ""} · every scheduled piece, across every client`}
          </p>
        </div>
        <motion.button
          whileHover={{ y: -2, boxShadow: "0 12px 28px rgba(124,58,237,0.45)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setEditing(null); setOpen(true); }}
          className="flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-glow transition"
          style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
        >
          <Plus className="h-4 w-4" /> New task
        </motion.button>
      </div>

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-2">
        <Filter className="ml-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "h-8 rounded-xl border px-4 text-xs font-medium transition",
              filter === f.id
                ? "border-transparent text-white shadow-glow"
                : "border-transparent bg-transparent text-muted-foreground hover:bg-surface-2 hover:text-foreground"
            )}
            style={filter === f.id ? { background: "linear-gradient(135deg, #7c3aed, #a855f7)" } : {}}
          >
            {f.id === "custom" && <CalendarDays className="-ml-0.5 mr-1.5 inline h-3.5 w-3.5" />}
            {f.label}
          </button>
        ))}

        {filter === "custom" && (
          <motion.input
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="h-8 rounded-xl border border-border bg-surface-2 px-3 text-xs text-foreground outline-none focus:border-primary"
          />
        )}

        {filter === "month" && (
          <div className="ml-auto">
            <ExportMenu
              tasks={filtered}
              clients={clients}
              filename={`work-${format(new Date(), "yyyy-MM")}`}
              title={`Work Report — ${format(new Date(), "MMMM yyyy")}`}
              disabled={loading}
            />
          </div>
        )}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => <Shimmer key={i} className="h-16 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title="Nothing here"
          description="Try a different filter or schedule something new."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface-2/60 px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <div className="col-span-2 hidden sm:block">Client</div>
            <div className="col-span-12 sm:col-span-4">Task</div>
            <div className="col-span-2 hidden sm:block">Type</div>
            <div className="col-span-2 hidden sm:block">Date</div>
            <div className="col-span-1 hidden sm:block">Status</div>
            <div className="col-span-1 hidden text-right sm:block">·</div>
          </div>
          <AnimatePresence>
            {filtered.map((t, i) => (
              <TaskRow
                key={t._id}
                task={t}
                index={i}
                clientName={clientName(t)}
                onEdit={() => { setEditing(t); setOpen(true); }}
                onDelete={() => handleDelete(t._id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <TaskFormModal open={open} onClose={() => setOpen(false)} task={editing} clients={clients} />
    </div>
  );
}
