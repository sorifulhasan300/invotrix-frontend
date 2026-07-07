import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, UploadCloud, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import apiClient from "@/services/api";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  stockQuantity: z.coerce.number().min(0, "Stock must be 0 or more"),
  purchasePrice: z.coerce.number().min(0, "Purchase price must be 0 or more"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be 0 or more"),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  "Electronics",
  "Clothing",
  "Food & Beverages",
  "Home & Garden",
  "Sports",
  "Other",
];

export function AddProductModal({ open, onOpenChange }: AddProductModalProps) {
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      sku: "",
      category: "",
      stockQuantity: 0,
      purchasePrice: 0,
      sellingPrice: 0,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("sku", data.sku);
      formData.append("category", data.category);
      formData.append("stockQuantity", String(data.stockQuantity));
      formData.append("purchasePrice", String(data.purchasePrice));
      formData.append("sellingPrice", String(data.sellingPrice));
      if (imageFile) {
        formData.append("productImages", imageFile);
      }

      const response = await apiClient.post("/products", formData, {
        headers: { "Content-Type": undefined },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Product added successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      reset();
      removeImage();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create product");
    },
  });

  const onSubmit = (data: ProductFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new product to your inventory.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g. Wireless Headphones"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...register("sku")} placeholder="e.g. SKU-001" />
            {errors.sku && (
              <p className="text-sm text-destructive">{errors.sku.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={(value) => setValue("category", value)}
              defaultValue=""
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="stockQuantity">Stock Quantity</Label>
              <Input
                id="stockQuantity"
                type="number"
                min="0"
                {...register("stockQuantity")}
              />
              {errors.stockQuantity && (
                <p className="text-sm text-destructive">
                  {errors.stockQuantity.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purchasePrice">Buying Price ($)</Label>
              <Input
                id="purchasePrice"
                type="number"
                min="0"
                step="0.01"
                {...register("purchasePrice")}
              />
              {errors.purchasePrice && (
                <p className="text-sm text-destructive">
                  {errors.purchasePrice.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sellingPrice">Selling Price ($)</Label>
            <Input
              id="sellingPrice"
              type="number"
              min="0"
              step="0.01"
              {...register("sellingPrice")}
            />
            {errors.sellingPrice && (
              <p className="text-sm text-destructive">
                {errors.sellingPrice.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Product Image</Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-md border">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="productImage"
                  className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/50 hover:border-muted-foreground"
                >
                  <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Upload Image
                  </span>
                  <input
                    id="productImage"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="bg-brand-accent hover:bg-brand-accent-hover text-brand-bg"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Product uploading...
                </>
              ) : (
                "Add Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
