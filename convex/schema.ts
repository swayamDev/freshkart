import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    address: v.optional(
      v.object({
        line1: v.string(),
        line2: v.optional(v.string()),
        city: v.string(),
        state: v.string(),
        postcode: v.string(),
        country: v.string(),
      })
    ),
    isAdmin: v.optional(v.boolean()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    sortOrder: v.optional(v.number()),
  })
    .index("by_slug", ["slug"]),

  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    price: v.number(), // in pence/cents
    compareAtPrice: v.optional(v.number()),
    categoryId: v.id("categories"),
    imageId: v.optional(v.id("_storage")),
    stock: v.number(),
    unit: v.optional(v.string()), // e.g. "kg", "each", "bunch"
    isActive: v.boolean(),
    isFeatured: v.optional(v.boolean()),
    stripePriceId: v.optional(v.string()),
    stripeProductId: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["categoryId"])
    .index("by_active", ["isActive"])
    .index("by_category_and_active", ["categoryId", "isActive"])
    .index("by_featured", ["isFeatured"])
    .searchIndex("search_products", {
      searchField: "name",
      filterFields: ["categoryId", "isActive"],
    }),

  cart: defineTable({
    userId: v.string(), // clerkId / tokenIdentifier
    productId: v.id("products"),
    quantity: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"]),

  favourites: defineTable({
    userId: v.string(),
    productId: v.id("products"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_product", ["userId", "productId"]),

  orders: defineTable({
    userId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("processing"),
      v.literal("dispatched"),
      v.literal("delivered"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
    total: v.number(), // in pence/cents
    subtotal: v.number(),
    deliveryFee: v.number(),
    stripeSessionId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    deliveryAddress: v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      postcode: v.string(),
      country: v.string(),
    }),
    notes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_stripe_session", ["stripeSessionId"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    productName: v.string(), // snapshot at time of order
    productImageId: v.optional(v.id("_storage")),
    quantity: v.number(),
    unitPrice: v.number(),
    totalPrice: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_product", ["productId"]),

  reservations: defineTable({
    userId: v.string(),
    productId: v.id("products"),
    quantity: v.number(),
    stripeSessionId: v.string(),
    expiresAt: v.number(), // timestamp
  })
    .index("by_session", ["stripeSessionId"])
    .index("by_user", ["userId"]),
});
