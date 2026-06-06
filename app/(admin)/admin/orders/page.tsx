"use client";

import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label, Textarea } from "@/components/ui/primitives";
import { formatPrice, formatDate } from "@/lib/utils";
import { Package, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "dispatched",
  "delivered",
  "cancelled",
  "refunded",
];

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  processing: "default",
  dispatched: "outline",
  delivered: "default",
  cancelled: "destructive",
  refunded: "secondary",
};

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<Id<"orders"> | null>(null);
  const [editingOrder, setEditingOrder] = useState<{
    id: Id<"orders">;
    status: string;
    notes?: string;
  } | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  const { results: orders, status, loadMore } = usePaginatedQuery(
    api.orders.adminListOrders,
    { status: statusFilter },
    { initialNumItems: 15 }
  );

  const updateStatus = useMutation(api.orders.adminUpdateStatus);

  const openEdit = (order: { _id: Id<"orders">; status: string; notes?: string }) => {
    setEditingOrder({ id: order._id, status: order.status, notes: order.notes });
    setNewStatus(order.status);
    setNotes(order.notes ?? "");
  };

  const handleUpdate = async () => {
    if (!editingOrder) return;
    try {
      await updateStatus({
        orderId: editingOrder.id,
        status: newStatus,
        notes: notes || undefined,
      });
      toast.success("Order updated");
      setEditingOrder(null);
    } catch {
      toast.error("Failed to update order");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
            Manage and update customer orders.
          </p>
        </div>

        <Select
          value={statusFilter ?? "all"}
          onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {status === "LoadingFirstPage" ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-[hsl(var(--muted-foreground))]">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
            No orders found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            if (!order) return null;
            const isExpanded = expandedId === order._id;
            return (
              <Card key={order._id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-sm font-medium">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                        <Badge variant={STATUS_COLORS[order.status] ?? "secondary"} className="capitalize">
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                        {formatDate(order._creationTime)} ·{" "}
                        {order.deliveryAddress.line1},{" "}
                        {order.deliveryAddress.city}
                      </p>
                      <p className="text-sm font-semibold mt-1">
                        {formatPrice(order.total)}
                        <span className="text-xs font-normal text-[hsl(var(--muted-foreground))] ml-2">
                          ({order.items?.length ?? 0} items)
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(order)}
                      >
                        Update
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : order._id)
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded items */}
                  {isExpanded && order.items && (
                    <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-[hsl(var(--muted-foreground))]">
                            {item.productName} × {item.quantity}
                          </span>
                          <span>{formatPrice(item.totalPrice)}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-[hsl(var(--border))] flex justify-between text-sm">
                        <span className="text-[hsl(var(--muted-foreground))]">
                          Delivery
                        </span>
                        <span>
                          {order.deliveryFee === 0
                            ? "Free"
                            : formatPrice(order.deliveryFee)}
                        </span>
                      </div>
                      {order.notes && (
                        <p className="text-xs text-[hsl(var(--muted-foreground))] italic">
                          Note: {order.notes}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {status === "CanLoadMore" && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => loadMore(15)}>
                Load more
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Update status dialog */}
      <Dialog open={!!editingOrder} onOpenChange={(v) => !v && setEditingOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Dispatched via Royal Mail..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOrder(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
