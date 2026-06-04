"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/store/ProductCard";
import { Skeleton } from "@/components/ui/primitives";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FavouritesPage() {
  const favourites = useQuery(api.favourites.getMyFavourites);

  if (favourites === undefined) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Favourites</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
        Favourites
      </h1>

      {favourites.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No favourites yet</p>
          <p className="text-sm mt-1">Tap the heart icon on any product to save it here.</p>
          <Button className="mt-6" asChild>
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {favourites.map((fav) =>
            fav?.product ? (
              <ProductCard
                key={fav._id}
                id={fav.product._id}
                name={fav.product.name}
                price={fav.product.price}
                compareAtPrice={fav.product.compareAtPrice}
                imageUrl={fav.product.imageUrl ?? null}
                slug={fav.product.slug}
                stock={fav.product.stock}
                unit={fav.product.unit}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
