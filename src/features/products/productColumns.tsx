import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { type Product } from "@/types/product";

function getStockVariant(stock: number): "success" | "warning" | "danger" {
  if (stock > 10) return "success";
  if (stock >= 3) return "warning";
  return "danger";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

interface ProductColumnActions {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
}

const SortableHeader = ({
  children,
  field,
  sortBy,
  sortOrder,
  onSort,
}: {
  children: React.ReactNode;
  field: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
}) => {
  if (!onSort) return <>{children}</>;

  const isActive = sortBy === field;
  const indicator = isActive ? (sortOrder === "asc" ? " ▲" : " ▼") : "";

  return (
    <button
      type="button"
      className="flex items-center gap-1 text-left"
      onClick={() => onSort(field)}
    >
      {children}
      {indicator}
    </button>
  );
};

export function getProductColumns({
  onEdit,
  onDelete,
  sortBy,
  sortOrder,
  onSort,
}: ProductColumnActions): ColumnDef<Product>[] {
  return [
    {
      accessorKey: "productImages",
      header: "Image",
      cell: ({ row }) => {
        const imageUrl = (
          row.getValue("productImages") as string[] | undefined
        )?.[0];
        return (
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage
              src={imageUrl ? `${imageUrl}` : undefined}
              alt={row.original.name}
              className="object-cover"
            />
            <AvatarFallback className="rounded-md">
              {row.original.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "name",
      header: () => (
        <SortableHeader
          field="name"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
        >
          Name & SKU
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        const sku = row.original.sku;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">{sku}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: () => (
        <SortableHeader
          field="category"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
        >
          Category
        </SortableHeader>
      ),
    },
    {
      accessorKey: "stockQuantity",
      header: () => (
        <SortableHeader
          field="stockQuantity"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
        >
          Stock
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const stock = row.getValue("stockQuantity") as number;
        return (
          <Badge
            variant={getStockVariant(stock)}
            className="min-w-[3rem] text-center"
          >
            {stock}
          </Badge>
        );
      },
    },
    {
      accessorKey: "purchasePrice",
      header: () => (
        <SortableHeader
          field="purchasePrice"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
        >
          Buying Price
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const price = row.getValue("purchasePrice") as number;
        return <span className="font-mono">{formatCurrency(price)}</span>;
      },
    },
    {
      accessorKey: "sellingPrice",
      header: () => (
        <SortableHeader
          field="sellingPrice"
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSort}
        >
          Selling Price
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const price = row.getValue("sellingPrice") as number;
        return <span className="font-mono">{formatCurrency(price)}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(product._id);
                  toast.success("Product ID copied to clipboard");
                }}
              >
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(product)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(product)}
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
