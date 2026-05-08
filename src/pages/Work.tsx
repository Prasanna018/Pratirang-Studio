import { useMemo, useState } from "react";
import { isToday, isTomorrow, isAfter, startOfDay, addDays, isSameDay, isSameMonth } from "date-fns";
import { TaskRow } from "@/features/tasks/TaskRow";
import { TaskFormModal } from "@/features/tasks/TaskFormModal";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, CalendarDays } from "lucide-react";
import { Task, Client } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { Shimmer } from "@/components/common/Skeleton";
import { ExportMenu } from "@/components/common/ExportMenu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import useSWR, { useSWRConfig } from "swr";
import { fetcher, apiRequest } from "@/lib/api";

type Filter = "today" | "tomorrow" | "upcoming" | "month" | "custom";

export default function Work() {
  const { mutate } = useSWRConfig();
  const [filter, setFilter] = useState<Filter>("today");
  const [customDate, setCustomDate] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  // Determine API endpoint based on filter
  const getEndpoint = () => {
    if (["today", "tomorrow", "upcoming"].includes(filter)) {
      return `/tasks?filter=${filter}`;
    }
    return "/tasks";
  };

  const { data: tasks = [], isLoading: tasksLoading } = useSWR<Task[]>(getEndpoint(), fetcher);
  const { data: clients = [], isLoading: clientsLoading } = useSWR<Client[]>("/workspaces", fetcher);

  const filtered = useMemo(() => {
    // If it's one of the backend-filtered ones, just return tasks
    if (["today", "tomorrow", "upcoming"].includes(filter)) return tasks;
    
    // Otherwise filter in frontend
    return tasks
      .filter((t) => {
        const d = new Date(t.scheduled_date);
        if (filter === "month") return isSameMonth(d, new Date());
        if (filter === "custom" && customDate) return isSameDay(d, new Date(customDate));
        return true;
      })
      .sort((a, b) => +new Date(a.scheduled_date) - +new Date(b.scheduled_date));
  }, [tasks, filter, customDate]);

  const clientName = (task: Task) => task.client_name || clients.find((c) => c._id === task.workspace_id)?.client_name || "—";
  
  const filters: { id: Filter; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "tomorrow", label: "Tomorrow" },
    { id: "upcoming", label: "Upcoming" },
    { id: "month", label: "This month" },
    { id: "custom", label: "Pick a date" },
  ];

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiRequest(`/tasks/${taskId}`, "DELETE");
      toast.success("Task deleted");
      mutate(getEndpoint());
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task");
    }
  };

  const loading = tasksLoading || clientsLoading;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-5xl tracking-tight">Work</h1>
          <p className="mt-2 text-muted-foreground">Every scheduled piece, across every client.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setOpen(true); }}
          className="flex h-11 items-center gap-2 rounded-xl gradient-primary px-5 text-sm font-medium text-primary-foreground shadow-glow transition hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> New task
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "relative h-9 rounded-full border px-4 text-xs font-medium transition",
              filter === f.id
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {f.id === "custom" && <CalendarDays className="-ml-0.5 mr-1.5 inline h-3.5 w-3.5" />}
            {f.label}
          </button>
        ))}
        {filter === "custom" && (
          <motion.input
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="h-9 rounded-full border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-4 px-4 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div className="col-span-12 sm:col-span-2">Client</div>
            <div className="col-span-12 sm:col-span-3">Task</div>
            <div className="hidden sm:col-span-2 sm:block">Type</div>
            <div className="hidden sm:col-span-2 sm:block">Schedule</div>
            <div className="hidden sm:col-span-2 sm:block">Status</div>
            <div className="hidden sm:col-span-1 sm:block text-right pr-2">Action</div>
          </div>
          <AnimatePresence>
            {filtered.map((t, i) => (
              <TaskRow
                key={t._id}
                task={t}
                index={i}
                clientName={clientName(t)}
                onEdit={() => { setEditing(t); setOpen(true); }}
                onDelete={() => handleDeleteTask(t._id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <TaskFormModal open={open} onClose={() => setOpen(false)} task={editing} clients={clients} />
    </div>
  );
}
