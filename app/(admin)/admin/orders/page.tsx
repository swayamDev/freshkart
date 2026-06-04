"use client";

import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/primitives";
import { formatPrice, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "refunded";

const ALL_STATUSES: OrderStatus[] = [
  "pending","confirmed","processing","dispatched","delivered","cancelled","refunded",
];

const STATUS_COLORS: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  processing: "default",
  dispatched: "outline",
  delivered: "default",
  cancelled: "destructive",
  refunded: "secondary",
};

export default function AdminOrdersPage() {
  const [filterStatus, setFilterStatus] = useState<OrderStatus | undefined>();
  const updateStatus = useMutation(api.orders.adminUpdateStatus);

  const { results: orders, status, loadMore } = usePaginatedQuery(
    api.orders.adminListOrders,
    // Pass status filter; paginationOpts is injected automatically by usePaginatedQuery
    filterStatus ? { status: filterStatus } : {},
    { initialNumItems: 20 }
  );

  const handleStatusUpdate = async (orderId: Id<"orders">, newStatus: OrderStatus) => {
    try {
      await updateStatus({ orderId, status: newStatus });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Manage and fulfil customer orders.
          </p>
        </div>
        <Select
          value={filterStatus ?? "all"}
          onValueChange={(v) =>
            setFilterStatus(v === "all" ? undefined : (v as OrderStatus))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {status === "LoadingFirstPage" ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-[hsl(var(--muted-foreground))]">
            No orders found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start gap-4 justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-semibold">
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <Badge variant={STATUS_COLORS[order.status as OrderStatus] ?? "secondary"}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {formatDate(order._creationTime)} ·{" "}
                      {order.deliveryAddress.line1}, {order.deliveryAddress.city},{" "}
                      {order.deliveryAddress.postcode}
                    </p>
                    <p className="text-sm font-semibold">{formatPrice(order.total)}</p>
                  </div>

                  <Select
                    value={order.status}
                    onValueChange={(v) =>
                      handleStatusUpdate(order._id, v as OrderStatus)
                    }
                  >
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}

          {status === "CanLoadMore" && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => loadMore(20)}>
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
