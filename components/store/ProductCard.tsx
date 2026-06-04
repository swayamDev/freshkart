"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

interface ProductCardProps {
  id: Id<"products">;
  name: string;
  price: number;
  compareAtPrice?: number;
  imageUrl: string | null;
  slug: string;
  stock: number;
  unit?: string;
  categoryName?: string;
}

export function ProductCard({
  id, name, price, compareAtPrice, imageUrl, slug, stock, unit, categoryName,
}: ProductCardProps) {
  const { isSignedIn } = useAuth();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const toggleFav = useMutation(api.favourites.toggle);
  const isFav = useQuery(api.favourites.isFavourited, isSignedIn ? { productId: id } : "skip");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ productId: id, name, price, imageUrl, stock, unit });
    openCart();
    toast.success(`${name} added to cart`);
  };

  const handleToggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSignedIn) { toast.error("Sign in to save favourites"); return; }
    await toggleFav({ productId: id });
  };

  const outOfStock = stock <= 0;
  const discount = compareAtPrice && compareAtPrice > price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : null;

  return (
    <Link href={`/products/${slug}`}>
      <Card className="group overflow-hidden h-full hover:shadow-md transition-shadow cursor-pointer">
        <div className="relative aspect-square overflow-hidden bg-[hsl(var(--muted))]">
          {imageUrl ? (
            <Image src={imageUrl} alt={name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-4xl">🥦</div>
          )}
          {discount && (
            <Badge className="absolute top-2 left-2 bg-[hsl(var(--destructive))]">-{discount}%</Badge>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge variant="secondary">Out of stock</Badge>
            </div>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleToggleFav}
          >
            <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>

        <CardContent className="p-3">
          {categoryName && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-1">{categoryName}</p>
          )}
          <p className="text-sm font-medium line-clamp-2 leading-tight">{name}</p>
          {unit && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{unit}</p>}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-semibold text-[hsl(var(--primary))]">{formatPrice(price)}</span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-xs text-[hsl(var(--muted-foreground))] line-through">{formatPrice(compareAtPrice)}</span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-3 pt-0">
          <Button
            size="sm"
            className="w-full h-8"
            onClick={handleAddToCart}
            disabled={outOfStock}
          >
            {outOfStock ? (
              "Out of Stock"
            ) : (
              <>
                <Plus className="h-3 w-3 mr-1" />
                Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
