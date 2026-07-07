import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "@/features/auth/LoginPage";
import { PublicRoute } from "./PublicRoute";

const Dashboard = () => <div className="p-6">Dashboard</div>;
const Products = () => <div className="p-6">Products</div>;
const Sales = () => <div className="p-6">Sales / POS</div>;
const Login = () => (
  <div>
    <LoginPage />
  </div>
);
const Register = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="max-w-md w-full p-6">
      <h1 className="text-2xl font-medium mb-2">Create account</h1>
      <p className="text-sm text-brand-text-secondary">
        Registration form coming soon.
      </p>
    </div>
  </div>
);
const Unauthorized = () => <div className="p-6">Unauthorized</div>;

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/products",
    element: (
      <ProtectedRoute allowedRoles={["admin", "staff"]}>
        <Products />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sales",
    element: (
      <ProtectedRoute allowedRoles={["admin", "staff", "manager"]}>
        <Sales />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
