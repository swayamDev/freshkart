"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Leaf,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-[hsl(var(--background))] border-r border-[hsl(var(--border))] flex flex-col shrink-0">
      <div className="p-5 border-b border-[hsl(var(--border))]">
        <Link href="/" className="flex items-center gap-2 font-bold text-[hsl(var(--primary))]">
          <Leaf className="h-5 w-5" />
          FreshKart
        </Link>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[hsl(var(--border))] flex items-center gap-3">
        <UserButton afterSignOutUrl="/" />
        <span className="text-xs text-[hsl(var(--muted-foreground))]">Admin</span>
      </div>
    </aside>
  );
}
