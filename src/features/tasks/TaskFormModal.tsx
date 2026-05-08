import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { PostType, Task, TaskStatus, Client } from "@/types";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { useSWRConfig } from "swr";

export function TaskFormModal({
  open,
  onClose,
  clientId,
  task,
  clients = []
}: {
  open: boolean;
  onClose: () => void;
  clientId?: string;
  task?: Task | null;
  clients?: Client[];
}) {
  const { mutate } = useSWRConfig();
  const [title, setTitle] = useState("");
  const [postType, setPostType] = useState<PostType>("post");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [scheduledDate, setScheduledDate] = useState("");
  const [selectedClient, setSelectedClient] = useState(clientId ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setPostType(task.post_type);
      setStatus(task.status);
      setScheduledDate(task.scheduled_date.split("T")[0]);
      setSelectedClient(task.workspace_id);
    } else {
      setTitle("");
      setPostType("post");
      setStatus("pending");
      setScheduledDate(new Date().toISOString().split("T")[0]);
      setSelectedClient(clientId ?? (clients.length > 0 ? clients[0]._id : ""));
    }
  }, [task, open, clientId, clients]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedClient) return;
    
    setLoading(true);
    const payload = {
      title: title.trim(),
      post_type: postType,
      status,
      scheduled_date: scheduledDate, // Backend should handle date string
      workspace_id: selectedClient,
    };

    try {
      if (task) {
        await apiRequest(`/tasks/${task._id}`, "PUT", payload);
        toast.success("Task updated");
      } else {
        await apiRequest("/tasks", "POST", payload);
        toast.success("Task created");
      }
      await mutate("/tasks", undefined, { revalidate: true });
      if (clientId) {
        await mutate(`/tasks?workspace_id=${clientId}`, undefined, { revalidate: true });
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={task ? "Edit task" : "New task"} size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Spring launch reel"
            className="h-11 w-full rounded-xl border border-border bg-surface-2 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {!clientId && (
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-medium">Client</label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="" disabled>Select client</option>
                {clients.map((c) => <option key={c._id} value={c._id}>{c.client_name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium">Post type</label>
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
              className="h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="post">Post</option>
              <option value="reel">Reel</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="uploaded">Uploaded</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium">Scheduled date</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface-2 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-border bg-card px-5 text-sm font-medium transition hover:bg-muted">
            Cancel
          </button>
          <button disabled={loading} className="h-11 rounded-xl gradient-primary px-5 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-50">
            {loading ? "Saving..." : task ? "Save changes" : "Create task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
