"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Skeleton } from "@/components/ui/primitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  sortOrder: z.coerce.number().optional(),
});
type CategoryForm = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Id<"categories"> | null>(null);
  const categories = useQuery(api.categories.list);
  const createCategory = useMutation(api.categories.create);
  const updateCategory = useMutation(api.categories.update);
  const deleteCategory = useMutation(api.categories.remove);

  const form = useForm<CategoryForm>({ resolver: zodResolver(categorySchema) });

  const openCreate = () => {
    form.reset({});
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (cat: NonNullable<typeof categories>[0]) => {
    form.reset({ name: cat.name, slug: cat.slug, description: cat.description ?? "", sortOrder: cat.sortOrder });
    setEditing(cat._id);
    setShowForm(true);
  };

  const onSubmit = async (data: CategoryForm) => {
    try {
      if (editing) {
        await updateCategory({ id: editing, ...data, description: data.description || undefined });
        toast.success("Category updated");
      } else {
        await createCategory({ ...data, description: data.description || undefined });
        toast.success("Category created");
      }
      setShowForm(false);
    } catch {
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async (id: Id<"categories">) => {
    if (!confirm("Delete this category? Products in it will lose their category.")) return;
    try {
      await deleteCategory({ id });
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Organise your products into categories.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {!categories ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-[hsl(var(--muted-foreground))]">
            <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
            No categories yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <Card key={cat._id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{cat.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">/{cat.slug}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(cat)}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-[hsl(var(--destructive))]" onClick={() => handleDelete(cat._id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input {...form.register("name")} placeholder="Fruit & Veg" />
            </div>
            <div className="space-y-1">
              <Label>Slug</Label>
              <Input {...form.register("slug")} placeholder="fruit-veg" />
            </div>
            <div className="space-y-1">
              <Label>Description (optional)</Label>
              <Input {...form.register("description")} placeholder="Fresh fruit and vegetables" />
            </div>
            <div className="space-y-1">
              <Label>Sort order</Label>
              <Input type="number" {...form.register("sortOrder")} placeholder="1" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Save" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
