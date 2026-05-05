import { useApp } from "@/context/AppContext";
import { isToday, isTomorrow, isAfter, startOfDay, addDays, format } from "date-fns";
import { motion } from "framer-motion";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Shimmer } from "@/components/common/Skeleton";

export function RightSidebar() {
  const { tasks, clients, loading } = useApp();

  const today = tasks.filter((t) => isToday(new Date(t.scheduledAt)));
  const tomorrow = tasks.filter((t) => isTomorrow(new Date(t.scheduledAt)));
  const upcoming = tasks
    .filter((t) => isAfter(new Date(t.scheduledAt), startOfDay(addDays(new Date(), 1))) && !isTomorrow(new Date(t.scheduledAt)))
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? "—";

  const Section = ({ title, items, accent }: { title: string; items: typeof tasks; accent: string }) => (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${accent}`} />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        </div>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div className="space-y-2">
        {loading ? (
          [0, 1].map((i) => <Shimmer key={i} className="h-16 rounded-2xl" />)
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
            Nothing scheduled
          </div>
        ) : (
          items.slice(0, 5).map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-soft"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{t.title}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">{clientName(t.clientId)}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="capitalize">{t.postType}</span>
                <span>{format(new Date(t.scheduledAt), "MMM d • HH:mm")}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <aside className="scrollbar-thin sticky top-16 hidden h-[calc(100vh-4rem)] w-80 shrink-0 overflow-y-auto border-l border-border bg-surface-2/40 px-5 py-6 xl:block">
      <div className="mb-6">
        <h2 className="font-display text-2xl">Up Next</h2>
        <p className="text-xs text-muted-foreground">All clients · live overview</p>
      </div>
      <div className="space-y-7">
        <Section title="Today" items={today} accent="bg-info" />
        <Section title="Tomorrow" items={tomorrow} accent="bg-primary" />
        <Section title="Upcoming" items={upcoming} accent="bg-accent" />
      </div>
    </aside>
  );
}
