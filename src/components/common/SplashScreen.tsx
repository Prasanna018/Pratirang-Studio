import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function SplashScreen() {
  const letters = "Pratirang".split("");

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background gradient-aurora"
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -30 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 14, stiffness: 180 }}
          className="relative"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Sparkles className="h-7 w-7 text-primary-foreground" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-2xl gradient-primary"
          />
        </motion.div>

        <div className="flex items-baseline gap-1.5">
          {letters.map((l, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: [0, 1, 1, 0.4, 1], y: 0 }}
              transition={{
                opacity: {
                  duration: 1.8,
                  delay: i * 0.07,
                  repeat: Infinity,
                  repeatDelay: 0.4,
                  times: [0, 0.3, 0.6, 0.8, 1],
                },
                y: { duration: 0.5, delay: i * 0.07 },
              }}
              className="font-display text-6xl tracking-tight bg-gradient-to-br from-primary via-primary-glow to-accent bg-clip-text text-transparent"
            >
              {l}
            </motion.span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: [0.4, 1, 0.4], letterSpacing: "0.6em" }}
          transition={{
            opacity: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
            letterSpacing: { duration: 0.8, delay: 0.3 },
          }}
          className="text-[11px] font-medium uppercase text-muted-foreground"
        >
          Studio
        </motion.div>

        <div className="mt-4 h-[2px] w-40 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="h-full w-1/2 gradient-primary"
          />
        </div>
      </div>
    </motion.div>
  );
}
