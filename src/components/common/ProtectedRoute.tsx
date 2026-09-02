import { Navigate, Outlet } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";

export const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Loader2 className="animate-spin" size={40} color="var(--color-primary-600)" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login but replace the history so they can't click "Back" into the protected route
    return <Navigate to="/login" replace />;
  }

  // Outlet renders whatever child route is matched inside this wrapper
  return <Outlet />;
};