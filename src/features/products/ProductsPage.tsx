import { useState, useMemo } from "react"
import { useQuery, type QueryFunction } from "@tanstack/react-query"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { DataTable } from "@/components/ui/data-table"
import { AddProductModal } from "@/features/products/AddProductModal"
import { EditProductModal } from "@/features/products/EditProductModal"
import { DeleteConfirmationModal } from "@/features/products/DeleteConfirmationModal"
import { getProductColumns } from "@/features/products/productColumns"
import type { Product } from "@/types/product"
import apiClient from "@/services/api"
import { useDebounce } from "@/hooks/useDebounce"

interface ProductsQueryParams {
  searchName?: string
  searchSku?: string
  searchCategory?: string
  sortField?: string
  sortOrder?: string
}

const fetchProducts: QueryFunction<Product[]> = async ({ queryKey }) => {
  const [, params] = queryKey as [string, ProductsQueryParams]

  const response = await apiClient.get("/products", {
    params: {
      ...(params.searchName && { name: params.searchName }),
      ...(params.searchSku && { sku: params.searchSku }),
      ...(params.searchCategory && { category: params.searchCategory }),
      ...(params.sortField && { sortBy: params.sortField }),
      ...(params.sortOrder && { sortOrder: params.sortOrder }),
    },
  })

  return response.data.data as Product[]
}

export function ProductsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const [searchName, setSearchName] = useState("")
  const [searchSku, setSearchSku] = useState("")
  const [searchCategory, setSearchCategory] = useState("")
  const [sort, setSort] = useState<{ field: string; order: "asc" | "desc" }>({
    field: "createdAt",
    order: "desc",
  })

  const debouncedName = useDebounce(searchName, 500)
  const debouncedSku = useDebounce(searchSku, 500)
  const debouncedCategory = useDebounce(searchCategory, 500)

  const handleSort = (field: string) => {
    setSort((prev) => {
      if (prev.field === field) {
        return { field, order: prev.order === "asc" ? "desc" : "asc" }
      }
      return { field, order: "desc" }
    })
  }

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "products",
      {
        searchName: debouncedName,
        searchSku: debouncedSku,
        searchCategory: debouncedCategory,
        sortField: sort.field,
        sortOrder: sort.order,
      },
    ],
    queryFn: fetchProducts,
  })

  const columns = useMemo(
    () =>
      getProductColumns({
        onEdit: (product) => setEditingProduct(product),
        onDelete: (product) => setDeletingProduct(product),
        sortBy: sort.field,
        sortOrder: sort.order,
        onSort: handleSort,
      }),
    [sort.field, sort.order]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="max-w-[200px]"
        />
        <Input
          placeholder="Search SKU..."
          value={searchSku}
          onChange={(e) => setSearchSku(e.target.value)}
          className="max-w-[200px]"
        />
        <Input
          placeholder="Search category..."
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          className="max-w-[200px]"
        />
      </div>

      <AddProductModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />

      <EditProductModal
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
        product={editingProduct!}
      />

      <DeleteConfirmationModal
        open={!!deletingProduct}
        onOpenChange={(open) => !open && setDeletingProduct(null)}
        product={deletingProduct}
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
        <DataTable columns={columns} data={products} />
      )}
    </div>
  )
}
