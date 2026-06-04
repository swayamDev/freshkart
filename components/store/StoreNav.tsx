"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";

import { ShoppingCart, Heart, Search, Leaf, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { Badge } from "@/components/ui/primitives";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function StoreNav() {
  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);

  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = usePathname();

  const navLinks = [
    { href: "/shop", label: "Shop" },
    { href: "/shop?category=fruit-veg", label: "Fruit & Veg" },
    { href: "/shop?category=dairy", label: "Dairy" },
    { href: "/shop?category=bakery", label: "Bakery" },
    { href: "/membership", label: "Membership" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-[hsl(var(--primary))]"
        >
          <Leaf className="h-6 w-6" />
          FreshKart
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "transition-colors hover:text-[hsl(var(--foreground))]",
                pathname === link.href
                  ? "font-medium text-[hsl(var(--foreground))]"
                  : "text-[hsl(var(--muted-foreground))]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/shop">
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
          </Link>

          <Show when="signed-in">
            <Link href="/favourites">
              <Button variant="ghost" size="icon" aria-label="Favourites">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
          </Show>

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={openCart}
            aria-label="Open cart"
          >
            <ShoppingCart className="h-5 w-5" />

            {itemCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-xs">
                {itemCount > 99 ? "99+" : itemCount}
              </Badge>
            )}
          </Button>

          <Show when="signed-in">
            <UserButton />
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal" fallbackRedirectUrl="/">
              <Button size="sm">Sign in</Button>
            </SignInButton>
          </Show>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-1 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
