import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const Dashboard = () => <div className="p-6">Dashboard</div>;
const Products = () => <div className="p-6">Products</div>;
const Sales = () => <div className="p-6">Sales / POS</div>;
const Login = () => <div className="p-6">Login</div>;
const Unauthorized = () => <div className="p-6">Unauthorized</div>;

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
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
