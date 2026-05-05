export type TaskStatus = "pending" | "scheduled" | "uploaded";
export type PostType = "post" | "reel" | "story" | "carousel";

export interface Task {
  id: string;
  clientId: string;
  title: string;
  postType: PostType;
  scheduledAt: string; // ISO
  status: TaskStatus;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  handle: string;
  color: string; // hsl token suffix or raw hsl
  industry: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
}
