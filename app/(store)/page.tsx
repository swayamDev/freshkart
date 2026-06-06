"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductCard } from "@/components/store/ProductCard";
import { Skeleton } from "@/components/ui/primitives";
import {
  ChevronRight,
  Star,
  MapPin,
  Store,
  Truck,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

/* ─── Placeholder data for purely static sections ─── */
const CATEGORIES = [
  { label: "Vegetables", emoji: "🥦", bg: "#e8f5e9" },
  { label: "Bakery", emoji: "🍞", bg: "#fff8e1" },
  { label: "Fruits", emoji: "🍎", bg: "#fce4ec" },
  { label: "Meat", emoji: "🥩", bg: "#ffebee" },
  { label: "Fresh Fish", emoji: "🐟", bg: "#e3f2fd" },
  { label: "Beverages", emoji: "🧃", bg: "#f3e5f5" },
];

const LIMITED_PRODUCTS = [
  {
    name: "KauFrasi Orchards Fresh Michizum Apples",
    price: "$1.25",
    compare: "$1.48",
    img: "🍎",
    tag: "hot",
    avail: "61kg",
  },
  {
    name: "The banana passionfruit that is very popular in Malaysia",
    price: "$0.40",
    compare: "$0.54",
    img: "🍌",
    avail: "30kg",
  },
  {
    name: "Organic 100% Italian Fresh 100% natural Avocado",
    price: "$12.35",
    compare: "$14.50",
    img: "🥑",
    avail: "15kg",
  },
  {
    name: "Arabian local Beef Meat Kirkland Signature Roast",
    price: "$24.00",
    compare: "$28.00",
    img: "🥩",
    tag: "sale",
    avail: "57kg",
  },
];

const BEST_DEALS = [
  {
    name: "Organic Green Big Sweet Pepper Bottle – Capsicum",
    price: "$24.00",
    compare: "$28.00",
    rating: 4.5,
    img: "🫑",
  },
  {
    name: "Saucy Tapatio Spicy 4 Flavors of Korean Tapatio",
    price: "$0.40",
    compare: "$0.54",
    rating: 4.3,
    img: "🌶️",
  },
  {
    name: "The banana passionfruit fruit is very popular in Malaysia",
    price: "$0.40",
    compare: null,
    rating: 4.6,
    img: "🍌",
  },
  {
    name: "Organic 100% Italian fresh 100% natural Avocado",
    price: "$12.35",
    compare: "$14.50",
    rating: 4.2,
    img: "🥑",
  },
  {
    name: "Hidder Brooth Extra Long Grain Natural Honey",
    price: "$13.25",
    compare: "$15.00",
    rating: 4.7,
    img: "🍯",
  },
  {
    name: "APPLE – Flavorful & Nutritious Fresh Treat Honey",
    price: "$30.25",
    compare: "$35.00",
    rating: 4.4,
    img: "🍏",
  },
  {
    name: "Arabian local Beef Meat Kirkland Signature Roast",
    price: "$24.00",
    compare: null,
    rating: 4.1,
    img: "🥩",
  },
  {
    name: "Saucy Tapatio Spicy 4 Flavors of Korean Tapatio",
    price: "$0.40",
    compare: "$0.54",
    rating: 4.3,
    img: "🌶️",
  },
];

const BRANDS = [
  "Sunbulah",
  "Dajakk",
  "Sahana",
  "Halls",
  "Coco Bliss",
  "Jami",
  "Spread",
  "Arla",
  "CIFDA",
  "Grifffen",
];

const BEST_SELLING = [
  {
    name: "Lemon Big South Africa",
    price: "$4.40",
    compare: "$5.20",
    rating: 4.5,
    img: "🍋",
    badge: "hot",
  },
  {
    name: "Al Shifa Natural Honey",
    price: "$30.25",
    compare: "$35.00",
    rating: 4.7,
    img: "🍯",
    badge: "sale",
  },
  {
    name: "Taaj Mart Full Cream Fresh Milk",
    price: "$24.00",
    compare: "$28.00",
    rating: 4.3,
    img: "🥛",
  },
  {
    name: "Garden Chicken Cube Selenium",
    price: "$12.35",
    compare: "$14.50",
    rating: 4.1,
    img: "🫙",
  },
];

const FAQS = [
  {
    q: "Does Taaj Mart offer organic produce?",
    a: "Yes, Taaj Mart offers a selection of organic fruits and vegetables. These items are clearly labeled in the produce section.",
  },
  {
    q: "How do I place an order?",
    a: "You can browse our products, add them to cart, and checkout through our website or mobile app.",
  },
  {
    q: "Is there a minimum order value for delivery?",
    a: "There is no minimum order for delivery, but free delivery applies to orders above a certain threshold.",
  },
  {
    q: "Does Taaj Mart offer sustainably sourced seafood?",
    a: "Yes, Taaj Mart offer sustainably sourced seafood!",
  },
  {
    q: "What is Taaj Mart's return policy for fresh groceries?",
    a: "We offer a freshness guarantee. If you are not satisfied, contact us within 24 hours.",
  },
];

const TESTIMONIALS = [
  {
    name: "Tamar Abaymund Tenbe",
    rating: 5,
    text: "I've been shopping at Taaj Mart for over a year now and the quality of produce is consistently excellent. The delivery is always prompt and the staff are incredibly helpful.",
  },
  {
    name: "Buhina Rahman",
    rating: 5,
    text: "Taaj Mart has made grocery shopping so much easier for me. The variety of organic and locally-sourced products is impressive, and I love knowing exactly where my food comes from.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">({rating})</span>
    </div>
  );
}

function StockBar({ pct }: { pct: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div
        className="h-1.5 rounded-full bg-orange-400"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {href && (
        <Link
          href={href}
          className="text-sm text-[hsl(var(--primary))] flex items-center gap-1 hover:underline font-medium"
        >
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const featured = useQuery(api.products.getFeatured);
  const categories = useQuery(api.categories.list);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [dealTab, setDealTab] = useState("All Products");

  const dealTabs = [
    "All Products",
    "Frozen Food",
    "Vegetables",
    "Bakery",
    "Drinks",
    "Meat",
    "Chocolate",
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ── HERO ── */}
      <section className="bg-[#c0392b] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-10 flex items-center justify-between gap-8">
          <div className="flex-1 max-w-lg">
            <p className="text-orange-300 text-sm font-semibold mb-2 tracking-wide uppercase">
              Get Free Delivery On Your First Order
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
              We deliver groceries
              <br />
              <span className="text-orange-300">to your doorstep</span>
            </h1>
            <p className="text-red-100 text-sm mb-6 max-w-sm">
              Get the freshest groceries delivered right to your home. Save
              time, skip the lines, and enjoy the convenience of shopping from
              anywhere.
            </p>
            <button className="bg-[#e67e22] hover:bg-[#d35400] text-white font-bold px-7 py-3 rounded-full transition-colors text-sm shadow-lg">
              Shop Now →
            </button>
          </div>
          <div className="hidden md:flex flex-col items-center">
            <div
              className="text-9xl select-none"
              style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.3))" }}
            >
              🧑‍🌾
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-7xl">🥦</div>
            <div className="text-7xl">🍅</div>
            <div className="text-7xl">🥕</div>
          </div>
        </div>
      </section>

      {/* ── SHOP BY CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <SectionHeader title="Shop by categories" href="/shop" />
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={`/shop?category=${cat.label.toLowerCase()}`}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <span className="text-xs font-semibold text-gray-700 text-center">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── LIMITED PRODUCTS ── */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <SectionHeader title="Limited products" href="/shop" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {LIMITED_PRODUCTS.map((p, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative p-4 flex justify-center text-6xl bg-gray-50">
                {p.tag === "hot" && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    HOT
                  </span>
                )}
                {p.tag === "sale" && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    SALE
                  </span>
                )}
                {p.img}
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-700 font-medium leading-tight line-clamp-2 mb-2 min-h-[2.5rem]">
                  {p.name}
                </p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-sm">
                    {p.price}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    {p.compare}
                  </span>
                </div>
                <StockBar pct={40 + i * 15} />
                <p className="text-[10px] text-gray-400 mt-1">
                  Available:{" "}
                  <span className="text-green-600 font-semibold">
                    {p.avail}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROMO BANNERS ── */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Green organic banner */}
          <div className="rounded-2xl bg-[#1a5c2a] p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div>
              <p className="text-green-300 text-xs font-semibold uppercase tracking-wider mb-1">
                Organic Food Get 10% OFF
              </p>
              <h3 className="text-white text-xl font-black leading-snug mb-3">
                Taaj Mart provided
                <br />
                <span className="text-green-300">Fresh groceries</span>
                <br />
                every day for the people
              </h3>
              <button className="bg-white text-green-800 font-bold text-xs px-4 py-2 rounded-full hover:bg-green-50 transition-colors">
                Shop Now →
              </button>
            </div>
            <div className="absolute right-4 bottom-2 text-6xl">🫑</div>
          </div>
          {/* Yellow big offer */}
          <div className="rounded-2xl bg-[#f5c842] p-6 relative overflow-hidden flex flex-col justify-center min-h-[160px]">
            <div>
              <h3 className="text-gray-900 text-2xl font-black mb-1">
                Big Offer
              </h3>
              <p className="text-gray-700 text-sm font-semibold mb-3">
                Open Your Box
              </p>
              <button className="bg-[#e67e22] text-white font-bold text-xs px-5 py-2 rounded-full hover:bg-[#d35400] transition-colors">
                Grab the Offer →
              </button>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-6xl">
              🎁
            </div>
          </div>
        </div>

        {/* Second row banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="rounded-2xl bg-[#7b2d00] p-6 relative overflow-hidden flex flex-col justify-between min-h-[130px]">
            <div>
              <p className="text-orange-300 text-xs font-semibold uppercase mb-1">
                Enjoy with all – 20% OFF
              </p>
              <h3 className="text-white text-lg font-black">
                Enjoy your lunch with
                <br />
                <span className="text-orange-300">Delicious Beef Meat</span>
              </h3>
              <button className="mt-3 bg-white text-red-800 font-bold text-xs px-4 py-1.5 rounded-full hover:bg-red-50 transition-colors">
                Shop Now →
              </button>
            </div>
            <div className="absolute right-4 bottom-2 text-5xl">🥩</div>
          </div>
          <div className="rounded-2xl bg-[#f9f3e0] border border-orange-200 p-6 relative overflow-hidden flex flex-col justify-center min-h-[130px]">
            <div>
              <div className="text-5xl font-black text-[#c0392b] mb-1">
                40% <span className="text-gray-900">OFF</span>
              </div>
              <p className="text-gray-600 text-sm font-medium mb-3">
                We are willing to make you an offer
              </p>
              <button className="bg-[#c0392b] text-white font-bold text-xs px-5 py-2 rounded-full hover:bg-red-800 transition-colors">
                Grab the Offer →
              </button>
            </div>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-5xl">
              🍎
            </div>
          </div>
        </div>
      </section>

      {/* ── TODAY'S BEST DEALS ── */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <SectionHeader title="Today best deals for you!" href="/shop" />
        {/* Tab bar */}
        <div className="flex gap-2 flex-wrap mb-4">
          {dealTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setDealTab(tab)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                dealTab === tab
                  ? "bg-[#c0392b] text-white border-[#c0392b]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-red-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BEST_DEALS.map((p, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative p-4 flex justify-center text-5xl bg-gray-50">
                {p.img}
              </div>
              <div className="p-3">
                <StarRating rating={p.rating} />
                <p className="text-xs text-gray-700 font-medium mt-1 line-clamp-2 min-h-[2.5rem]">
                  {p.name}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="font-bold text-gray-900 text-sm">
                      {p.price}
                    </span>
                    {p.compare && (
                      <span className="text-xs text-gray-400 line-through ml-1">
                        {p.compare}
                      </span>
                    )}
                  </div>
                  <button className="w-7 h-7 rounded-full bg-[#c0392b] text-white flex items-center justify-center text-lg font-bold hover:bg-red-800 transition-colors">
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CASHBACK SUBSCRIPTION BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="rounded-2xl bg-[#fff8e1] border border-orange-200 p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div>
            <h3 className="text-2xl font-black text-gray-900 mb-1">
              Get 20% Cash Back
            </h3>
            <p className="text-lg font-bold text-gray-900 mb-1">
              All the Time with a
            </p>
            <p className="text-2xl font-black text-[#c0392b] mb-4">
              Subscription!
            </p>
            <p className="text-sm text-gray-500 mb-4">
              On all grocery shopping
            </p>
            <button className="bg-[#c0392b] text-white font-bold px-6 py-2.5 rounded-full hover:bg-red-800 transition-colors text-sm">
              Get Subscription →
            </button>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-8xl">🛍️</div>
          </div>
        </div>
      </section>

      {/* ── SHOP BY BRANDS ── */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <SectionHeader title="Shop by brands" />
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            {BRANDS.map((brand) => (
              <div
                key={brand}
                className="px-4 py-2 rounded-xl bg-gray-50 text-sm font-bold text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors border border-gray-100 hover:border-gray-300"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── UAE DELIVERY BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="rounded-2xl bg-[#1a3c1a] p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div>
            <h3 className="text-white text-2xl font-black leading-snug mb-3">
              We deliver groceries
              <br />
              throughout the{" "}
              <span className="text-green-400">
                United
                <br />
                Arab Emirates
              </span>
            </h3>
            <p className="text-green-200 text-sm mb-4 max-w-sm">
              Get the freshest groceries delivered right to your home. Save
              time, skip the lines, and enjoy the convenience of shopping for
              any day.
            </p>
            <button className="bg-[#e67e22] text-white font-bold px-6 py-2.5 rounded-full hover:bg-[#d35400] transition-colors text-sm">
              Start Shopping →
            </button>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-black text-white">33</div>
              <div className="text-green-300 text-xs">Taaj Mart Shops</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white">1600</div>
              <div className="text-green-300 text-xs">Delivery (km)</div>
            </div>
            <div className="text-5xl hidden sm:block">🗺️</div>
          </div>
        </div>
      </section>

      {/* ── BEST SELLING PRODUCTS (or convex featured if available) ── */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <SectionHeader title="Best selling products" href="/shop" />

        {featured === undefined ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : featured && featured.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featured.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                name={product.name}
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                imageUrl={product.imageUrl ?? null}
                slug={product.slug}
                stock={product.stock}
                unit={product.unit}
              />
            ))}
          </div>
        ) : (
          /* fallback static best-sellers */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BEST_SELLING.map((p, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative p-4 flex justify-center text-6xl bg-gray-50">
                  {p.badge === "hot" && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      HOT
                    </span>
                  )}
                  {p.badge === "sale" && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      SALE
                    </span>
                  )}
                  {p.img}
                </div>
                <div className="p-3">
                  <StarRating rating={p.rating} />
                  <p className="text-xs text-gray-700 font-medium mt-1 line-clamp-2 min-h-[2rem]">
                    {p.name}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="font-bold text-gray-900 text-sm">
                        {p.price}
                      </span>
                      <span className="text-xs text-gray-400 line-through ml-1">
                        {p.compare}
                      </span>
                    </div>
                    <button className="w-7 h-7 rounded-full bg-[#c0392b] text-white flex items-center justify-center text-lg font-bold hover:bg-red-800 transition-colors">
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Person image placeholder */}
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <div className="text-8xl mb-2">👨‍🌾</div>
              <p className="text-green-800 font-bold text-lg">
                Fresh & Organic
              </p>
            </div>
          </div>
          {/* FAQ items */}
          <div>
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-gray-200 last:border-0">
                <button
                  className="w-full text-left py-4 flex items-center justify-between gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-gray-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <p className="text-xs text-gray-600 pb-4 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <SectionHeader title="What our customers say" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 ${i === 0 ? "bg-gray-100" : "bg-[#c0392b]"}`}
            >
              <div className="text-3xl text-gray-400 font-serif mb-3">"</div>
              <p
                className={`text-sm leading-relaxed mb-4 ${i === 0 ? "text-gray-700" : "text-red-100"}`}
              >
                {t.text}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-gray-600">
                  {t.name[0]}
                </div>
                <div>
                  <p
                    className={`text-sm font-bold ${i === 0 ? "text-gray-900" : "text-white"}`}
                  >
                    {t.name}
                  </p>
                  <StarRating rating={t.rating} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUALITY FOOTER BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="text-center py-8">
          <h2 className="text-2xl font-black text-gray-900 mb-1">
            We Provide the <span className="text-[#c0392b]">Best Quality</span>
          </h2>
          <p className="text-lg font-bold text-gray-900 mb-4">
            in All of the UAE
          </p>
          <p className="text-xs text-gray-500 max-w-lg mx-auto">
            Offering premium quality fresh produce, meats, dairy, and more,
            delivered fresh directly to your doorstep anywhere across the UAE.
          </p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-center">
          {[
            { icon: "🎁", label: "Taaj Mart Gift Card" },
            { icon: "🎟️", label: "Present a Gift Card" },
            { icon: "🛒", label: "Order and Collect" },
            { icon: "📄", label: "Pay your Utility Invoice" },
            { icon: "🚚", label: "Delivery within 30mins" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-gray-100 hover:shadow-sm transition-shadow"
            >
              <span className="text-3xl">{item.icon}</span>
              <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
