"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/primitives";
import { AddressDialog } from "@/components/store/AddressDialog";
import { formatPrice } from "@/lib/utils";
import { MapPin, Package, Truck, Crown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

const DELIVERY_FEE = 399;

export default function CheckoutPage() {
  const router = useRouter();
  const profile = useQuery(api.users.getMyProfile);
  const cartItems = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const createCheckout = useAction(api.checkout.createCheckoutSession);

  const hasAddress = !!profile?.address;
  // Clerk Billing membership check via publicMetadata
  const isMember = false; // Will be resolved server-side; shown UI only
  const deliveryFee = isMember ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  if (cartItems.length === 0) {
    router.replace("/shop");
    return null;
  }

  const handleCheckout = async () => {
    if (!hasAddress) {
      setShowAddressDialog(true);
      return;
    }
    setLoading(true);
    try {
      const result = await createCheckout({
        successUrl: `${window.location.origin}/orders?success=true`,
        cancelUrl: `${window.location.origin}/checkout`,
      });
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === "ADDRESS_REQUIRED") {
        setShowAddressDialog(true);
      } else {
        toast.error("Failed to start checkout. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Left: order details */}
        <div className="md:col-span-3 space-y-4">
          {/* Delivery address card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[hsl(var(--primary))]" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasAddress ? (
                <div className="space-y-1 text-sm">
                  <p>{profile.address!.line1}</p>
                  {profile.address!.line2 && <p>{profile.address!.line2}</p>}
                  <p>{profile.address!.city}, {profile.address!.state}</p>
                  <p>{profile.address!.postcode}</p>
                  <p>{profile.address!.country}</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-xs mt-2"
                    onClick={() => setShowAddressDialog(true)}
                  >
                    Change address
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    You need to add a delivery address before checking out.
                  </p>
                  <Button size="sm" onClick={() => setShowAddressDialog(true)}>
                    Add Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-[hsl(var(--primary))]" />
                Order Items ({cartItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex gap-3 items-center">
                  <div className="h-12 w-12 rounded-md bg-[hsl(var(--muted))] overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="object-cover w-full h-full" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xl">🥦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: order summary */}
        <div className="md:col-span-2">
          <Card className="sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm items-center">
                <span className="text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                  <Truck className="h-3 w-3" /> Delivery
                </span>
                {isMember ? (
                  <span className="text-[hsl(var(--primary))] font-medium flex items-center gap-1">
                    <Crown className="h-3 w-3" /> Free
                  </span>
                ) : (
                  <span>{formatPrice(DELIVERY_FEE)}</span>
                )}
              </div>

              {!isMember && (
                <div className="bg-green-50 rounded-md p-3 text-xs text-green-700">
                  <Crown className="h-3 w-3 inline mr-1" />
                  Get free delivery with{" "}
                  <a href="/membership" className="underline font-medium">FreshKart Membership</a>
                </div>
              )}

              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {!hasAddress && (
                <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] rounded-md p-2">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  Add a delivery address to continue
                </div>
              )}

              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading
                  ? "Redirecting to payment..."
                  : hasAddress
                  ? "Pay with Stripe"
                  : "Add Address & Pay"}
              </Button>

              <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
                Secured by Stripe · SSL encrypted
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddressDialog
        open={showAddressDialog}
        onSuccess={() => {
          setShowAddressDialog(false);
          toast.success("Address saved! You can now checkout.");
        }}
        onClose={() => setShowAddressDialog(false)}
      />
    </div>
  );
}
