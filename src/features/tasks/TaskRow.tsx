import { Task } from "@/types";
import { StatusBadge } from "@/components/common/StatusBadge";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskRow({
  task,
  onEdit,
  onDelete,
  clientName,
  index = 0,
  showClient = true,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  clientName?: string;
  index?: number;
  showClient?: boolean;
}) {
  const displayClient = clientName || task.client_name;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ delay: index * 0.03 }}
      className="group grid grid-cols-12 items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft transition hover:border-primary/40 hover:shadow-elevated"
    >
      <div className={cn("col-span-12", showClient ? "sm:col-span-2" : "sm:col-span-4")}>
        {showClient ? (
          <>
            <div className="truncate text-sm font-bold text-foreground">{displayClient || "—"}</div>
          </>
        ) : (
          <>
            <div className="truncate text-sm font-medium text-foreground">{task.title}</div>
          </>
        )}
      </div>
      {showClient && (
        <div className="col-span-12 sm:col-span-3">
          <div className="truncate text-sm font-medium text-muted-foreground">{task.title}</div>
        </div>
      )}
      <div className="col-span-4 text-xs capitalize text-muted-foreground sm:col-span-2">{task.post_type}</div>
      <div className="col-span-4 text-xs text-muted-foreground sm:col-span-2">
        <div className="hidden sm:block">
          {format(new Date(task.scheduled_date), "MMM d, yyyy")}
        </div>
      </div>
      <div className="col-span-3 sm:col-span-2"><StatusBadge status={task.status} /></div>
      <div className="col-span-1 flex justify-end gap-1 opacity-60 transition group-hover:opacity-100">
        <button onClick={onEdit} className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={onDelete} className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
