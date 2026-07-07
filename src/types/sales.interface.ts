import type { Product } from "./product";

export type { Product };

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SalePayload {
  items: { product: string; quantity: number; sellingPrice: number }[];
  discount: number;
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: string;
}

export interface InvoiceData {
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

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
