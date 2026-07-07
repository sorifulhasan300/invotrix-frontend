import { useQuery, type QueryFunction } from "@tanstack/react-query";
import {
  Package,
  Users,
  ShoppingBag,
  DollarSign,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/services/api";
import type { DashboardResponse, DashboardData } from "./dashboard.types";

const fetchDashboardStats: QueryFunction<DashboardResponse> = async () => {
  const response = await apiClient.get("/dashboard/stats");
  return response.data as DashboardResponse;
};

function DashboardMetricCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconText,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconText: string;
}) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md border-border/60">
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-6 w-6 ${iconText}`} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <span className="text-2xl font-bold tracking-tight">{value}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCardSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center gap-4 p-6">
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const {
    data: dashboardResponse,
    isLoading,
    error,
  } = useQuery<DashboardResponse>({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });

  const dashboardData: DashboardData | undefined = dashboardResponse?.data;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Real-time business insights at a glance.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
            <MetricCardSkeleton />
          </>
        ) : error ? (
          <div className="col-span-full rounded-md border border-destructive/50 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
            <AlertCircle className="mx-auto mb-2 h-6 w-6" />
            Failed to load dashboard data. Please try again later.
          </div>
        ) : (
          <>
            <DashboardMetricCard
              title="Total Products"
              value={dashboardData?.totalProducts ?? 0}
              icon={Package}
              iconBg="bg-blue-100 dark:bg-blue-950/40"
              iconText="text-blue-600 dark:text-blue-400"
            />
            <DashboardMetricCard
              title="Total Customers"
              value={dashboardData?.totalCustomers ?? 0}
              icon={Users}
              iconBg="bg-emerald-100 dark:bg-emerald-950/40"
              iconText="text-emerald-600 dark:text-emerald-400"
            />
            <DashboardMetricCard
              title="Total Orders"
              value={dashboardData?.totalSales.count ?? 0}
              icon={ShoppingBag}
              iconBg="bg-violet-100 dark:bg-violet-950/40"
              iconText="text-violet-600 dark:text-violet-400"
            />
            <DashboardMetricCard
              title="Total Revenue"
              value={`৳${(dashboardData?.totalSales.totalRevenue ?? 0).toLocaleString()}`}
              icon={DollarSign}
              iconBg="bg-amber-100 dark:bg-amber-950/40"
              iconText="text-amber-600 dark:text-amber-400"
            />
          </>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Low Stock Alerts
        </h2>
        {isLoading ? (
          <Card className="border-border/60">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center gap-3 py-8">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-64" />
              </div>
            </CardContent>
          </Card>
        ) : dashboardData && dashboardData.lowStockProducts.length === 0 ? (
          <Card className="bg-white dark:bg-[#09090B] border border-gray-200 dark:border-gray-700">
            <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <span className="text-4xl">🎉</span>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                All stock levels are currently healthy! No low stock items.
              </p>
            </CardContent>
          </Card>
        ) : dashboardData && dashboardData.lowStockProducts.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardData.lowStockProducts.map((product) => (
              <Card
                key={product._id}
                className="border-border/60 transition-shadow hover:shadow-sm"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      SKU: {product.sku}
                    </p>
                  </div>
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400">
                    {product.stockQuantity} left
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
