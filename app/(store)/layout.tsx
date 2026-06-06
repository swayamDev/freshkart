import { StoreNav } from "@/components/store/StoreNav";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <StoreNav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[hsl(var(--border))] py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        © {new Date().getFullYear()} FreshKart. All rights reserved.
      </footer>
    </div>
  );
}
