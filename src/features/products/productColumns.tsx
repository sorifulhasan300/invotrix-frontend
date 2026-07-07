import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

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

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "productImage",
    header: "Image",
    cell: ({ row }) => {
      const imageUrl = row.getValue("productImage") as string | undefined;
      return (
        <Avatar className="h-10 w-10 rounded-md">
          <AvatarImage
            src={
              imageUrl
                ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}${imageUrl}`
                : undefined
            }
            alt={row.getValue("name") as string}
            className="object-cover"
          />
          <AvatarFallback className="rounded-md">
            {(row.getValue("name") as string)
              .split(" ")
              .map((n: string) => n[0])
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
    header: "Name & SKU",
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
    header: "Category",
  },
  {
    accessorKey: "stockQuantity",
    header: "Stock",
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
    header: "Buying Price",
    cell: ({ row }) => {
      const price = row.getValue("purchasePrice") as number;
      return <span className="font-mono">{formatCurrency(price)}</span>;
    },
  },
  {
    accessorKey: "sellingPrice",
    header: "Selling Price",
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
              }}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit Stock</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
