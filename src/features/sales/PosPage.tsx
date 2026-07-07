interface CartItem {
  product: Product;
  quantity: number;
}

interface SalePayload {
  items: { product: string; quantity: number; sellingPrice: number }[]
  grandTotal: number
}

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Loader2,
  ShoppingCart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types/product";
import apiClient from "@/services/api";

const fetchProducts = async (search: string): Promise<Product[]> => {
  const response = await apiClient.get("/products", {
    params: search ? { search } : undefined,
  });
  return response.data.data as Product[];
};

export function PosPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCompletingSale, setIsCompletingSale] = useState(false);

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", searchQuery],
    queryFn: () => fetchProducts(searchQuery),
  });

  const cartMap = useMemo(() => {
    const map = new Map<string, CartItem>();
    cart.forEach((item) => map.set(item.product._id, item));
    return map;
  }, [cart]);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.quantity * item.product.sellingPrice,
        0,
      ),
    [cart],
  );

  const grandTotal = subtotal;

  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          toast.error("Cannot exceed available stock");
          return prev;
        }
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (_id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product._id !== _id) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.stockQuantity) {
            toast.error("Cannot exceed available stock");
            return item;
          }
          return { ...item, quantity: newQty };
        })
        .filter((item): item is CartItem => item !== null),
    );
  };

  const removeFromCart = (_id: string) => {
    setCart((prev) => prev.filter((item) => item.product._id !== _id));
  };

  const completeSale = useMutation({
    mutationFn: async (payload: SalePayload) => {
      const response = await apiClient.post("/sales", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Sale completed successfully");
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to complete sale");
    },
    onSettled: () => {
      setIsCompletingSale(false);
    },
  });

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setIsCompletingSale(true);
    const payload: SalePayload = {
      items: cart.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        sellingPrice: item.product.sellingPrice,
      })),
      grandTotal,
    };
    completeSale.mutate(payload);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      <div className="lg:col-span-7 flex flex-col gap-4 overflow-hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              Failed to load products. Please try again later.
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-48" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mb-2 opacity-50" />
              <p>No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.map((product) => {
                const isOutOfStock = product.stockQuantity === 0;
                const inCart = cartMap.get(product._id);

                return (
                  <Card
                    key={product._id}
                    className={`relative flex flex-col overflow-hidden transition hover:shadow-lg ${
                      isOutOfStock ? "opacity-80" : "cursor-pointer"
                    }`}
                    onClick={() => !isOutOfStock && addToCart(product)}
                  >
                    {isOutOfStock && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium"
                        >
                          Out of Stock
                        </Badge>
                      </div>
                    )}

                    {product.productImage ? (
                      <img
                        src={product.productImage}
                        alt={product.name}
                        className="h-32 w-full object-cover"
                      />
                    ) : (
                      <div className="h-32 w-full bg-muted flex items-center justify-center text-muted-foreground">
                        <span className="text-xs">No Image</span>
                      </div>
                    )}

                    <CardContent className="flex flex-1 flex-col gap-2 p-4">
                      <p className="font-medium text-sm leading-tight">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-sm font-semibold">
                          ${product.sellingPrice.toFixed(2)}
                        </span>
                        <Badge
                          variant={
                            product.stockQuantity > 10
                              ? "success"
                              : product.stockQuantity > 0
                                ? "warning"
                                : "danger"
                          }
                          className="min-w-[3rem] justify-center"
                        >
                          {product.stockQuantity}
                        </Badge>
                      </div>

                      {inCart && (
                        <Badge variant="default" className="self-start text-xs">
                          In cart: {inCart.quantity}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4 overflow-hidden">
        <Card className="flex flex-1 flex-col overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Cart</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                <ShoppingCart className="h-8 w-8 mb-2 opacity-40" />
                <p>Cart is empty</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-center gap-3 rounded-md border p-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${item.product.sellingPrice.toFixed(2)} x {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.product._id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <span className="w-6 text-center text-sm font-medium">
                      {item.quantity}
                    </span>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.product._id, 1)}
                      disabled={item.quantity >= item.product.stockQuantity}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeFromCart(item.product._id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>

          <div className="border-t p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between text-base font-semibold">
              <span>Grand Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={cart.length === 0 || isCompletingSale}
              onClick={handleCompleteSale}
            >
              {isCompletingSale ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Sale"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
