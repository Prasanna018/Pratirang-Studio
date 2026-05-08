import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { Task, Client } from "@/types";

export interface ExportRow {
  task: Task;
  clientName: string;
}

function buildRows(tasks: Task[], clients: Client[]): ExportRow[] {
  return tasks
    .slice()
    .sort((a, b) => +new Date(a.scheduled_date) - +new Date(b.scheduled_date))
    .map((t) => ({
      task: t,
      clientName: t.client_name || clients.find((c) => c._id === t.workspace_id)?.client_name || "—",
    }));
}

export function exportTasksToExcel(
  tasks: Task[],
  clients: Client[],
  filename: string,
  title: string
) {
  const rows = buildRows(tasks, clients);
  const data = [
    [title],
    [`Generated: ${format(new Date(), "PPP")}`],
    [`Total tasks: ${rows.length}`],
    [],
    ["Date", "Title", "Client", "Type", "Status"],
    ...rows.map(({ task, clientName }) => [
      format(new Date(task.scheduled_date), "yyyy-MM-dd"),
      task.title,
      clientName,
      task.post_type,
      task.status,
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [{ wch: 18 }, { wch: 36 }, { wch: 22 }, { wch: 12 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportTasksToPDF(
  tasks: Task[],
  clients: Client[],
  filename: string,
  title: string
) {
  const rows = buildRows(tasks, clients);
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(18);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Generated: ${format(new Date(), "PPP")}`, 14, 25);
  doc.text(`Total tasks: ${rows.length}`, 14, 31);

  autoTable(doc, {
    startY: 38,
    head: [["Date", "Title", "Client", "Type", "Status"]],
    body: rows.map(({ task, clientName }) => [
      format(new Date(task.scheduled_date), "MMM d, yyyy"),
      task.title,
      clientName,
      task.post_type,
      task.status,
    ]),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 250] },
  });

  doc.save(`${filename}.pdf`);
}
