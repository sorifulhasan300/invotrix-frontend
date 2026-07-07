interface CartItem {
  product: Product;
  quantity: number;
}

interface SalePayload {
  items: { product: string; quantity: number; sellingPrice: number }[];
  discount: number;
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: string;
}

interface InvoiceData {
  _id?: string;
  invoiceNo?: string;
  items?: Array<{
    product: string | { _id?: string; name?: string };
    quantity: number;
    sellingPrice: number;
  }>;
  grandTotal?: number;
  discount?: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: string;
  createdAt?: string;
  [key: string]: any;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Loader2,
  ShoppingCart,
  Printer,
  User,
  Phone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/types/product";
import apiClient from "@/services/api";

interface ProductsResponse {
  data: Product[];
  meta: PaginationMeta;
}

const fetchProducts = async (
  search: string,
  page: number,
  limit: number,
): Promise<ProductsResponse> => {
  const params: Record<string, any> = { page, limit };
  if (search.trim()) {
    params.search = search.trim();
  }
  const response = await apiClient.get("/products", { params });
  return {
    data: response.data.data as Product[],
    meta: (response.data.meta || {}) as PaginationMeta,
  };
};

export function PosPage() {
  const queryClient = useQueryClient();
  const receiptRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(12);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discount, setDiscount] = useState<number>(0);
  const [isCompletingSale, setIsCompletingSale] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeInvoiceData, setActiveInvoiceData] =
    useState<InvoiceData | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", searchQuery, page, pageLimit],
    queryFn: () => fetchProducts(searchQuery, page, pageLimit),
  });

  const products = data?.data || [];
  const meta = data?.meta || null;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, pageLimit]);

  const totalPages = meta?.totalPages || 1;
  const hasNextPage = meta?.hasNextPage || page < totalPages;
  const hasPreviousPage = meta?.hasPreviousPage || page > 1;

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (page > 3) pages.push("...");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  }, [page, totalPages]);

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

  const totalAmount = Math.max(0, subtotal - discount);

  const getProductName = (
    product: string | { _id?: string; name?: string },
  ) => {
    if (typeof product === "object" && product !== null && product.name) {
      return product.name;
    }
    if (typeof product === "string") {
      return (
        products.find((p) => p._id === product)?.name ||
        `Product ${product.slice(0, 8)}`
      );
    }
    return "Unknown Product";
  };

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
      return response.data.data as InvoiceData;
    },
    onSuccess: (saleData) => {
      setActiveInvoiceData({
        ...saleData,
        customerName: saleData?.customerName || customerName || "N/A",
        customerPhone: saleData?.customerPhone || customerPhone || "N/A",
      } as InvoiceData);
      setIsReceiptOpen(true);
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
      discount,
      totalAmount,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      paymentMethod,
    };
    completeSale.mutate(payload);
  };

  const handleCloseReceipt = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setPaymentMethod("Cash");
    setDiscount(0);
    setIsReceiptOpen(false);
    setActiveInvoiceData(null);
  };

  const handlePrint = () => {
    if (!receiptRef.current || !activeInvoiceData) return;
    const receiptHTML = receiptRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=320,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt</title>
            <style>
              @page { size: 80mm auto; margin: 0; }
              body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 8px; color: #000; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .text-lg { font-size: 16px; }
              .my-1 { margin-top: 4px; margin-bottom: 4px; }
              .my-2 { margin-top: 8px; margin-bottom: 8px; }
              hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
              table { width: 100%; border-collapse: collapse; }
              td, th { padding: 2px 0; vertical-align: top; }
              .col-item { text-align: left; width: 45%; }
              .col-qty { text-align: center; width: 15%; }
              .col-price { text-align: right; width: 20%; }
              .col-total { text-align: right; width: 20%; }
            </style>
          </head>
          <body>${receiptHTML}</body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 200);
    }
  };

  const invoiceItems = activeInvoiceData?.items || [];
  const invoiceSubtotal = invoiceItems.reduce(
    (sum, item) => sum + item.quantity * item.sellingPrice,
    0,
  );
  const invoiceTotal =
    activeInvoiceData?.grandTotal ??
    invoiceSubtotal - (activeInvoiceData?.discount || 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      <div className="lg:col-span-7 flex flex-col gap-4 overflow-hidden">
        <div className="relative p-2">
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
              {Array.from({ length: pageLimit }).map((_, i) => (
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

        {!isLoading && products.length > 0 && meta && (
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              Page {meta.page} of {meta.totalPages || 1}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {pageNumbers.map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`dots-${idx}`}
                      className="px-1 text-sm text-muted-foreground"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={p}
                      variant={page === p ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(p as number)}
                    >
                      {p}
                    </Button>
                  ),
                )}
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!hasNextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Select
              value={String(pageLimit)}
              onValueChange={(value) => setPageLimit(Number(value))}
            >
              <SelectTrigger className="h-8 w-[80px]">
                <SelectValue placeholder={String(pageLimit)} />
              </SelectTrigger>
              <SelectContent>
                {[6, 12, 24, 48].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Customer Phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bkash/Nagad">Bkash/Nagad</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Discount</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) =>
                  setDiscount(Math.max(0, Number(e.target.value) || 0))
                }
                className="h-8 w-24 text-right"
              />
            </div>

            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>

            <Button
              className="w-full bg-brand-accent hover:bg-brand-accent-hover text-brand-bg"
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

      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="!max-w-[360px] sm:!max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>

          {activeInvoiceData && (
            <div
              ref={receiptRef}
              className="font-mono text-xs border rounded-md p-4 bg-white text-black"
            >
            <div className="text-center">
              <h2 className="text-lg font-bold">Invotrix ERP</h2>
              <p className="my-1">Dhaka, Bangladesh</p>
              <p>Tel: +880 1XXX-XXXXXX</p>
              <p className="my-1">
                {activeInvoiceData?.createdAt
                  ? new Date(activeInvoiceData.createdAt).toLocaleString()
                  : new Date().toLocaleString()}
              </p>
              <p className="font-bold">
                Invoice:{" "}
                {activeInvoiceData?.invoiceNo ||
                  activeInvoiceData?._id ||
                  "N/A"}
              </p>
            </div>

            <hr />

            <div className="my-2">
              <p>Customer: {activeInvoiceData.customerName}</p>
              <p>Phone: {activeInvoiceData.customerPhone}</p>
            </div>

            <hr />

            <table className="my-2 w-full">
              <thead>
                <tr>
                  <th className="col-item text-left">Item</th>
                  <th className="col-qty text-center">Qty</th>
                  <th className="col-price text-right">Price</th>
                  <th className="col-total text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="col-item">{getProductName(item.product)}</td>
                    <td className="col-qty text-center">{item.quantity}</td>
                    <td className="col-price text-right">
                      ${item.sellingPrice.toFixed(2)}
                    </td>
                    <td className="col-total text-right">
                      ${(item.quantity * item.sellingPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr />

            <div className="my-1 flex justify-between">
              <span>Subtotal</span>
              <span>${invoiceSubtotal.toFixed(2)}</span>
            </div>

            {activeInvoiceData?.discount ? (
              <div className="my-1 flex justify-between">
                <span>Discount</span>
                <span>-${Number(activeInvoiceData.discount).toFixed(2)}</span>
              </div>
            ) : null}

            <div className="my-2 flex justify-between font-bold text-sm">
              <span>Grand Total</span>
              <span>${invoiceTotal.toFixed(2)}</span>
            </div>

            <hr />

            <div className="text-center my-2">
              <p className="font-bold">Thank you for shopping with us!</p>
              <p>Visit again</p>
            </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handlePrint}
              disabled={!activeInvoiceData}
            >
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
            <Button className="flex-1" onClick={handleCloseReceipt}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
