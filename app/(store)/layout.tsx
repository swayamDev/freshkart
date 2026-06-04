import { StoreNav } from "@/components/store/StoreNav";
import { CartDrawer } from "@/components/store/CartDrawer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreNav />
      <main className="flex-1">{children}</main>
      <CartDrawer />
      <footer className="border-t border-[hsl(var(--border))] py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
          © 2025 FreshKart. Fresh groceries delivered to your door.
        </div>
      </footer>
    </div>
  );
}
