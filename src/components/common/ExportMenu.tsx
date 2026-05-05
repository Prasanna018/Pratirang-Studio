import { FileSpreadsheet, FileText, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Task, Client } from "@/types";
import { exportTasksToExcel, exportTasksToPDF } from "@/lib/exportReport";
import { toast } from "sonner";

interface Props {
  tasks: Task[];
  clients: Client[];
  filename: string;
  title: string;
  disabled?: boolean;
}

export function ExportMenu({ tasks, clients, filename, title, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handle = (kind: "excel" | "pdf") => {
    if (!tasks.length) {
      toast.error("Nothing to export");
      return;
    }
    try {
      if (kind === "excel") exportTasksToExcel(tasks, clients, filename, title);
      else exportTasksToPDF(tasks, clients, filename, title);
      toast.success(`${kind === "excel" ? "Excel" : "PDF"} exported`);
    } catch {
      toast.error("Export failed");
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground shadow-soft transition hover:bg-surface-2 disabled:opacity-50"
      >
        <Download className="h-4 w-4" /> Export
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-popover shadow-elevated"
          >
            <button
              onClick={() => handle("excel")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-surface-2"
            >
              <FileSpreadsheet className="h-4 w-4 text-success" />
              <div>
                <div className="font-medium">Excel (.xlsx)</div>
                <div className="text-[11px] text-muted-foreground">Spreadsheet report</div>
              </div>
            </button>
            <div className="h-px bg-border" />
            <button
              onClick={() => handle("pdf")}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-surface-2"
            >
              <FileText className="h-4 w-4 text-destructive" />
              <div>
                <div className="font-medium">PDF (.pdf)</div>
                <div className="text-[11px] text-muted-foreground">Printable report</div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
