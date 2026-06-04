"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/primitives";
import { Users, MapPin } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminCustomersPage() {
  const { results: users, status, loadMore } = usePaginatedQuery(
    api.users.listUsers,
    {},
    { initialNumItems: 20 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">View all registered customers.</p>
      </div>

      {status === "LoadingFirstPage" ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-[hsl(var(--muted-foreground))]">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            No customers yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user._id}>
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user.name ?? "—"}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {user.address ? (
                    <span className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {user.address.city}
                    </span>
                  ) : (
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">No address</span>
                  )}
                  {user.isAdmin && <Badge variant="secondary">Admin</Badge>}
                  <span className="text-xs text-[hsl(var(--muted-foreground))] hidden sm:block">
                    Joined {formatDate(user._creationTime)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {status === "CanLoadMore" && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => loadMore(20)}>Load more</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
