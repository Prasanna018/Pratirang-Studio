import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useApp } from "@/context/AppContext";

export function PublicRoute({ children }: { children: ReactNode }) {
  const { user, isLoadingUser } = useApp();

  if (isLoadingUser) {
    return null;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
