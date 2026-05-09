import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutGrid, Users, CalendarRange, ChevronLeft, Sparkles,
  X, Activity, BarChart3, Settings, LogOut, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Task } from "@/types";
import { isToday } from "date-fns";

const items = [
  { to: "/dashboard",  label: "Dashboard", icon: LayoutGrid },
  { to: "/work",       label: "Work",      icon: CalendarRange },
  { to: "/clients",    label: "Clients",   icon: Users },
  { to: "/overview",   label: "Overview",  icon: Activity },
  { to: "/reports",    label: "Reports",   icon: BarChart3 },
  { to: "/settings",   label: "Settings",  icon: Settings },
];

export function Sidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen?: boolean;
  setMobileOpen?: (o: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useApp();
  const loc = useLocation();
  const { data: tasks = [] } = useSWR<Task[]>("/tasks", fetcher);
  const todayCount = tasks.filter((t) => isToday(new Date(t.scheduled_date))).length;

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "PS";
  const studioName = user?.studio_name || "Pratirang Studio";

  const isCollapsedMode = !mobileOpen && collapsed;

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* ── Logo ── */}
      <div className={cn("flex items-center justify-between px-4 py-5", isCollapsedMode && "px-3")}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              boxShadow: "0 4px 16px rgba(124,58,237,0.5)",
            }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          {!isCollapsedMode && (
            <div className="overflow-hidden">
              <div className="font-display text-lg leading-tight text-foreground">{studioName.split(" ")[0]}</div>
              {studioName.split(" ").length > 1 && (
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                  {studioName.split(" ").slice(1).join(" ")}
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => (mobileOpen ? setMobileOpen?.(false) : setCollapsed((c) => !c))}
          className="rounded-lg p-1 text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
        >
          {mobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-200", collapsed && "rotate-180")} />
          )}
        </button>
      </div>

      {/* ── Today badge (only expanded) ── */}
      {!isCollapsedMode && todayCount > 0 && (
        <div className="mx-3 mb-3">
          <div className="flex items-center justify-between rounded-xl px-3 py-2"
            style={{ background: "hsl(var(--primary)/0.1)", border: "1px solid hsl(var(--primary)/0.15)" }}>
            <span className="text-xs font-medium text-primary">Today's tasks</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ background: "hsl(var(--primary))" }}>
              {todayCount}
            </span>
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 space-y-0.5 px-3 py-1">
        {items.map((item) => {
          const active = loc.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={isCollapsedMode ? item.label : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isCollapsedMode && "justify-center px-0",
                active
                  ? "text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, hsl(263,82%,56%), hsl(263,90%,68%))",
                    boxShadow: "0 4px 16px hsl(263,82%,66%,0.4)",
                  }}
                  transition={{ type: "spring", damping: 26, stiffness: 300 }}
                />
              )}
              <item.icon className={cn("relative z-10 h-[18px] w-[18px] shrink-0", active && "text-white")} />
              {!isCollapsedMode && (
                <span className="relative z-10">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── User ── */}
      <div className={cn("m-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-3",
        isCollapsedMode && "flex justify-center p-2")}>
        {isCollapsedMode ? (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
          >
            {initials}
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-md"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                boxShadow: "0 4px 12px rgba(124,58,237,0.4)",
              }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{user?.username}</div>
              <div className="truncate text-xs text-muted-foreground capitalize">{user?.role || "staff"}</div>
            </div>
            <button
              onClick={logout}
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              aria-label="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen?.(false)}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-sidebar-border bg-sidebar md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 248 }}
        transition={{ type: "spring", damping: 26, stiffness: 240 }}
        className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex overflow-hidden"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
