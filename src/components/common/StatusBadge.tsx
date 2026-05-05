import { TaskStatus } from "@/types";
import { cn } from "@/lib/utils";

const map: Record<TaskStatus, { label: string; cls: string; dot: string }> = {
  pending: { label: "Pending", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  scheduled: { label: "Scheduled", cls: "bg-info/10 text-info", dot: "bg-info" },
  uploaded: { label: "Uploaded", cls: "bg-success/10 text-success", dot: "bg-success" },
};

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const s = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", s.cls, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}
