import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Calendar, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Client, Task } from "@/types";
import { Shimmer } from "@/components/common/Skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { format } from "date-fns";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <div className="mt-3 font-display text-4xl font-bold text-foreground">{value}</div>
    </motion.div>
  );
}

export default function Overview() {
  const { data: clients = [], isLoading: clientsLoading } = useSWR<Client[]>("/workspaces", fetcher);
  const { data: tasks = [], isLoading: tasksLoading } = useSWR<Task[]>("/tasks", fetcher);
  const loading = clientsLoading || tasksLoading;

  const totalTasks    = tasks.length;
  const pendingAll    = tasks.filter((t) => t.status === "pending").length;
  const scheduledAll  = tasks.filter((t) => t.status === "scheduled").length;
  const uploadedAll   = tasks.filter((t) => t.status === "uploaded").length;

  const clientStats = useMemo(
    () =>
      clients.map((client) => {
        const ct = tasks.filter((t) => t.workspace_id === client._id);
        const pending   = ct.filter((t) => t.status === "pending").length;
        const scheduled = ct.filter((t) => t.status === "scheduled").length;
        const uploaded  = ct.filter((t) => t.status === "uploaded").length;
        const upcoming  = ct
          .filter((t) => t.status !== "uploaded")
          .sort((a, b) => +new Date(a.scheduled_date) - +new Date(b.scheduled_date))
          .slice(0, 3);
        const scheduledPct = ct.length > 0 ? Math.round((scheduled / ct.length) * 100) : 0;
        return { ...client, pending, scheduled, uploaded, upcoming, total: ct.length, scheduledPct };
      }),
    [clients, tasks]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl tracking-tight text-foreground lg:text-5xl">Overview</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          High-level progress across all your creative partnerships.
        </p>
      </div>

      {/* Global KPI strip */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0,1,2,3].map((i) => <Shimmer key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Tasks"  value={totalTasks}   icon={TrendingUp}    color="#7c3aed" />
          <StatCard label="Pending"      value={pendingAll}   icon={Clock}         color="#f59e0b" />
          <StatCard label="Scheduled"    value={scheduledAll} icon={Calendar}      color="#3b82f6" />
          <StatCard label="Uploaded"     value={uploadedAll}  icon={CheckCircle}   color="#22c55e" />
        </div>
      )}

      {/* Per-client cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[0,1,2,3].map((i) => <Shimmer key={i} className="h-72 rounded-3xl" />)}
        </div>
      ) : clientStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20 text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No clients yet. Add workspaces from the Clients page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {clientStats.map((client, i) => (
            <motion.div
              key={client._id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition hover:border-primary/40 hover:shadow-elevated"
            >
              <div className="p-6">
                {/* Card header */}
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl font-display text-xl font-bold text-white shadow-glow"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                    >
                      {client.client_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display text-xl text-foreground">{client.client_name}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={client.scheduled > 0
                            ? { background: "hsl(var(--success)/0.1)", color: "hsl(var(--success))" }
                            : { background: "hsl(var(--warning)/0.1)", color: "hsl(var(--warning))" }}
                        >
                          {client.scheduled > 0 ? "● Healthy" : "● Needs attention"}
                        </span>
                        <span className="text-xs text-muted-foreground">{client.total} total</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/clients/${client._id}`}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted-foreground transition hover:border-primary/40 hover:text-primary"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Mini stats */}
                <div className="mb-5 grid grid-cols-3 gap-3">
                  {[
                    { label: "Pending",   value: client.pending,   color: "hsl(var(--warning))" },
                    { label: "Scheduled", value: client.scheduled, color: "hsl(var(--info))" },
                    { label: "Uploaded",  value: client.uploaded,  color: "hsl(var(--success))" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-xl border border-border/50 bg-surface-2 p-3 text-center">
                      <div className="font-display text-2xl font-bold" style={{ color }}>{value}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Upcoming content */}
                <div>
                  <h4 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Upcoming</h4>
                  <div className="space-y-1.5">
                    {client.upcoming.length > 0 ? (
                      client.upcoming.map((task) => (
                        <div key={task._id} className="flex items-center justify-between rounded-xl border border-border/50 bg-surface-2/50 px-3 py-2 text-sm">
                          <span className="truncate pr-2 font-medium text-foreground">{task.title}</span>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">{format(new Date(task.scheduled_date), "MMM d")}</span>
                            <StatusBadge status={task.status} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-14 items-center justify-center rounded-xl border border-dashed border-border">
                        <p className="text-xs italic text-muted-foreground">No upcoming tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1 w-full bg-surface-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${client.scheduledPct}%` }}
                  transition={{ delay: i * 0.05 + 0.3, duration: 0.8, ease: "easeOut" }}
                  className="h-full"
                  style={{ background: "linear-gradient(90deg, #7c3aed, #a855f7)" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
