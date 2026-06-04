"use client";

import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ProductCard } from "@/components/store/ProductCard";
import { Skeleton } from "@/components/ui/primitives";
import { Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Search } from "lucide-react";

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<"categories"> | undefined>();

  const categories = useQuery(api.categories.list);

  const searchResults = useQuery(
    api.products.search,
    search.trim().length > 1 ? { query: search } : "skip"
  );

  const { results: browseResults, status, loadMore } = usePaginatedQuery(
    api.products.list,
    { categoryId: selectedCategoryId, activeOnly: true },
    { initialNumItems: 12 }
  );

  const isSearching = search.trim().length > 1;
  const products = isSearching ? searchResults : browseResults;
  const isLoading = !categories || (!isSearching && status === "LoadingFirstPage");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search */}
      <div className="relative mb-8 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        <Input
          placeholder="Search for groceries..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        <Button
          variant={!selectedCategoryId ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategoryId(undefined)}
        >
          All
        </Button>
        {categories?.map((cat) => (
          <Button
            key={cat._id}
            variant={selectedCategoryId === cat._id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategoryId(cat._id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <p className="text-lg">No products found</p>
          {search && <p className="text-sm mt-1">Try a different search term</p>}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) =>
              product ? (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  imageUrl={(product as typeof product & { imageUrl?: string | null }).imageUrl ?? null}
                  slug={product.slug}
                  stock={product.stock}
                  unit={product.unit}
                />
              ) : null
            )}
          </div>
          {!isSearching && status === "CanLoadMore" && (
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
