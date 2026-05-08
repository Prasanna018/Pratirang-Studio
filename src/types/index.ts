export type TaskStatus = "pending" | "scheduled" | "uploaded";
export type PostType = "post" | "reel";

export interface Task {
  _id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  scheduled_date: string; // ISO
  post_type: PostType;
  status: TaskStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  client_name?: string; // Virtual field for global view
}

export interface Client {
  _id: string;
  user_id: string;
  client_name: string;
  description?: string;
  created_at: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
}
