import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const LoadingSpinner = () => (
  <div className="min-h-screen w-full bg-brand-bg text-brand-text flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
      <p className="text-[13px] text-brand-text-muted">Verifying access…</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const token = useAuthStore((state) => state.token);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const location = useLocation();

  useEffect(() => {
    if (token && !user && !isLoading) {
      fetchCurrentUser();
    }
  }, [token, !!user, isLoading]);


  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading || (token && !user)) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user?.role) {
    const hasRole = allowedRoles
      .map((r) => r.toLowerCase())
      .includes(user.role.toLowerCase());
    if (!hasRole) {
      if (user.role.toLowerCase() === "employee") {
        return <Navigate to="/sales" replace />;
      }
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
