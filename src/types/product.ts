export type Product = {
  _id: string;
  name: string;
  sku: string;
  category: string;
  stockQuantity: number;
  purchasePrice: number;
  sellingPrice: number;
  productImages?: string;
};
