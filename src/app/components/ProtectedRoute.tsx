import { Navigate } from "react-router";
import { useApp } from "../context/AppContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isProfileSetup } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isProfileSetup) return <Navigate to="/profile-setup" replace />;
  return <>{children}</>;
}
