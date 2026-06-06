"use client";

import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/store/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/primitives";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function FavouritesPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.favourites.getMyFavourites,
    {},
    { initialNumItems: 12 }
  );

  if (status === "LoadingFirstPage") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Heart className="h-6 w-6" /> Favourites
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Heart className="h-6 w-6 fill-red-500 text-red-500" /> Favourites
      </h1>

      {results.length === 0 ? (
        <div className="text-center py-20 text-[hsl(var(--muted-foreground))]">
          <Heart className="h-14 w-14 mx-auto mb-4 opacity-20" />
          <p className="text-xl font-semibold mb-2">No favourites yet</p>
          <p className="text-sm mb-6">
            Tap the heart icon on any product to save it here.
          </p>
          <Button asChild>
            <Link href="/shop">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {results.map((fav) =>
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

          {status === "CanLoadMore" && (
            <div className="flex justify-center mt-8">
              <Button variant="outline" onClick={() => loadMore(12)}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
