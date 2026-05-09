import { Search, Moon, Sun, Menu, Command } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { SearchModal } from "@/components/common/SearchModal";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/work": "Work",
  "/clients": "Clients",
  "/overview": "Overview",
  "/reports": "Reports",
  "/settings": "Settings",
};

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, theme, toggleTheme } = useApp();
  const loc = useLocation();
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "PS";
  const pageTitle = Object.entries(PAGE_TITLES).find(([k]) => loc.pathname.startsWith(k))?.[1] ?? "Studio";
  const [searchOpen, setSearchOpen] = useState(false);

  // ⌘K / Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <header className="sticky top-0 z-30 px-4 pt-4 pb-0 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex h-14 items-center gap-4 rounded-2xl border border-border/60 bg-background/70 px-4 backdrop-blur-xl shadow-float"
        >
          {/* Mobile menu */}
          <button
            id="navbar-menu"
            onClick={onMenuClick}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:text-foreground md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Page title */}
          <div className="hidden md:block">
            <h2 className="font-display text-base text-foreground">{pageTitle}</h2>
          </div>

          {/* Search trigger */}
          <div className="flex-1 max-w-xs hidden sm:block">
            <button
              id="navbar-search"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-full items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-3 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 text-left text-xs">Search clients, tasks…</span>
              <kbd className="hidden items-center gap-0.5 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium sm:flex">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Mobile search icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:text-foreground sm:hidden"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Theme toggle */}
            <motion.button
              id="navbar-theme"
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.button>

            {/* User pill */}
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card py-1 pl-1 pr-3">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
              >
                {initials}
              </div>
              <div className="hidden text-xs sm:block">
                <div className="font-semibold text-foreground leading-tight">{user?.username}</div>
                <div className="text-muted-foreground capitalize leading-tight">{user?.role || "staff"}</div>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Spacer */}
        <div className="h-2" />
      </header>
    </>
  );
}
