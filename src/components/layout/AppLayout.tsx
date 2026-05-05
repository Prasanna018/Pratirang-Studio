import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { RightSidebar } from "./RightSidebar";

export function AppLayout() {
  const loc = useLocation();
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />
        <div className="flex min-w-0 flex-1">
          <main className="scrollbar-thin min-w-0 flex-1 overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={loc.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="px-6 py-8 lg:px-10"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
