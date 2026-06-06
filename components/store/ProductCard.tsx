"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/utils";
import { ShoppingCart, Plus } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

interface ProductCardProps {
  id: Id<"products">;
  name: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string | null;
  slug: string;
  stock: number;
  unit?: string;
}

export function ProductCard({
  id,
  name,
  price,
  compareAtPrice,
  imageUrl,
  slug,
  stock,
  unit,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const outOfStock = stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ productId: id, name, price, imageUrl, stock, unit });
    openCart();
    toast.success(`${name} added to cart`);
  };

  return (
    <Link href={`/products/${slug}`} className="group block">
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] overflow-hidden hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative aspect-square bg-[hsl(var(--muted))]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-5xl">
              🥦
            </div>
          )}
          {compareAtPrice && compareAtPrice > price && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5">
                Sale
              </Badge>
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded">
                Out of stock
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-3 space-y-2">
          <p className="text-sm font-medium leading-tight line-clamp-2">{name}</p>
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-sm font-bold text-[hsl(var(--primary))]">
                {formatPrice(price)}
              </span>
              {unit && (
                <span className="text-xs text-[hsl(var(--muted-foreground))] ml-1">
                  / {unit}
                </span>
              )}
              {compareAtPrice && compareAtPrice > price && (
                <span className="text-xs text-[hsl(var(--muted-foreground))] line-through ml-1">
                  {formatPrice(compareAtPrice)}
                </span>
              )}
            </div>
            {!outOfStock && (
              <Button
                size="icon"
                className="h-7 w-7 flex-shrink-0 rounded-full"
                onClick={handleAdd}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
