"use client";

import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ProductCard } from "@/components/store/ProductCard";
import { Skeleton } from "@/components/ui/primitives";
import { Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { useCallback, useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Support ?category=<id> from URL
  const categoryParam = searchParams.get("category") as Id<"categories"> | null;
  const [selectedCategoryId, setSelectedCategoryId] = useState<Id<"categories"> | undefined>(
    categoryParam ?? undefined
  );

  // Sync category param from URL
  useEffect(() => {
    setSelectedCategoryId((categoryParam as Id<"categories">) ?? undefined);
  }, [categoryParam]);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const categories = useQuery(api.categories.list);

  const searchResults = useQuery(
    api.products.search,
    debouncedSearch.trim().length > 1 ? { query: debouncedSearch } : "skip"
  );

  const { results: browseResults, status, loadMore } = usePaginatedQuery(
    api.products.list,
    { categoryId: selectedCategoryId, activeOnly: true },
    { initialNumItems: 12 }
  );

  const isSearching = debouncedSearch.trim().length > 1;
  const products = isSearching ? searchResults : browseResults;
  const isLoading = !categories || (!isSearching && status === "LoadingFirstPage");

  const selectCategory = useCallback((id: Id<"categories"> | undefined) => {
    setSelectedCategoryId(id);
    setSearch("");
    setDebouncedSearch("");
    if (id) {
      router.push(`/shop?category=${id}`);
    } else {
      router.push("/shop");
    }
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search */}
      <div className="relative mb-8 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        <Input
          placeholder="Search for groceries..."
          className="pl-10 pr-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            onClick={() => { setSearch(""); setDebouncedSearch(""); }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        <Button
          variant={!selectedCategoryId ? "default" : "outline"}
          size="sm"
          onClick={() => selectCategory(undefined)}
        >
          All
        </Button>
        {categories?.map((cat) => (
          <Button
            key={cat._id}
            variant={selectedCategoryId === cat._id ? "default" : "outline"}
            size="sm"
            onClick={() => selectCategory(cat._id)}
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
          {selectedCategoryId && (
            <Button className="mt-4" variant="outline" onClick={() => selectCategory(undefined)}>
              View all products
            </Button>
          )}
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
