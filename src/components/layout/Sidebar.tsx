import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, Users, CalendarRange, ChevronLeft, Sparkles, X, Activity, BarChart3, Settings } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/work", label: "Work", icon: CalendarRange },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/overview", label: "Overview", icon: Activity },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean; setMobileOpen?: (o: boolean) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const loc = useLocation();

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {(mobileOpen || !collapsed) && (
            <div className="flex flex-col">
              <span className="font-display text-xl leading-none">Pratirang</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Studio</span>
            </div>
          )}
        </div>
        <button
          onClick={() => (mobileOpen ? setMobileOpen?.(false) : setCollapsed((c) => !c))}
          className="rounded-lg p-1 text-muted-foreground transition hover:bg-sidebar-accent hover:text-foreground"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = loc.pathname.startsWith(item.to);
          const isCollapsed = !mobileOpen && collapsed;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                  transition={{ type: "spring", damping: 24, stiffness: 280 }}
                />
              )}
              <item.icon className="relative z-10 h-[18px] w-[18px] shrink-0" />
              {!isCollapsed && <span className="relative z-10">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {(mobileOpen || !collapsed) && (
        <div className="m-3 rounded-2xl border border-sidebar-border bg-gradient-to-br from-primary/10 to-accent/10 p-4">
          <div className="text-xs font-semibold text-foreground">Pro tip</div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Press <kbd className="rounded bg-card px-1.5 py-0.5 text-[10px]">N</kbd> to create a task anywhere.
          </p>
        </div>
      )}
    </>
  );

  return (
    <>
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
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-sidebar-border bg-sidebar md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 76 : 248 }}
        transition={{ type: "spring", damping: 24, stiffness: 220 }}
        className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex"
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
