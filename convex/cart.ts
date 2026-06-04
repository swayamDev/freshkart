import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMyCart = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const items = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .take(100);
    return await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) return null;
        const imageUrl = product.imageId
          ? await ctx.storage.getUrl(product.imageId)
          : null;
        return { ...item, product: { ...product, imageUrl } };
      })
    ).then((items) => items.filter(Boolean));
  },
});

export const addToCart = mutation({
  args: { productId: v.id("products"), quantity: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("cart")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", identity.tokenIdentifier).eq("productId", args.productId)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        quantity: existing.quantity + args.quantity,
      });
    } else {
      await ctx.db.insert("cart", {
        userId: identity.tokenIdentifier,
        productId: args.productId,
        quantity: args.quantity,
      });
    }
  },
});

export const updateQuantity = mutation({
  args: { cartItemId: v.id("cart"), quantity: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const item = await ctx.db.get(args.cartItemId);
    if (!item || item.userId !== identity.tokenIdentifier)
      throw new Error("Not found");
    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
    } else {
      await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
    }
  },
});

export const removeFromCart = mutation({
  args: { cartItemId: v.id("cart") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const item = await ctx.db.get(args.cartItemId);
    if (!item || item.userId !== identity.tokenIdentifier)
      throw new Error("Not found");
    await ctx.db.delete(args.cartItemId);
  },
});

export const clearCart = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const items = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .take(200);
    await Promise.all(items.map((item) => ctx.db.delete(item._id)));
  },
});

export const mergeGuestCart = mutation({
  args: {
    items: v.array(
      v.object({ productId: v.id("products"), quantity: v.number() })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    for (const item of args.items) {
      const existing = await ctx.db
        .query("cart")
        .withIndex("by_user_and_product", (q) =>
          q
            .eq("userId", identity.tokenIdentifier)
            .eq("productId", item.productId)
        )
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, {
          quantity: Math.max(existing.quantity, item.quantity),
        });
      } else {
        await ctx.db.insert("cart", {
          userId: identity.tokenIdentifier,
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    }
  },
});
