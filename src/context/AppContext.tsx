import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Client, Task, User } from "@/types";
import { mockClients, mockTasks } from "@/lib/mockData";

interface AppContextValue {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;

  clients: Client[];
  tasks: Task[];
  loading: boolean;

  addClient: (data: Omit<Client, "id" | "createdAt">) => Client;
  addTask: (data: Omit<Task, "id">) => Task;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("orbit_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("orbit_theme") as "light" | "dark" | null;
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("orbit_theme", theme);
  }, [theme]);

  // simulate fetch
  useEffect(() => {
    const t = setTimeout(() => {
      setClients(mockClients);
      setTasks(mockTasks);
      setLoading(false);
    }, 700);
    return () => clearTimeout(t);
  }, []);

  const login = useCallback((username: string) => {
    const u = { id: crypto.randomUUID(), username };
    setUser(u);
    localStorage.setItem("orbit_user", JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("orbit_user");
  }, []);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const addClient = useCallback((data: Omit<Client, "id" | "createdAt">) => {
    const c: Client = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setClients((prev) => [c, ...prev]);
    return c;
  }, []);

  const addTask = useCallback((data: Omit<Task, "id">) => {
    const t: Task = { ...data, id: crypto.randomUUID() };
    setTasks((prev) => [t, ...prev]);
    return t;
  }, []);

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{ user, login, logout, theme, toggleTheme, clients, tasks, loading, addClient, addTask, updateTask, deleteTask }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
