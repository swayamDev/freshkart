"use client";

import { useCartStore } from "@/store/cart";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { X, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";

export function CartDrawer() {
  const { isSignedIn } = useAuth();
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearLocalCart = useCartStore((s) => s.clearCart);
  const mergeGuestCart = useMutation(api.cart.mergeGuestCart);

  // Merge local cart to DB when user signs in
  useEffect(() => {
    if (isSignedIn && items.length > 0) {
      mergeGuestCart({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }).catch(() => {});
    }
  }, [isSignedIn]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[hsl(var(--background))] shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2 font-semibold">
            <ShoppingCart className="h-5 w-5" />
            Cart ({items.length})
          </div>
          <Button variant="ghost" size="icon" onClick={closeCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
              <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Your cart is empty</p>
              <p className="text-xs mt-1">Add some products to get started.</p>
              <Button className="mt-4" size="sm" onClick={closeCart} asChild>
                <Link href="/shop">Browse Products</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                <div className="h-14 w-14 rounded-md bg-[hsl(var(--muted))] overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xl">🥦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {formatPrice(item.price)} each
                    {item.unit ? ` · per ${item.unit}` : ""}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center border border-[hsl(var(--border))] rounded-md">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-r-none"
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-l-none"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            Math.min(item.stock, item.quantity + 1)
                          )
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]"
                      onClick={() => removeItem(item.productId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm font-semibold flex-shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[hsl(var(--border))] px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Delivery calculated at checkout
            </p>
            <Button className="w-full" onClick={closeCart} asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[hsl(var(--muted-foreground))]"
              onClick={() => clearLocalCart()}
            >
              Clear cart
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
