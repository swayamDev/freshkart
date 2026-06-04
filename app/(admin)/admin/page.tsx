"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/primitives";
import { Skeleton } from "@/components/ui/primitives";
import { formatPrice, formatDate } from "@/lib/utils";
import { ShoppingBag, Users, Package, TrendingUp } from "lucide-react";

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  confirmed: "default",
  processing: "default",
  dispatched: "outline",
  delivered: "default",
  cancelled: "destructive",
  refunded: "secondary",
  pending: "secondary",
};

export default function AdminDashboard() {
  const recentOrders = useQuery(api.orders.adminRecentOrders);

  const stats = [
    {
      label: "Recent Orders",
      value: recentOrders === undefined ? "—" : recentOrders.length,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Revenue (recent)",
      value:
        recentOrders === undefined
          ? "—"
          : formatPrice(recentOrders.reduce((s, o) => s + o.total, 0)),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    { label: "Active Products", value: "—", icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Customers", value: "—", icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
          Welcome back to FreshKart admin.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`${stat.bg} rounded-lg p-2.5 flex-shrink-0`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">
              No orders yet.
            </p>
          ) : (
            <div className="divide-y divide-[hsl(var(--border))]">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between py-3 gap-4">
                  <div>
                    <p className="text-sm font-mono font-medium">
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {formatDate(order._creationTime)} · {order.deliveryAddress.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={STATUS_COLORS[order.status] ?? "secondary"}>
                      {order.status}
                    </Badge>
                    <span className="text-sm font-semibold tabular-nums">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
