export interface LowStockProduct {
  _id: string
  name: string
  sku: string
  stockQuantity: number
}

export interface TotalSales {
  count: number
  totalRevenue: number
}

export interface DashboardData {
  totalProducts: number
  totalCustomers: number
  totalSales: TotalSales
  lowStockProducts: LowStockProduct[]
}

export interface DashboardResponse {
  success: boolean
  message: string
  data: DashboardData
}
