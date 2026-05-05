import { Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

export default function Index() {
  const { user } = useApp();
  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
}
