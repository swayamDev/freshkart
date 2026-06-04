"use client";

import { usePaginatedQuery, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Skeleton } from "@/components/ui/primitives";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatPrice } from "@/lib/utils";
import { Plus, MoreHorizontal, Pencil, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().min(1),
  compareAtPrice: z.coerce.number().optional(),
  categoryId: z.string().min(1),
  stock: z.coerce.number().min(0),
  unit: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AdminProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Id<"products"> | null>(null);
  const categories = useQuery(api.categories.list);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);

  const { results: products, status, loadMore } = usePaginatedQuery(
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
    setShowForm(true);
  };

  const openEdit = (p: typeof products[0]) => {
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
    setShowForm(true);
  };

  const onSubmit = async (data: ProductForm) => {
    try {
      if (editing) {
        await updateProduct({
          id: editing,
          ...data,
          categoryId: data.categoryId as Id<"categories">,
          compareAtPrice: data.compareAtPrice || undefined,
          unit: data.unit || undefined,
          description: data.description || undefined,
        });
        toast.success("Product updated");
      } else {
        await createProduct({
          ...data,
          categoryId: data.categoryId as Id<"categories">,
          compareAtPrice: data.compareAtPrice || undefined,
          unit: data.unit || undefined,
          description: data.description || undefined,
        });
        toast.success("Product created");
      }
      setShowForm(false);
    } catch {
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id: Id<"products">) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct({ id });
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Manage your product catalogue.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {status === "LoadingFirstPage" ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-[hsl(var(--muted-foreground))]">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
            No products yet. Add your first product.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {products.map((product) =>
            product ? (
              <Card key={product._id}>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded bg-[hsl(var(--muted))] flex items-center justify-center flex-shrink-0 text-lg">
                      🥦
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Stock: {product.stock} · {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={product.isActive ? "default" : "secondary"}>
                      {product.isActive ? "Active" : "Draft"}
                    </Badge>
                    {product.stock === 0 && <Badge variant="destructive">Out of stock</Badge>}
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
                  </div>
                </CardContent>
              </Card>
            ) : null
          )}
          {status === "CanLoadMore" && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => loadMore(20)}>Load more</Button>
            </div>
          )}
        </div>
      )}

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input {...form.register("name")} placeholder="Organic Apples" />
              </div>
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input {...form.register("slug")} placeholder="organic-apples" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea {...form.register("description")} placeholder="Fresh from the farm..." rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Price (p)</Label>
                <Input type="number" {...form.register("price")} placeholder="199" />
              </div>
              <div className="space-y-1">
                <Label>Was price (p)</Label>
                <Input type="number" {...form.register("compareAtPrice")} placeholder="249" />
              </div>
              <div className="space-y-1">
                <Label>Stock</Label>
                <Input type="number" {...form.register("stock")} placeholder="100" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Category</Label>
                <Select value={form.watch("categoryId")} onValueChange={(v) => form.setValue("categoryId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Unit</Label>
                <Input {...form.register("unit")} placeholder="kg / each / bunch" />
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register("isActive")} className="rounded" />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...form.register("isFeatured")} className="rounded" />
                Featured
              </label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save Changes" : "Create Product"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
