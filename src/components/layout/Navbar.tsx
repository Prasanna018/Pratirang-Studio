import { Search, Moon, Sun, Bell, LogOut, Menu } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout, theme, toggleTheme } = useApp();
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-xl">
      <button
        onClick={onMenuClick}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="relative max-w-sm flex-1 hidden xs:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search clients, tasks, ideas…"
          className="h-10 w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.button>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
        </button>
        <div className="ml-2 flex items-center gap-3 rounded-xl border border-border bg-card py-1 pl-1 pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-xs font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="hidden text-xs sm:block">
            <div className="font-medium">{user?.username}</div>
            <div className="text-muted-foreground">Workspace</div>
          </div>
          <button
            onClick={logout}
            className="ml-1 rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Logout"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
