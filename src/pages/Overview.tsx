import { useMemo } from "react";
import { motion } from "framer-motion";
import { Users, LayoutDashboard, Calendar, ArrowRight, Activity, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Client, Task } from "@/types";
import { Shimmer } from "@/components/common/Skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { format } from "date-fns";

export default function Overview() {
  const { data: clients = [], isLoading: clientsLoading } = useSWR<Client[]>("/workspaces", fetcher);
  const { data: tasks = [], isLoading: tasksLoading } = useSWR<Task[]>("/tasks", fetcher);

  const loading = clientsLoading || tasksLoading;

  const clientStats = useMemo(() => {
    return clients.map(client => {
      const clientTasks = tasks.filter(t => t.workspace_id === client._id);
      const pending = clientTasks.filter(t => t.status === "pending").length;
      const scheduled = clientTasks.filter(t => t.status === "scheduled").length;
      const upcoming = clientTasks
        .filter(t => t.status !== "uploaded")
        .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
        .slice(0, 3);

      return {
        ...client,
        pending,
        scheduled,
        upcoming,
        total: clientTasks.length,
        health: scheduled > 0 ? "Healthy" : "Needs Attention"
      };
    });
  }, [clients, tasks]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-0 sm:px-4 lg:px-0">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">Studio Overview</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            A high-level view of progress across all your creative partnerships.
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card/50 p-2 pl-4 pr-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Clients</span>
            <span className="text-xl font-display leading-none">{clients.length}</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Tasks</span>
            <span className="text-xl font-display leading-none">{tasks.filter(t => t.status !== 'uploaded').length}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[0, 1, 2, 3].map(i => <Shimmer key={i} className="h-80 rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {clientStats.map((client, i) => (
            <motion.div
              key={client._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition hover:border-primary/50 hover:shadow-glow"
            >
              <div className="p-6">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
                      {client.client_name.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="font-display text-xl leading-tight">{client.client_name}</h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${client.health === 'Healthy' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                          {client.health}
                        </span>
                        <span className="text-xs text-muted-foreground">{client.total} total posts</span>
                      </div>
                    </div>
                  </div>
                  <Link 
                    to={`/workspace/${client._id}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted-foreground transition hover:border-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="rounded-2xl bg-surface-2 p-4 border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" /> Pending
                    </div>
                    <div className="text-2xl font-display">{client.pending}</div>
                  </div>
                  <div className="rounded-2xl bg-surface-2 p-4 border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3" /> Scheduled
                    </div>
                    <div className="text-2xl font-display">{client.scheduled}</div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Upcoming Content</h4>
                  <div className="space-y-2">
                    {client.upcoming.length > 0 ? (
                      client.upcoming.map((task) => (
                        <div key={task._id} className="flex items-center justify-between rounded-xl border border-border/50 bg-surface-2/50 px-3 py-2 text-sm">
                          <span className="truncate font-medium pr-2">{task.title}</span>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(task.scheduled_date), "MMM d")}
                            </span>
                            <StatusBadge status={task.status} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-16 flex-col items-center justify-center rounded-xl border border-dashed border-border text-center">
                        <p className="text-[10px] text-muted-foreground italic">No upcoming tasks</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar at the bottom */}
              <div className="absolute bottom-0 left-0 h-1 w-full bg-surface-3">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((client.scheduled / (client.total || 1)) * 100, 100)}%` }}
                  className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" 
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
