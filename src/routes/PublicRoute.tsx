import { Navigate } from "react-router-dom";
import { useAuthStore } from "../features/auth/authStore";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: PublicRouteProps) => {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
