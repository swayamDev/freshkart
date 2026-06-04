"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCartStore } from "@/store/cart";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/primitives";
import { formatPrice, formatDate } from "@/lib/utils";
import { Package, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "secondary",
  confirmed: "default",
  processing: "default",
  dispatched: "outline",
  delivered: "default",
  cancelled: "destructive",
  refunded: "secondary",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed ✓",
  processing: "Processing",
  dispatched: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const clearCart = useCartStore((s) => s.clearCart);

  const { results: orders, status, loadMore } = usePaginatedQuery(
    api.orders.getMyOrders,
    {},
    { initialNumItems: 5 }
  );

  // Clear Zustand cart on successful payment redirect
  useEffect(() => {
    if (success === "true") {
      clearCart();
      toast.success("Order placed successfully! 🎉");
    }
  }, [success, clearCart]);

  if (status === "LoadingFirstPage") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <Package className="h-6 w-6" />
        My Orders
      </h1>

      {success === "true" && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Payment successful!</p>
            <p className="text-sm">Your order has been confirmed and is being prepared.</p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 text-[hsl(var(--muted-foreground))]">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No orders yet</p>
          <p className="text-sm mt-1">Your orders will appear here once you make a purchase.</p>
          <Button className="mt-6" asChild>
            <a href="/shop">Start Shopping</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            order && (
              <Card key={order._id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-sm font-mono text-[hsl(var(--muted-foreground))]">
                      #{order._id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        {formatDate(order._creationTime)}
                      </span>
                      <Badge variant={STATUS_COLORS[order.status] as "default" | "secondary" | "destructive" | "outline"}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Items */}
                  <div className="space-y-2">
                    {order.items?.slice(0, 3).map((item) => (
                      <div key={item._id} className="flex justify-between text-sm">
                        <span className="text-[hsl(var(--muted-foreground))]">
                          {item.productName} × {item.quantity}
                        </span>
                        <span>{formatPrice(item.totalPrice)}</span>
                      </div>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">
                      {order.deliveryAddress.line1}, {order.deliveryAddress.city}
                    </div>
                    <div className="text-sm font-semibold">
                      {formatPrice(order.total)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ))}

          {status === "CanLoadMore" && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => loadMore(5)}>
                Load more orders
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
