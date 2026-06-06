import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireAdmin } from "./lib/auth";

export const getMyOrders = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], isDone: true, continueCursor: "" };

    const orderPage = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .order("desc")
      .paginate(args.paginationOpts);

    const ordersWithItems = await Promise.all(
      orderPage.page.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .take(100);
        return { ...order, items };
      })
    );

    return { ...orderPage, page: ordersWithItems };
  },
});

export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    // Users can only see their own orders; admins can see all
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();

    if (order.userId !== identity.tokenIdentifier && !me?.isAdmin) {
      return null;
    }

    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", order._id))
      .take(100);

    return { ...order, items };
  },
});

// Admin: paginated orders with optional status filter
export const adminListOrders = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    let orderPage;
    if (args.status) {
      orderPage = await ctx.db
        .query("orders")
        .withIndex("by_status", (q) => q.eq("status", args.status as any))
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      orderPage = await ctx.db
        .query("orders")
        .order("desc")
        .paginate(args.paginationOpts);
    }

    const ordersWithItems = await Promise.all(
      orderPage.page.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .take(100);
        return { ...order, items };
      })
    );

    return { ...orderPage, page: ordersWithItems };
  },
});

// Admin: recent orders for dashboard (no pagination)
export const adminRecentOrders = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("orders").order("desc").take(10);
  },
});

export const adminUpdateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.orderId, {
      status: args.status as any,
      ...(args.notes ? { notes: args.notes } : {}),
    });
  },
});

// Called internally from Stripe webhook
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
    // Idempotency: don't create duplicate orders for same Stripe session
    const existing = await ctx.db
      .query("orders")
      .withIndex("by_stripe_session", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .unique();
    if (existing) return existing._id;

    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      stripeSessionId: args.stripeSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      status: "confirmed",
      deliveryAddress: args.deliveryAddress,
      subtotal: args.subtotal,
      deliveryFee: args.deliveryFee,
      total: args.total,
    });

    // Insert order items
    await Promise.all(
      args.items.map((item) =>
        ctx.db.insert("orderItems", {
          orderId,
          productId: item.productId,
          productName: item.productName,
          productImageId: item.productImageId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })
      )
    );

    // Deduct stock for each product
    await Promise.all(
      args.items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await ctx.db.patch(item.productId, { stock: newStock });
        }
      })
    );

    // Clear user's server-side cart
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(200);
    await Promise.all(cartItems.map((ci) => ctx.db.delete(ci._id)));

    return orderId;
  },
});
