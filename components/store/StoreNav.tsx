"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, User, Leaf } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { CartDrawer } from "./CartDrawer";

export function StoreNav() {
  const { isSignedIn } = useAuth();
  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openCart);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-[hsl(var(--primary))] shrink-0"
          >
            <Leaf className="h-5 w-5" />
            FreshKart
          </Link>

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/shop"
              className="px-3 py-1.5 text-sm rounded-md hover:bg-[hsl(var(--muted))] transition-colors"
            >
              Shop
            </Link>
            <Link
              href="/membership"
              className="px-3 py-1.5 text-sm rounded-md hover:bg-[hsl(var(--muted))] transition-colors"
            >
              Membership
            </Link>
            {isSignedIn && (
              <Link
                href="/orders"
                className="px-3 py-1.5 text-sm rounded-md hover:bg-[hsl(var(--muted))] transition-colors"
              >
                Orders
              </Link>
            )}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-1">
            {isSignedIn && (
              <Button variant="ghost" size="icon" asChild>
                <Link href="/favourites">
                  <Heart className="h-5 w-5" />
                </Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={openCart}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[hsl(var(--primary))] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Button>

            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Button size="sm" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <CartDrawer />
    </>
  );
}
