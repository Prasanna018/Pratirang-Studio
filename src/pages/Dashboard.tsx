import { useApp } from "@/context/AppContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, CalendarCheck, Clock3, Sparkles, ArrowUpRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format, isToday, isTomorrow, startOfDay, addDays, subWeeks, startOfWeek } from "date-fns";
import { Shimmer } from "@/components/common/Skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Client, Task } from "@/types";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow" | "upcoming">("today");
  const { data: clients = [], isLoading: clientsLoading } = useSWR<Client[]>("/workspaces", fetcher);
  const { data: tasks = [], isLoading: tasksLoading } = useSWR<Task[]>("/tasks", fetcher);

  const loading = clientsLoading || tasksLoading;

  // Calculate real data for the summary card
  const now = new Date();
  const startOfThisWeek = startOfWeek(now);
  const startOfLastWeek = subWeeks(startOfThisWeek, 1);

  const countThisWeek = tasks.filter(t => new Date(t.scheduled_date) >= startOfThisWeek).length;
  const countLastWeek = tasks.filter(t => {
    const d = new Date(t.scheduled_date);
    return d >= startOfLastWeek && d < startOfThisWeek;
  }).length;

  const diff = countLastWeek === 0 ? (countThisWeek > 0 ? 100 : 0) : Math.round(((countThisWeek - countLastWeek) / countLastWeek) * 100);
  const isAhead = diff >= 0;

  const todayTasks = tasks.filter((t) => isToday(new Date(t.scheduled_date)));
  const tomorrowTasks = tasks.filter((t) => isTomorrow(new Date(t.scheduled_date)));
  const upcomingTasks = tasks
    .filter((t) => {
      const d = new Date(t.scheduled_date);
      const dayAfterTomorrow = startOfDay(addDays(new Date(), 2));
      return d >= dayAfterTomorrow;
    })
    .sort((a, b) => +new Date(a.scheduled_date) - +new Date(b.scheduled_date));

  const currentTabItems = activeTab === "today" ? todayTasks : activeTab === "tomorrow" ? tomorrowTasks : upcomingTasks;

  const recent = [...tasks].sort((a, b) => +new Date(b.scheduled_date) - +new Date(a.scheduled_date)).slice(0, 6);
  const clientName = (task: Task) => task.client_name || clients.find((c) => c._id === task.workspace_id)?.client_name || "—";

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-0 sm:px-4 lg:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
          <h1 className="mt-1 font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">
            Hello, <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">{user?.username}</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm sm:text-base text-muted-foreground">
            Here's a calm view of everything happening across your studio today.
          </p>
        </div>
      </div>

      {/* Up Next Section replacing Stats */}
      <div className="rounded-3xl border border-border bg-card p-1 shadow-soft overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-border p-6 bg-surface-2/30">
            <div className="mb-6">
              <h2 className="font-display text-2xl">Up Next</h2>
              <p className="text-xs text-muted-foreground">All clients · live overview</p>
            </div>
            
            <div className="flex flex-col gap-2">
              {[
                { id: "today", label: "Today", count: todayTasks.length, accent: "bg-info" },
                { id: "tomorrow", label: "Tomorrow", count: tomorrowTasks.length, accent: "bg-primary" },
                { id: "upcoming", label: "Upcoming", count: upcomingTasks.length, accent: "bg-accent" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 transition ${
                    activeTab === tab.id 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${tab.accent}`} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </div>
                  <span className="text-xs font-semibold opacity-60">{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-6 min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {loading ? (
                  [0, 1].map((i) => <Shimmer key={i} className="h-20 rounded-2xl" />)
                ) : currentTabItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted-foreground/40">
                      <CalendarIcon className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-muted-foreground">Nothing scheduled for {activeTab}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentTabItems.slice(0, 4).map((t, i) => (
                      <motion.div
                        key={t._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group flex flex-col justify-between rounded-2xl border border-border bg-surface-2/50 p-4 transition hover:border-primary/40 hover:bg-card"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-bold text-foreground uppercase tracking-tight">{clientName(t)}</div>
                            <div className="mt-0.5 truncate text-sm text-muted-foreground">{t.title}</div>
                          </div>
                          <StatusBadge status={t.status} />
                        </div>
                        <div className="mt-4 flex items-center justify-between text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                          <span className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-primary" />{t.post_type}</span>
                          <span>{format(new Date(t.scheduled_date), "MMM d")}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
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
            {loading ? (
              <Shimmer className="h-20 w-full" />
            ) : (
              <>
                You're {Math.abs(diff)}% {isAhead ? "ahead of" : "behind"} last week's pace.
              </>
            )}
          </h3>
          <p className="mt-3 text-sm opacity-80">
            {countThisWeek} tasks scheduled this week. {isAhead ? "Great job keeping the momentum!" : "Time to pick up the pace to hit your targets."}
          </p>
          <Link to="/work" className="mt-6 inline-block rounded-xl bg-primary-foreground/20 px-4 py-2 text-xs font-medium backdrop-blur transition hover:bg-primary-foreground/30">
            View week's queue
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
