import { useEffect, useRef, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Folder, CalendarCheck, ArrowUpRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Client, Task } from "@/types";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: clients = [] } = useSWR<Client[]>("/workspaces", fetcher);
  const { data: tasks = [] } = useSWR<Task[]>("/tasks", fetcher);

  // Build unified result list
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const clientHits = clients
      .filter((c) => c.client_name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
      .slice(0, 4)
      .map((c) => ({
        id: c._id,
        label: c.client_name,
        sub: c.description || "Workspace",
        icon: "client" as const,
        href: `/clients/${c._id}`,
      }));

    const taskHits = tasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.client_name || "").toLowerCase().includes(q) ||
          t.post_type?.toLowerCase().includes(q)
      )
      .slice(0, 6)
      .map((t) => ({
        id: t._id,
        label: t.title,
        sub: `${t.client_name || "Unknown client"} · ${t.post_type}`,
        icon: "task" as const,
        href: `/work`,
      }));

    return [...clientHits, ...taskHits];
  }, [query, clients, tasks]);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, results.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && results[activeIdx]) {
        navigate(results[activeIdx].href);
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, results, activeIdx, navigate, onClose]);

  // Reset active index when results change
  useEffect(() => { setActiveIdx(0); }, [results.length]);

  const go = (href: string) => { navigate(href); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            className="fixed left-1/2 top-24 z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-elevated"
          >
            {/* Search input row */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={inputRef}
                id="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search clients, tasks, post types…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="rounded-lg p-0.5 text-muted-foreground transition hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <kbd
                className="hidden items-center gap-0.5 rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:flex"
                onClick={onClose}
              >
                Esc
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto py-2">
              {!query ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">Start typing to search across clients and tasks</p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <p className="text-sm text-muted-foreground">No results for <span className="font-semibold text-foreground">"{query}"</span></p>
                  <p className="text-xs text-muted-foreground">Try a different keyword</p>
                </div>
              ) : (
                <>
                  {/* Group: Clients */}
                  {results.filter((r) => r.icon === "client").length > 0 && (
                    <div>
                      <div className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Clients
                      </div>
                      {results
                        .filter((r) => r.icon === "client")
                        .map((r, i) => {
                          const globalIdx = i;
                          return (
                            <ResultRow
                              key={r.id}
                              result={r}
                              active={activeIdx === globalIdx}
                              onHover={() => setActiveIdx(globalIdx)}
                              onClick={() => go(r.href)}
                            />
                          );
                        })}
                    </div>
                  )}

                  {/* Group: Tasks */}
                  {results.filter((r) => r.icon === "task").length > 0 && (
                    <div>
                      <div className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Tasks
                      </div>
                      {results
                        .filter((r) => r.icon === "task")
                        .map((r, i) => {
                          const clientCount = results.filter((r2) => r2.icon === "client").length;
                          const globalIdx = clientCount + i;
                          return (
                            <ResultRow
                              key={r.id}
                              result={r}
                              active={activeIdx === globalIdx}
                              onHover={() => setActiveIdx(globalIdx)}
                              onClick={() => go(r.href)}
                            />
                          );
                        })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer hint */}
            {results.length > 0 && (
              <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5">↵</kbd> Open</span>
                <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5">Esc</kbd> Close</span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

type ResultItem = { id: string; label: string; sub: string; icon: "client" | "task"; href: string };

function ResultRow({
  result,
  active,
  onHover,
  onClick,
}: {
  result: ResultItem;
  active: boolean;
  onHover: () => void;
  onClick: () => void;
}) {
  return (
    <button
      onMouseEnter={onHover}
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
        active ? "bg-primary/10" : "hover:bg-surface-2"
      }`}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: result.icon === "client"
            ? "linear-gradient(135deg, #7c3aed, #a855f7)"
            : "hsl(var(--surface-3))",
        }}
      >
        {result.icon === "client" ? (
          <Folder className="h-4 w-4 text-white" />
        ) : (
          <CalendarCheck className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{result.label}</div>
        <div className="truncate text-xs text-muted-foreground">{result.sub}</div>
      </div>
      {active && <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-primary" />}
    </button>
  );
}
