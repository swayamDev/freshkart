import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Leaf, Truck, Star, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/60 rounded-full px-4 py-2 text-sm text-[hsl(var(--primary))] font-medium">
            <Leaf className="h-4 w-4" />
            Fresh. Fast. Delivered.
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
            Groceries delivered<br />
            <span className="text-[hsl(var(--primary))]">fresh to your door</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Shop thousands of fresh groceries, seasonal produce, and everyday essentials. Delivered same-day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/shop">Start Shopping</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/membership">Get Free Delivery</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Truck, title: "Same-day delivery", desc: "Order before 1pm for same-day delivery to your door." },
            { icon: Star, title: "Always fresh", desc: "Hand-picked produce from local farms and trusted suppliers." },
            { icon: Shield, title: "Freshness guarantee", desc: "Not happy? We'll replace it or refund you. No questions." },
          ].map((f) => (
            <div key={f.title} className="text-center space-y-3">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <f.icon className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
