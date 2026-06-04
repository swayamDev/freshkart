import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/auth";
import { paginationOptsValidator } from "convex/server";

const orderStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("processing"),
  v.literal("dispatched"),
  v.literal("delivered"),
  v.literal("cancelled"),
  v.literal("refunded")
);

export const getMyOrders = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const result = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .order("desc")
      .paginate(args.paginationOpts);

    const ordersWithItems = await Promise.all(
      result.page.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .take(50);
        const itemsWithImages = await Promise.all(
          items.map(async (item) => ({
            ...item,
            imageUrl: item.productImageId
              ? await ctx.storage.getUrl(item.productImageId)
              : null,
          }))
        );
        return { ...order, items: itemsWithImages };
      })
    );
    return { ...result, page: ordersWithItems };
  },
});

export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const order = await ctx.db.get(args.orderId);
    if (!order) return null;
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (order.userId !== identity.tokenIdentifier && !me?.isAdmin) {
      throw new Error("Forbidden");
    }
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", order._id))
      .take(50);
    return { ...order, items };
  },
});

// Called by Stripe webhook after successful payment
export const createFromCheckout = internalMutation({
  args: {
    userId: v.string(),
    stripeSessionId: v.string(),
    stripePaymentIntentId: v.optional(v.string()),
    deliveryAddress: v.object({
      line1: v.string(),
      line2: v.optional(v.string()),
      city: v.string(),
      state: v.string(),
      postcode: v.string(),
      country: v.string(),
    }),
    items: v.array(
      v.object({
        productId: v.id("products"),
        productName: v.string(),
        productImageId: v.optional(v.id("_storage")),
        quantity: v.number(),
        unitPrice: v.number(),
        totalPrice: v.number(),
      })
    ),
    subtotal: v.number(),
    deliveryFee: v.number(),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    // Idempotency check
    const existing = await ctx.db
      .query("orders")
      .withIndex("by_stripe_session", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .unique();
    if (existing) return existing._id;

    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      status: "confirmed",
      total: args.total,
      subtotal: args.subtotal,
      deliveryFee: args.deliveryFee,
      stripeSessionId: args.stripeSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      deliveryAddress: args.deliveryAddress,
    });

    await Promise.all(
      args.items.map((item) =>
        ctx.db.insert("orderItems", { orderId, ...item })
      )
    );

    // Clear the user's cart
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(200);
    await Promise.all(cartItems.map((item) => ctx.db.delete(item._id)));

    // Release any stock reservations
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_session", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .take(100);
    await Promise.all(reservations.map((r) => ctx.db.delete(r._id)));

    return orderId;
  },
});

// Admin: paginated — used by usePaginatedQuery on the orders page
export const adminListOrders = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(orderStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (args.status) {
      return await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("orders")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Admin: recent orders for dashboard (plain useQuery — no pagination)
export const adminRecentOrders = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("orders").order("desc").take(10);
  },
});

export const adminUpdateStatus = mutation({
  args: { orderId: v.id("orders"), status: orderStatusValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.orderId, { status: args.status });
  },
});
