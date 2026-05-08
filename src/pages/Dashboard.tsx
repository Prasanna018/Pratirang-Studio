import { useApp } from "@/context/AppContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, CalendarCheck, Clock3, Sparkles, ArrowUpRight } from "lucide-react";
import { format, isToday } from "date-fns";
import { Shimmer } from "@/components/common/Skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Client, Task } from "@/types";

export default function Dashboard() {
  const { user } = useApp();
  const { data: clients = [], isLoading: clientsLoading } = useSWR<Client[]>("/workspaces", fetcher);
  const { data: tasks = [], isLoading: tasksLoading } = useSWR<Task[]>("/tasks", fetcher);

  const loading = clientsLoading || tasksLoading;

  const stats = [
    { label: "Active clients", value: clients.length, icon: Users, accent: "from-primary/20 to-primary/5", tone: "text-primary" },
    {
      label: "Scheduled posts",
      value: tasks.filter((t) => t.status === "scheduled").length,
      icon: CalendarCheck,
      accent: "from-info/20 to-info/5",
      tone: "text-info",
    },
    {
      label: "Pending review",
      value: tasks.filter((t) => t.status === "pending").length,
      icon: Clock3,
      accent: "from-warning/20 to-warning/5",
      tone: "text-warning",
    },
    {
      label: "Published today",
      value: tasks.filter((t) => t.status === "uploaded" && isToday(new Date(t.scheduled_date))).length,
      icon: Sparkles,
      accent: "from-accent/20 to-accent/5",
      tone: "text-accent",
    },
  ];

  const recent = [...tasks].sort((a, b) => +new Date(b.scheduled_date) - +new Date(a.scheduled_date)).slice(0, 6);
  const clientName = (task: Task) => task.client_name || clients.find((c) => c._id === task.workspace_id)?.client_name || "—";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-0 sm:px-4 lg:px-0">
      <div>
        <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">
          Hello, <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">{user?.username}</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm sm:text-base text-muted-foreground">
          Here's a calm view of everything happening across your studio today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            className={`relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${s.accent} p-5 shadow-soft`}
          >
            <div className="absolute right-4 top-4">
              <s.icon className={`h-5 w-5 ${s.tone}`} />
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-3 font-display text-5xl text-foreground">
              {loading ? <Shimmer className="h-10 w-16" /> : s.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Recent activity</h2>
            <Link to="/work" className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground">
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {loading
              ? [0, 1, 2, 3].map((i) => <Shimmer key={i} className="h-14 rounded-2xl" />)
              : recent.map((t, i) => (
                  <motion.div
                    key={t._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between rounded-2xl border border-transparent px-3 py-3 transition hover:border-border hover:bg-surface-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-primary">
                        {clientName(t).slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{t.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {clientName(t)} · {t.post_type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden text-xs text-muted-foreground sm:block">
                        {format(new Date(t.scheduled_date), "MMM d, yyyy")}
                      </span>
                      <StatusBadge status={t.status} />
                    </div>
                  </motion.div>
                ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl border border-border gradient-primary p-6 text-primary-foreground shadow-elevated"
        >
          <Sparkles className="absolute right-4 top-4 h-5 w-5 opacity-70" />
          <div className="text-xs font-medium uppercase tracking-widest opacity-80">This week</div>
          <h3 className="mt-2 font-display text-3xl leading-tight">
            You're 18% ahead of last week's pace.
          </h3>
          <p className="mt-3 text-sm opacity-80">
            Keep the momentum — review tomorrow's queue to stay on track.
          </p>
          <button className="mt-6 rounded-xl bg-primary-foreground/20 px-4 py-2 text-xs font-medium backdrop-blur transition hover:bg-primary-foreground/30">
            Open weekly report
          </button>
        </motion.div>
      </div>
    </div>
  );
}
