import { Client, Task } from "@/types";

const today = new Date();
const iso = (daysOffset: number, hour = 10) => {
  const d = new Date(today);
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const mockClients: Client[] = [
  { id: "c1", name: "Northwind Coffee", handle: "@northwind", color: "24 90% 55%", industry: "F&B", createdAt: iso(-30) },
  { id: "c2", name: "Lumen Studio", handle: "@lumen", color: "256 90% 65%", industry: "Design", createdAt: iso(-60) },
  { id: "c3", name: "Atlas Athletics", handle: "@atlas", color: "168 76% 42%", industry: "Fitness", createdAt: iso(-14) },
  { id: "c4", name: "Verda Botanics", handle: "@verda", color: "140 60% 45%", industry: "Wellness", createdAt: iso(-7) },
  { id: "c5", name: "Nova Finance", handle: "@nova", color: "217 90% 58%", industry: "Fintech", createdAt: iso(-90) },
  { id: "c6", name: "Halcyon Hotels", handle: "@halcyon", color: "340 75% 60%", industry: "Hospitality", createdAt: iso(-45) },
];

export const mockTasks: Task[] = [
  { id: "t1", clientId: "c1", title: "Morning brew launch reel", postType: "reel", scheduledAt: iso(0, 9), status: "scheduled" },
  { id: "t2", clientId: "c1", title: "Barista spotlight carousel", postType: "carousel", scheduledAt: iso(2, 14), status: "pending" },
  { id: "t3", clientId: "c2", title: "Behind the scenes story", postType: "story", scheduledAt: iso(0, 18), status: "uploaded" },
  { id: "t4", clientId: "c2", title: "New brand identity reveal", postType: "post", scheduledAt: iso(1, 11), status: "scheduled" },
  { id: "t5", clientId: "c3", title: "Marathon prep tips", postType: "reel", scheduledAt: iso(1, 7), status: "scheduled" },
  { id: "t6", clientId: "c3", title: "Athlete of the week", postType: "post", scheduledAt: iso(3, 12), status: "pending" },
  { id: "t7", clientId: "c4", title: "Plant care guide", postType: "carousel", scheduledAt: iso(0, 16), status: "scheduled" },
  { id: "t8", clientId: "c5", title: "Q2 market recap", postType: "post", scheduledAt: iso(4, 10), status: "pending" },
  { id: "t9", clientId: "c6", title: "Suite tour reel", postType: "reel", scheduledAt: iso(2, 15), status: "scheduled" },
  { id: "t10", clientId: "c6", title: "Sunset terrace post", postType: "post", scheduledAt: iso(5, 19), status: "pending" },
  { id: "t11", clientId: "c1", title: "Weekend specials", postType: "story", scheduledAt: iso(-1, 9), status: "uploaded" },
  { id: "t12", clientId: "c2", title: "Client testimonial", postType: "post", scheduledAt: iso(7, 13), status: "pending" },
];
