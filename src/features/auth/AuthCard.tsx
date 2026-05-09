import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { Lock, User, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { apiRequest, API_URL } from "@/lib/api";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80";

const QUOTES = [
  { text: "Great work is born from great collaboration.", author: "Studio Philosophy" },
  { text: "Every creative project is a story waiting to be told.", author: "Studio Philosophy" },
  { text: "We don't just manage content — we craft narratives.", author: "Studio Philosophy" },
];

export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();
  const quote = QUOTES[Math.floor(Date.now() / 30000) % QUOTES.length];

  // 3D tilt effect
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

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
        const formData = new URLSearchParams();
        formData.append("username", username.trim());
        formData.append("password", password);
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
          credentials: "include",
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Login failed");
        }
        await login();
        toast.success("Welcome back ✨");
      } else {
        await apiRequest("/auth/register", "POST", {
          username: username.trim(),
          email: email.trim(),
          password,
        });
        const formData = new URLSearchParams();
        formData.append("username", username.trim());
        formData.append("password", password);
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
          credentials: "include",
        });
        if (!loginRes.ok) throw new Error("Auto-login after register failed");
        await login();
        toast.success("Account created ✨");
      }
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "hsl(250,38%,7%)" }}>
      {/* ── Left Panel: Hero Image ── */}
      <div className="relative hidden lg:flex lg:w-[56%] flex-col overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Creative workspace"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(10,5,30,0.85) 0%, rgba(60,20,120,0.55) 60%, rgba(109,40,217,0.25) 100%)" }}
        />
        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 8px 24px rgba(124,58,237,0.5)" }}>
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display text-2xl text-white">Pratirang</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">Studio</div>
            </div>
          </div>

          {/* Hero copy */}
          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                Studio management, reimagined
              </div>
              <h1 className="font-display text-5xl leading-[1.1] text-white xl:text-6xl">
                Where creative<br />
                <span style={{
                  background: "linear-gradient(135deg, #f59e0b, #f97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  work flows.
                </span>
              </h1>
              <p className="mt-6 text-base leading-relaxed text-white/50">"{quote.text}"</p>
              <p className="mt-2 text-sm text-white/30">— {quote.author}</p>
            </motion.div>
          </div>

          {/* Bottom stats */}
          <div className="flex flex-wrap gap-3">
            {[
              { value: "100+", label: "Clients" },
              { value: "10k+", label: "Tasks done" },
              { value: "99%", label: "On-time" },
            ].map((s) => (
              <div key={s.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
                <div className="font-display text-2xl text-white">{s.value}</div>
                <div className="text-xs text-white/40">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex flex-1 items-center justify-center p-6 lg:p-12 perspective-1000"
      >
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 22, stiffness: 200 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-xl text-white">Pratirang Studio</span>
          </div>

          {/* Card */}
          <div className="rounded-3xl border p-8"
            style={{
              background: "hsl(250,32%,11%)",
              borderColor: "hsl(250,24%,20%)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)",
            }}>
            {/* Header */}
            <div className="mb-8">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: "hsl(263,82%,66%,0.15)", color: "hsl(263,82%,75%)" }}>
                <Sparkles className="h-3 w-3" />
                {isLogin ? "Welcome back" : "Get started"}
              </div>
              <h2 className="mt-3 font-display text-3xl text-white">
                {isLogin ? "Sign in to your studio" : "Create your account"}
              </h2>
              <p className="mt-1.5 text-sm" style={{ color: "hsl(250,12%,55%)" }}>
                {isLogin
                  ? "Enter your credentials to continue."
                  : "Set up your studio account in seconds."}
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Username */}
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "hsl(248,20%,75%)" }}>
                  Username or Email
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "hsl(250,12%,50%)" }} />
                  <input
                    id="auth-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="jane.doe"
                    autoComplete="username"
                    className="h-12 w-full rounded-xl border pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition focus:ring-2"
                    style={{
                      background: "hsl(250,28%,15%)",
                      borderColor: "hsl(250,24%,22%)",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "hsl(263,82%,66%)"; e.target.style.boxShadow = "0 0 0 3px hsl(263,82%,66%,0.15)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "hsl(250,24%,22%)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              {/* Email (register only) */}
              {!isLogin && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium" style={{ color: "hsl(248,20%,75%)" }}>
                    Email
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                      style={{ color: "hsl(250,12%,50%)" }} />
                    <input
                      id="auth-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@studio.com"
                      className="h-12 w-full rounded-xl border pl-10 pr-4 text-sm text-white placeholder:text-white/20 outline-none transition"
                      style={{ background: "hsl(250,28%,15%)", borderColor: "hsl(250,24%,22%)" }}
                      onFocus={(e) => { e.target.style.borderColor = "hsl(263,82%,66%)"; e.target.style.boxShadow = "0 0 0 3px hsl(263,82%,66%,0.15)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "hsl(250,24%,22%)"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-xs font-medium" style={{ color: "hsl(248,20%,75%)" }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                    style={{ color: "hsl(250,12%,50%)" }} />
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className="h-12 w-full rounded-xl border pl-10 pr-12 text-sm text-white placeholder:text-white/20 outline-none transition"
                    style={{ background: "hsl(250,28%,15%)", borderColor: "hsl(250,24%,22%)" }}
                    onFocus={(e) => { e.target.style.borderColor = "hsl(263,82%,66%)"; e.target.style.boxShadow = "0 0 0 3px hsl(263,82%,66%,0.15)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "hsl(250,24%,22%)"; e.target.style.boxShadow = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition hover:opacity-80"
                    style={{ color: "hsl(250,12%,50%)" }}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                whileHover={{ y: -2, boxShadow: "0 12px 32px rgba(124,58,237,0.55)" }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                type="submit"
                id="auth-submit"
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 8px 24px rgba(124,58,237,0.4)" }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Please wait…
                  </span>
                ) : (
                  <>
                    {isLogin ? "Sign in" : "Create account"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            <p className="mt-6 text-center text-xs" style={{ color: "hsl(250,12%,45%)" }}>
              Your account is managed by your studio administrator.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
