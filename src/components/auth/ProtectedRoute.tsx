import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useApp } from "@/context/AppContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
