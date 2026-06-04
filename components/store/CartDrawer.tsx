"use client";

import { useCartStore } from "@/store/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export function CartDrawer() {
  const { isSignedIn } = useAuth();
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal } = useCartStore();
  const DELIVERY_FEE = 399;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="px-6 py-4 border-b border-[hsl(var(--border))]">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
            {items.length > 0 && (
              <span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <ShoppingCart className="h-12 w-12 text-[hsl(var(--muted-foreground))]" />
            <p className="text-[hsl(var(--muted-foreground))] text-center">Your cart is empty</p>
            <Button onClick={closeCart} asChild>
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-[hsl(var(--muted))] flex-shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-2xl">🥦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto text-[hsl(var(--destructive))]"
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-[hsl(var(--border))] space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                <span>{formatPrice(subtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Delivery</span>
                <span className="text-[hsl(var(--muted-foreground))]">from {formatPrice(DELIVERY_FEE)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(subtotal() + DELIVERY_FEE)}</span>
              </div>
              <Button
                className="w-full"
                onClick={closeCart}
                asChild
              >
                <Link href={isSignedIn ? "/checkout" : "/sign-in?redirect_url=/checkout"}>
                  {isSignedIn ? "Proceed to Checkout" : "Sign in to Checkout"}
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
