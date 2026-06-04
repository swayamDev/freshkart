"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/utils";
import { Heart, Minus, Plus, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isSignedIn } = useAuth();
  const product = useQuery(api.products.getBySlug, { slug });
  const isFav = useQuery(api.favourites.isFavourited, isSignedIn && product ? { productId: product._id } : "skip");
  const toggleFav = useMutation(api.favourites.toggle);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const [quantity, setQuantity] = useState(1);

  if (product === undefined) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-[hsl(var(--muted-foreground))]">Product not found</div>;
  }

  const outOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    addItem({ productId: product._id, name: product.name, price: product.price, imageUrl: product.imageUrl, stock: product.stock, unit: product.unit, quantity });
    openCart();
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-[hsl(var(--muted))]">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-8xl">🥦</div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-5">
          {product.category && (
            <Link href={`/shop?category=${product.category.slug}`}>
              <Badge variant="secondary">{product.category.name}</Badge>
            </Link>
          )}
          <h1 className="text-3xl font-bold">{product.name}</h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[hsl(var(--primary))]">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-[hsl(var(--muted-foreground))] line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
            {product.unit && <span className="text-sm text-[hsl(var(--muted-foreground))]">per {product.unit}</span>}
          </div>

          {product.description && (
            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center gap-2">
            {outOfStock ? (
              <Badge variant="destructive">Out of stock</Badge>
            ) : product.stock <= 5 ? (
              <Badge variant="outline" className="text-orange-600 border-orange-300">Only {product.stock} left</Badge>
            ) : (
              <Badge variant="outline" className="text-green-600 border-green-300">In stock</Badge>
            )}
          </div>

          {!outOfStock && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[hsl(var(--border))] rounded-md">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-r-none" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-l-none" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={async () => {
                  if (!isSignedIn) { toast.error("Sign in to save favourites"); return; }
                  await toggleFav({ productId: product._id });
                }}
              >
                <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
