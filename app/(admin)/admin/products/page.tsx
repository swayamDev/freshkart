"use client";

import { usePaginatedQuery, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Skeleton } from "@/components/ui/primitives";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/lib/utils";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Package,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

const productSchema = z.object({
  name: z.string().min(1, "Name required"),
  slug: z.string().min(1, "Slug required"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price required (in pence)"),
  compareAtPrice: z.coerce.number().optional(),
  categoryId: z.string().min(1, "Category required"),
  stock: z.coerce.number().min(0),
  unit: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AdminProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Id<"products"> | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [pendingImageId, setPendingImageId] = useState<Id<"_storage"> | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = useQuery(api.categories.list);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  const {
    results: products,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.products.list,
    { activeOnly: false },
    { initialNumItems: 20 }
  );

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { isActive: true, isFeatured: false },
  });

  const openCreate = () => {
    form.reset({ isActive: true, isFeatured: false });
    setEditing(null);
    setImagePreview(null);
    setPendingImageId(null);
    setShowForm(true);
  };

  const openEdit = (p: (typeof products)[0]) => {
    if (!p) return;
    form.reset({
      name: p.name,
      slug: p.slug,
      description: p.description ?? "",
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      categoryId: p.categoryId,
      stock: p.stock,
      unit: p.unit ?? "",
      isActive: p.isActive,
      isFeatured: p.isFeatured ?? false,
    });
    setEditing(p._id);
    setImagePreview(
      (p as typeof p & { imageUrl?: string | null }).imageUrl ?? null
    );
    setPendingImageId(null);
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();
      setPendingImageId(storageId as Id<"_storage">);
      setImagePreview(URL.createObjectURL(file));
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ProductForm) => {
    try {
      const payload = {
        ...data,
        description: data.description || undefined,
        unit: data.unit || undefined,
        compareAtPrice: data.compareAtPrice || undefined,
        categoryId: data.categoryId as Id<"categories">,
        ...(pendingImageId ? { imageId: pendingImageId } : {}),
      };

      if (editing) {
        await updateProduct({ id: editing, ...payload });
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }
      setShowForm(false);
    } catch (err) {
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id: Id<"products">) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct({ id });
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const makeSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Manage your product catalogue.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {status === "LoadingFirstPage" ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-[hsl(var(--muted-foreground))]">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
            No products yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {products.map((product) =>
            product ? (
              <Card key={product._id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md bg-[hsl(var(--muted))] overflow-hidden flex-shrink-0">
                    {(product as typeof product & { imageUrl?: string | null })
                      .imageUrl ? (
                      <Image
                        src={
                          (
                            product as typeof product & {
                              imageUrl?: string | null;
                            }
                          ).imageUrl!
                        }
                        alt={product.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">
                        {product.name}
                      </p>
                      {!product.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {product.isFeatured && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {formatPrice(product.price)} · Stock: {product.stock}
                      {product.unit ? ` · per ${product.unit}` : ""}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(product)}>
                        <Pencil className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-[hsl(var(--destructive))]"
                        onClick={() => handleDelete(product._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ) : null
          )}

          {status === "CanLoadMore" && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => loadMore(20)}>
                Load more
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-md bg-[hsl(var(--muted))] overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Image"}
                  </Button>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2"
                      onClick={() => {
                        setImagePreview(null);
                        setPendingImageId(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <Label>Name</Label>
                <Input
                  {...form.register("name")}
                  placeholder="Organic Apples"
                  onChange={(e) => {
                    form.setValue("name", e.target.value);
                    if (!editing) {
                      form.setValue("slug", makeSlug(e.target.value));
                    }
                  }}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-[hsl(var(--destructive))]">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1 col-span-2">
                <Label>Slug</Label>
                <Input
                  {...form.register("slug")}
                  placeholder="organic-apples"
                />
              </div>

              <div className="space-y-1">
                <Label>Price (pence)</Label>
                <Input
                  type="number"
                  {...form.register("price")}
                  placeholder="149"
                />
                {form.formState.errors.price && (
                  <p className="text-xs text-[hsl(var(--destructive))]">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Compare at price (pence)</Label>
                <Input
                  type="number"
                  {...form.register("compareAtPrice")}
                  placeholder="199"
                />
              </div>

              <div className="space-y-1">
                <Label>Stock</Label>
                <Input
                  type="number"
                  {...form.register("stock")}
                  placeholder="100"
                />
              </div>

              <div className="space-y-1">
                <Label>Unit</Label>
                <Input
                  {...form.register("unit")}
                  placeholder="kg, each, bunch"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Category</Label>
              <Select
                value={form.watch("categoryId")}
                onValueChange={(v) => form.setValue("categoryId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                {...form.register("description")}
                placeholder="Product description..."
                rows={3}
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  {...form.register("isActive")}
                  className="rounded"
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  {...form.register("isFeatured")}
                  className="rounded"
                />
                Featured on homepage
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {editing ? "Save Changes" : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
