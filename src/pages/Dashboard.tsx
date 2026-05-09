import { useApp } from "@/context/AppContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, CalendarCheck, Sparkles, ArrowUpRight, Calendar as CalendarIcon, TrendingUp, TrendingDown } from "lucide-react";
import { format, isToday, isTomorrow, startOfDay, addDays, subWeeks, startOfWeek } from "date-fns";
import { Shimmer } from "@/components/common/Skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Client, Task } from "@/types";
import { useState } from "react";

const HERO_IMG = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80";

export default function Dashboard() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow" | "upcoming">("today");
  const { data: clients = [], isLoading: clientsLoading } = useSWR<Client[]>("/workspaces", fetcher);
  const { data: tasks = [], isLoading: tasksLoading } = useSWR<Task[]>("/tasks", fetcher);
  const loading = clientsLoading || tasksLoading;

  const now = new Date();
  const startOfThisWeek = startOfWeek(now);
  const startOfLastWeek = subWeeks(startOfThisWeek, 1);
  const countThisWeek = tasks.filter((t) => new Date(t.scheduled_date) >= startOfThisWeek).length;
  const countLastWeek = tasks.filter((t) => {
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
      const dayAfterTomorrow = startOfDay(addDays(now, 2));
      return d >= dayAfterTomorrow && d < addDays(dayAfterTomorrow, 5);
    })
    .sort((a, b) => +new Date(a.scheduled_date) - +new Date(b.scheduled_date));

  const tabItems = activeTab === "today" ? todayTasks : activeTab === "tomorrow" ? tomorrowTasks : upcomingTasks;
  const recent = [...tasks].sort((a, b) => +new Date(b.scheduled_date) - +new Date(a.scheduled_date)).slice(0, 6);
  const clientName = (t: Task) => t.client_name || clients.find((c) => c._id === t.workspace_id)?.client_name || "—";

  const tabs = [
    { id: "today" as const, label: "Today", count: todayTasks.length, color: "#60a5fa" },
    { id: "tomorrow" as const, label: "Tomorrow", count: tomorrowTasks.length, color: "hsl(var(--primary))" },
    { id: "upcoming" as const, label: "Upcoming", count: upcomingTasks.length, color: "hsl(var(--accent))" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* ── Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl"
        style={{ minHeight: 200 }}
      >
        <img
          src={HERO_IMG}
          alt="Studio"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(120deg, rgba(10,5,30,0.82) 40%, rgba(60,20,120,0.55) 100%)" }}
        />
        <div className="relative z-10 flex flex-col justify-between p-8 md:flex-row md:items-end" style={{ minHeight: 200 }}>
          <div>
            <p className="text-sm font-medium text-white/50">{format(now, "EEEE, MMMM d")}</p>
            <h1 className="mt-1 font-display text-3xl text-white sm:text-4xl lg:text-5xl">
              Hello,{" "}
              <span style={{
                background: "linear-gradient(135deg, #a78bfa, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {user?.username}
              </span>{" "}
              👋
            </h1>
            <p className="mt-2 max-w-md text-sm text-white/50">
              Here's a calm view of everything happening across your studio today.
            </p>
          </div>
          <div className="mt-6 flex gap-4 md:mt-0">
            {[
              { icon: Users, label: "Clients", value: loading ? "…" : clients.length },
              { icon: CalendarCheck, label: "Today", value: loading ? "…" : todayTasks.length },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/8 px-5 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <Icon className="h-3.5 w-3.5" />{label}
                </div>
                <div className="mt-1 font-display text-2xl font-bold text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Bento Row 2 ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Up Next — 2/3 width */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft lg:col-span-2"
        >
          <div className="flex flex-col sm:flex-row">
            {/* Tab rail */}
            <div className="w-full border-b border-border bg-surface-2/40 p-5 sm:w-52 sm:border-b-0 sm:border-r">
              <h2 className="font-display text-xl text-foreground">Up Next</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">All clients · live</p>
              <div className="mt-4 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition ${
                      activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: tab.color }} />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </div>
                    <span className="text-xs font-bold opacity-60">{tab.count}</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Tab content */}
            <div className="flex-1 p-5" style={{ minHeight: 240 }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-3"
                >
                  {loading ? (
                    [0, 1].map((i) => <Shimmer key={i} className="h-20 rounded-2xl" />)
                  ) : tabItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-muted-foreground/40">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                      <p className="text-sm text-muted-foreground">Nothing for {activeTab}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {tabItems.slice(0, 4).map((t, i) => (
                        <motion.div
                          key={t._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group flex flex-col justify-between rounded-2xl border border-border bg-surface-2/50 p-4 transition hover:border-primary/30 hover:bg-card hover:-translate-y-0.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate text-xs font-bold uppercase tracking-wide text-foreground">{clientName(t)}</div>
                              <div className="mt-0.5 truncate text-sm text-muted-foreground">{t.title}</div>
                            </div>
                            <StatusBadge status={t.status} />
                          </div>
                          <div className="mt-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {t.post_type}
                            </span>
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
        </motion.div>

        {/* Weekly Pace — 1/3 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft"
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full opacity-20 blur-3xl"
            style={{ background: isAhead ? "hsl(var(--primary))" : "hsl(var(--destructive))" }} />
          <div className="relative">
            <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">This week</div>
            {loading ? (
              <Shimmer className="mt-2 h-24 w-full rounded-xl" />
            ) : (
              <>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-5xl" style={{ color: isAhead ? "hsl(var(--primary))" : "hsl(var(--destructive))" }}>
                    {Math.abs(diff)}%
                  </span>
                  {isAhead ? (
                    <TrendingUp className="h-5 w-5 text-success" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {isAhead ? "ahead of" : "behind"} last week's pace
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {countThisWeek} tasks scheduled this week.
                </p>
              </>
            )}
            <Link
              to="/work"
              className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-primary transition hover:gap-2"
            >
              View queue <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 rounded-b-3xl"
            style={{ background: "linear-gradient(to top, hsl(var(--card)), transparent)" }} />
        </motion.div>
      </div>

      {/* ── Recent Activity ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl border border-border bg-card p-6 shadow-soft"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">Recent activity</h2>
          <Link to="/work" className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground">
            View all <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="space-y-1">
          {loading
            ? [0, 1, 2, 3].map((i) => <Shimmer key={i} className="h-14 rounded-2xl" />)
            : recent.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No recent tasks.</div>
            )
            : recent.map((t, i) => (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 transition hover:border-border hover:bg-surface-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
                  >
                    {clientName(t).slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-foreground">{t.title}</div>
                    <div className="text-xs text-muted-foreground">{clientName(t)} · {t.post_type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {format(new Date(t.scheduled_date), "MMM d, yyyy")}
                  </span>
                  <StatusBadge status={t.status} />
                </div>
              </motion.div>
            ))}
        </div>
      </motion.div>
    </div>
  );
}
