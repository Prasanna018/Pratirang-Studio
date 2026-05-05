import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { PostType, Task, TaskStatus } from "@/types";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export function TaskFormModal({
  open,
  onClose,
  clientId,
  task,
}: {
  open: boolean;
  onClose: () => void;
  clientId?: string;
  task?: Task | null;
}) {
  const { addTask, updateTask, clients } = useApp();
  const [title, setTitle] = useState("");
  const [postType, setPostType] = useState<PostType>("post");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [scheduledAt, setScheduledAt] = useState("");
  const [selectedClient, setSelectedClient] = useState(clientId ?? "");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setPostType(task.postType);
      setStatus(task.status);
      setScheduledAt(task.scheduledAt.slice(0, 16));
      setSelectedClient(task.clientId);
    } else {
      setTitle("");
      setPostType("post");
      setStatus("pending");
      setScheduledAt(new Date().toISOString().slice(0, 16));
      setSelectedClient(clientId ?? clients[0]?.id ?? "");
    }
  }, [task, open, clientId, clients]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedClient) return;
    const payload = {
      title: title.trim(),
      postType,
      status,
      scheduledAt: new Date(scheduledAt).toISOString(),
      clientId: selectedClient,
    };
    if (task) {
      updateTask(task.id, payload);
      toast.success("Task updated");
    } else {
      addTask(payload);
      toast.success("Task created");
    }
    onClose();
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
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
              <option value="story">Story</option>
              <option value="carousel">Carousel</option>
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
          <div className="col-span-2">
            <label className="mb-1.5 block text-xs font-medium">Scheduled at</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface-2 px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-11 rounded-xl border border-border bg-card px-5 text-sm font-medium transition hover:bg-muted">
            Cancel
          </button>
          <button className="h-11 rounded-xl gradient-primary px-5 text-sm font-medium text-primary-foreground shadow-glow">
            {task ? "Save changes" : "Create task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
