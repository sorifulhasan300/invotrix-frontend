import { useState } from "react"
import { useQuery, type QueryFunction } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable } from "@/components/ui/data-table"
import { AddProductModal } from "@/features/products/AddProductModal"
import { columns } from "@/features/products/productColumns"
import type { Product } from "@/types/product"
import apiClient from "@/services/api"

const fetchProducts: QueryFunction<Product[]> = async () => {
  const response = await apiClient.get("/products")
  return response.data.data as Product[]
}

export function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <AddProductModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Failed to load products. Please try again later.
        </div>
      )}

      {isLoading ? (
        <div className="rounded-md border">
          <div className="flex flex-col gap-4 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[120px]" />
                </div>
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-6 w-[4rem] rounded-full" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
          searchKey="name"
        />
      )}
    </div>
  )
}
