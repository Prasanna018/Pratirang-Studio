import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User } from "@/types";
import { apiRequest } from "@/lib/api";

interface AppContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (token: string, refresh: string) => Promise<void>;
  logout: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  isLoadingUser: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("clientflow_theme") as "light" | "dark" | null;
    if (stored) return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("clientflow_theme", theme);
  }, [theme]);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("clientflow_token");
    if (!token) {
      setIsLoadingUser(false);
      return;
    }
    try {
      const data = await apiRequest("/auth/me");
      setUser(data);
    } catch (err) {
      console.error("Failed to fetch user", err);
      localStorage.removeItem("clientflow_token");
      localStorage.removeItem("clientflow_refresh");
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (token: string, refresh: string) => {
    localStorage.setItem("clientflow_token", token);
    localStorage.setItem("clientflow_refresh", refresh);
    await fetchMe();
  }, [fetchMe]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("clientflow_token");
    localStorage.removeItem("clientflow_refresh");
  }, []);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  return (
    <AppContext.Provider
      value={{ 
        user, 
        setUser,
        login, 
        logout, 
        theme, 
        toggleTheme, 
        isLoadingUser 
      }}
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
