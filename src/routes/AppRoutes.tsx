import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PublicRoute } from "./PublicRoute";
import { ProductsPage } from "@/features/products/ProductsPage";
import { PosPage } from "@/features/sales/PosPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";

const Dashboard = () => (
  <div className="p-6">
    <DashboardPage />
  </div>
);
const Products = () => (
  <div className="p-6">
    <ProductsPage />
  </div>
);
const Sales = () => (
  <div className="p-6">
    <PosPage />
  </div>
);
const Login = () => (
  <div>
    <LoginPage />
  </div>
);
const Register = () => <RegisterPage />;
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
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "products",
        element: (
          <ProtectedRoute allowedRoles={["admin", "staff"]}>
            <Products />
          </ProtectedRoute>
        ),
      },
      {
        path: "sales",
        element: (
          <ProtectedRoute allowedRoles={["admin", "staff", "manager"]}>
            <Sales />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
