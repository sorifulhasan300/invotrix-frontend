import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PublicRoute } from "./PublicRoute";
import { ProductsPage } from "@/features/products/ProductsPage";
import { PosPage } from "@/features/sales/PosPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ReceiptPage } from "@/features/sales/ReceiptPage";

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
    <Outlet />
  </div>
);
const Receipt = () => (
  <div className="p-6">
    <ReceiptPage />
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
        children: [
          {
            index: true,
            element: <PosPage />,
          },
          {
            path: "receipt",
            element: <Receipt />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
