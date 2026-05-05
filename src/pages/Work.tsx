import { useApp } from "@/context/AppContext";
import { useMemo, useState } from "react";
import { isToday, isTomorrow, isAfter, startOfDay, addDays, isSameDay } from "date-fns";
import { TaskRow } from "@/features/tasks/TaskRow";
import { TaskFormModal } from "@/features/tasks/TaskFormModal";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, CalendarDays } from "lucide-react";
import { Task } from "@/types";
import { EmptyState } from "@/components/common/EmptyState";
import { Shimmer } from "@/components/common/Skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Filter = "today" | "tomorrow" | "upcoming" | "custom";

export default function Work() {
  const { tasks, clients, loading, deleteTask } = useApp();
  const [filter, setFilter] = useState<Filter>("today");
  const [customDate, setCustomDate] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => {
        const d = new Date(t.scheduledAt);
        if (filter === "today") return isToday(d);
        if (filter === "tomorrow") return isTomorrow(d);
        if (filter === "upcoming")
          return isAfter(d, startOfDay(addDays(new Date(), 1))) && !isTomorrow(d);
        if (filter === "custom" && customDate) return isSameDay(d, new Date(customDate));
        return true;
      })
      .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
  }, [tasks, filter, customDate]);

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";
  const filters: { id: Filter; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "tomorrow", label: "Tomorrow" },
    { id: "upcoming", label: "Upcoming" },
    { id: "custom", label: "Pick a date" },
  ];

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
          <AnimatePresence>
            {filtered.map((t, i) => (
              <TaskRow
                key={t.id}
                task={t}
                index={i}
                clientName={clientName(t.clientId)}
                onEdit={() => { setEditing(t); setOpen(true); }}
                onDelete={() => { deleteTask(t.id); toast.success("Task deleted"); }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <TaskFormModal open={open} onClose={() => setOpen(false)} task={editing} />
    </div>
  );
}
