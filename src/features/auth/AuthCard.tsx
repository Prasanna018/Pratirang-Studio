import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Sparkles, Lock, User, Mail } from "lucide-react";
import { toast } from "sonner";
import { apiRequest, API_URL } from "@/lib/api";

export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const isLogin = mode === "login";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || password.length < 4 || (!isLogin && !email.trim())) {
      toast.error("Please fill in all fields correctly.");
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        // Login uses OAuth2 form data style
        const formData = new URLSearchParams();
        formData.append('username', username.trim()); // In our API, username can be email or username
        formData.append('password', password);

        const response = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Login failed");
        }

        const data = await response.json();
        await login(data.access_token, data.refresh_token);
        toast.success("Welcome back");
      } else {
        // Register
        await apiRequest("/auth/register", "POST", {
          username: username.trim(),
          email: email.trim(),
          password: password,
        });
        
        // Auto-login after register
        const formData = new URLSearchParams();
        formData.append('username', username.trim());
        formData.append('password', password);
        
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });
        const loginData = await loginRes.json();
        await login(loginData.access_token, loginData.refresh_token);
        toast.success("Account created successfully");
      }
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden gradient-aurora p-4">
      <div className="absolute inset-0 -z-10 bg-background" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 220 }}
        className="w-full max-w-md rounded-3xl border border-border bg-card/80 p-8 shadow-elevated backdrop-blur-xl"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl">{isLogin ? "Welcome back" : "Create account"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isLogin ? "Sign in to ClientFlow" : "Start managing clients in seconds"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Username or Email</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="jane.doe"
                className="h-11 w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </motion.div>

          {!isLogin && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
              <label className="mb-1.5 block text-xs font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="jane@example.com"
                  className="h-11 w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </motion.div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="mt-2 flex h-11 w-full items-center justify-center rounded-xl gradient-primary font-medium text-primary-foreground shadow-glow transition disabled:opacity-60"
          >
            {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          {isLogin ? "New here? " : "Already have an account? "}
          <Link to={isLogin ? "/register" : "/login"} className="font-medium text-primary hover:underline">
            {isLogin ? "Create an account" : "Sign in"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
