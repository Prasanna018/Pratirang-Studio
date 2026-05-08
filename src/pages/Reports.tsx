import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Calendar as CalendarIcon, 
  Download, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  FilePieChart,
  ArrowUpRight,
  Filter
} from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Client, Task } from "@/types";
import { Shimmer } from "@/components/common/Skeleton";
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfQuarter, 
  endOfQuarter, 
  startOfYear, 
  endOfYear,
  isWithinInterval,
  format,
  eachDayOfInterval,
  subMonths
} from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie,
  AreaChart,
  Area
} from "recharts";
import { ExportMenu } from "@/components/common/ExportMenu";

type RangeType = "week" | "month" | "quarter" | "year" | "custom";

export default function Reports() {
  const [range, setRange] = useState<RangeType>("month");
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [customStart, setCustomStart] = useState(format(subMonths(new Date(), 1), "yyyy-MM-dd"));
  const [customEnd, setCustomEnd] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: clients = [], isLoading: clientsLoading } = useSWR<Client[]>("/workspaces", fetcher);
  const { data: tasks = [], isLoading: tasksLoading } = useSWR<Task[]>("/tasks", fetcher);

  const loading = clientsLoading || tasksLoading;

  const dateInterval = useMemo(() => {
    const now = new Date();
    switch (range) {
      case "week": return { start: startOfWeek(now), end: endOfWeek(now) };
      case "month": return { start: startOfMonth(now), end: endOfMonth(now) };
      case "quarter": return { start: startOfQuarter(now), end: endOfQuarter(now) };
      case "year": return { start: startOfYear(now), end: endOfYear(now) };
      case "custom": return { start: new Date(customStart), end: new Date(customEnd) };
      default: return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [range, customStart, customEnd]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const d = new Date(t.scheduled_date);
      const inDate = isWithinInterval(d, dateInterval);
      const matchesClient = selectedClientId === "all" || t.workspace_id === selectedClientId;
      return inDate && matchesClient;
    });
  }, [tasks, dateInterval, selectedClientId]);

  const selectedClientName = useMemo(() => {
    if (selectedClientId === "all") return "All_Clients";
    return clients.find(c => c._id === selectedClientId)?.client_name || "Client";
  }, [clients, selectedClientId]);

  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === "uploaded").length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    const postTypes = {
      reels: filteredTasks.filter(t => t.post_type === "reel").length,
      posts: filteredTasks.filter(t => t.post_type === "post").length
    };
    return { total, completed, rate, postTypes };
  }, [filteredTasks]);

  const chartData = useMemo(() => {
    // Group tasks by date for the area chart
    try {
      const days = eachDayOfInterval(dateInterval);
      return days.map(day => {
        const dayTasks = filteredTasks.filter(t => {
          const d = new Date(t.scheduled_date);
          return d.getDate() === day.getDate() && d.getMonth() === day.getMonth();
        });
        return {
          date: format(day, "MMM d"),
          count: dayTasks.length
        };
      });
    } catch {
      return [];
    }
  }, [filteredTasks, dateInterval]);

  const clientDistribution = useMemo(() => {
    return clients.map(c => ({
      name: c.client_name,
      value: filteredTasks.filter(t => t.workspace_id === c._id).length
    })).filter(c => c.value > 0);
  }, [clients, filteredTasks]);

  const COLORS = ['#8B5CF6', '#D946EF', '#0EA5E9', '#F59E0B', '#10B981'];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-0 sm:px-4 lg:px-0 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight">Studio Reports</h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Analyze your output and client growth over time.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/50 p-1.5">
            <select 
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-card text-foreground text-xs font-medium outline-none px-2 py-1 rounded-lg border border-border mr-2 transition hover:bg-surface-2 cursor-pointer"
            >
              <option value="all" className="bg-card text-foreground">All Clients</option>
              {clients.map(c => <option key={c._id} value={c._id} className="bg-card text-foreground">{c.client_name}</option>)}
            </select>
            {(["week", "month", "quarter", "year", "custom"] as RangeType[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-xl px-4 py-2 text-xs font-medium transition ${
                  range === r 
                    ? "bg-primary text-primary-foreground shadow-glow" 
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                {r === 'custom' ? 'Custom' : `${r.charAt(0).toUpperCase() + r.slice(1)}ly`}
              </button>
            ))}
          </div>

          {range === "custom" && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl border border-border bg-card/30 p-2"
            >
              <input 
                type="date" 
                value={customStart} 
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-transparent text-xs outline-none"
              />
              <span className="text-muted-foreground">→</span>
              <input 
                type="date" 
                value={customEnd} 
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-transparent text-xs outline-none"
              />
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Tasks", value: stats.total, icon: BarChart3, color: "text-primary" },
          { label: "Completion Rate", value: `${stats.rate}%`, icon: CheckCircle2, color: "text-success" },
          { label: "Reels Made", value: stats.postTypes.reels, icon: TrendingUp, color: "text-accent" },
          { label: "Active Clients", value: clientDistribution.length, icon: FilePieChart, color: "text-info" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-3xl border border-border bg-card p-5 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div className="flex items-center gap-1 text-[10px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="h-3 w-3" /> +12%
              </div>
            </div>
            <div className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-4xl font-display">
              {loading ? <Shimmer className="h-10 w-16" /> : s.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl">Output Timeline</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> Tasks</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <Shimmer className="h-full w-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '16px',
                      fontSize: '12px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-soft"
        >
          <h2 className="mb-6 font-display text-xl">Workload Distribution</h2>
          <div className="h-[300px] w-full">
            {loading ? (
              <Shimmer className="h-full w-full rounded-full" />
            ) : clientDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clientDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {clientDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '16px',
                      fontSize: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-center">
                <p className="text-sm text-muted-foreground italic">No data for this period</p>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {clientDistribution.slice(0, 3).map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground truncate max-w-[120px]">{c.name}</span>
                </div>
                <span className="font-medium">{Math.round((c.value / stats.total) * 100)}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border bg-card p-6 shadow-soft"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl">Detailed Breakdown</h2>
          </div>
          <ExportMenu 
            tasks={filteredTasks} 
            clients={clients} 
            filename={`${selectedClientName}_Report_${range}_${format(new Date(), "yyyy-MM-dd")}`}
            title={`${selectedClientName}_Report_${range}_${format(new Date(), "yyyy-MM-dd")}`} 
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-4 font-medium text-muted-foreground">Client Workspace</th>
                <th className="pb-4 font-medium text-muted-foreground">Tasks</th>
                <th className="pb-4 font-medium text-muted-foreground">Completion</th>
                <th className="pb-4 font-medium text-muted-foreground">Top Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map(client => {
                const cTasks = filteredTasks.filter(t => t.workspace_id === client._id);
                if (cTasks.length === 0) return null;
                const completed = cTasks.filter(t => t.status === "uploaded").length;
                const percent = Math.round((completed / cTasks.length) * 100);
                const reels = cTasks.filter(t => t.post_type === "reel").length;
                return (
                  <tr key={client._id} className="group transition hover:bg-surface-2">
                    <td className="py-4 font-medium">{client.client_name}</td>
                    <td className="py-4">{cTasks.length}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
                          <div className="h-full bg-success" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{percent}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase tracking-wider">
                        {reels >= (cTasks.length / 2) ? "Reel Focus" : "Post Focus"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
