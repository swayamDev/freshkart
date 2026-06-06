"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, Separator, Skeleton } from "@/components/ui/primitives";
import { formatPrice, formatDate } from "@/lib/utils";
import { ArrowLeft, Package, MapPin, Truck, CreditCard } from "lucide-react";

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
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
  confirmed: "Confirmed",
  processing: "Processing",
  dispatched: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const STATUS_STEPS = ["confirmed", "processing", "dispatched", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const order = useQuery(api.orders.getOrderById, {
    orderId: id as Id<"orders">,
  });

  if (order === undefined) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-[hsl(var(--muted-foreground))]">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium mb-4">Order not found</p>
        <Button asChild><Link href="/orders">Back to Orders</Link></Button>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Placed on {formatDate(order._creationTime)}
          </p>
        </div>
        <Badge variant={STATUS_COLORS[order.status] ?? "secondary"} className="text-sm px-3 py-1">
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      </div>

      {/* Progress tracker */}
      {!["cancelled", "refunded", "pending"].includes(order.status) && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {STATUS_STEPS.map((step, index) => {
                const isDone = currentStepIndex >= index;
                const isCurrent = currentStepIndex === index;
                return (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      {index > 0 && (
                        <div
                          className={`flex-1 h-1 ${isDone ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted))]"}`}
                        />
                      )}
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isDone
                            ? "bg-[hsl(var(--primary))] text-white"
                            : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                        } ${isCurrent ? "ring-2 ring-[hsl(var(--primary))] ring-offset-2" : ""}`}
                      >
                        {isDone ? "✓" : index + 1}
                      </div>
                      {index < STATUS_STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-1 ${
                            currentStepIndex > index
                              ? "bg-[hsl(var(--primary))]"
                              : "bg-[hsl(var(--muted))]"
                          }`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 text-center ${
                        isDone
                          ? "text-[hsl(var(--primary))] font-medium"
                          : "text-[hsl(var(--muted-foreground))]"
                      }`}
                    >
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Items ({order.items?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items?.map((item) => (
            <div key={item._id} className="flex gap-3 items-center">
              <div className="h-14 w-14 rounded-md bg-[hsl(var(--muted))] overflow-hidden flex-shrink-0">
                <div className="h-full w-full flex items-center justify-center text-2xl">🥦</div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.productName}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {formatPrice(item.unitPrice)} × {item.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(item.totalPrice)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {/* Delivery address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1 text-[hsl(var(--muted-foreground))]">
            <p>{order.deliveryAddress.line1}</p>
            {order.deliveryAddress.line2 && <p>{order.deliveryAddress.line2}</p>}
            <p>
              {order.deliveryAddress.city}, {order.deliveryAddress.state}
            </p>
            <p>{order.deliveryAddress.postcode}</p>
            <p>{order.deliveryAddress.country}</p>
          </CardContent>
        </Card>

        {/* Payment summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                <Truck className="h-3 w-3" /> Delivery
              </span>
              <span>
                {order.deliveryFee === 0 ? (
                  <span className="text-[hsl(var(--primary))]">Free</span>
                ) : (
                  formatPrice(order.deliveryFee)
                )}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            {order.stripePaymentIntentId && (
              <p className="text-xs text-[hsl(var(--muted-foreground))] pt-1">
                Payment ref: {order.stripePaymentIntentId.slice(-12)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {order.notes && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              <strong>Notes:</strong> {order.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
