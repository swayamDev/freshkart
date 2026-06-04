"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users, Leaf, X, Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-[hsl(var(--sidebar-border))]">
        <Leaf className="h-6 w-6 text-[hsl(var(--primary))]" />
        <div>
          <p className="font-bold text-sm">FreshKart</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNav}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]"
                  : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]/50"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[hsl(var(--sidebar-border))] flex items-center gap-3">
        <UserButton afterSignOutUrl="/" />
        <div className="text-xs text-[hsl(var(--muted-foreground))]">Admin account</div>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Leaf className="h-5 w-5 text-[hsl(var(--primary))]" />
          FreshKart Admin
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-[hsl(var(--sidebar-background))] h-full shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
