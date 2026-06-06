"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/primitives";
import { Badge } from "@/components/ui/primitives";
import { Users, Shield } from "lucide-react";
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
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          All registered users.
        </p>
      </div>

      {status === "LoadingFirstPage" ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-[hsl(var(--muted-foreground))]">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
            No customers yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <Card key={user._id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {user.name ?? "No name"}
                    </p>
                    {user.isAdmin && (
                      <Badge variant="outline" className="text-purple-600 border-purple-300 text-[10px]">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                    {user.email} · Joined {formatDate(user._creationTime)}
                  </p>
                  {user.address && (
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      📍 {user.address.city}, {user.address.country}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {status === "CanLoadMore" && (
            <div className="flex justify-center">
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
