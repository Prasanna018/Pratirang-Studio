import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User } from "@/types";
import { apiRequest } from "@/lib/api";

interface AppContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  login: () => Promise<void>;
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
    try {
      const data = await apiRequest("/auth/me");
      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async () => {
    setIsLoadingUser(true);
    await fetchMe();
  }, [fetchMe]);

  const logout = useCallback(async () => {
    setUser(null);
    try {
      await apiRequest("/auth/logout", "POST");
    } catch (err) {
      console.error("Logout failed", err);
    }
    // Also clear tokens from localStorage if they still exist there
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
