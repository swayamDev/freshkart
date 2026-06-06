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
    ).then((r) => r.filter(Boolean));
  },
});

export const upsertItem = mutation({
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

    if (args.quantity <= 0) {
      if (existing) await ctx.db.delete(existing._id);
      return;
    }

    if (existing) {
      await ctx.db.patch(existing._id, { quantity: args.quantity });
    } else {
      await ctx.db.insert("cart", {
        userId: identity.tokenIdentifier,
        productId: args.productId,
        quantity: args.quantity,
      });
    }
  },
});

export const removeItem = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("cart")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", identity.tokenIdentifier).eq("productId", args.productId)
      )
      .unique();
    if (existing) await ctx.db.delete(existing._id);
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
    await Promise.all(items.map((i) => ctx.db.delete(i._id)));
  },
});

// Called from CartDrawer when user signs in — merges local cart into DB
export const mergeGuestCart = mutation({
  args: {
    items: v.array(
      v.object({ productId: v.id("products"), quantity: v.number() })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    for (const incoming of args.items) {
      const existing = await ctx.db
        .query("cart")
        .withIndex("by_user_and_product", (q) =>
          q
            .eq("userId", identity.tokenIdentifier)
            .eq("productId", incoming.productId)
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          quantity: existing.quantity + incoming.quantity,
        });
      } else {
        await ctx.db.insert("cart", {
          userId: identity.tokenIdentifier,
          productId: incoming.productId,
          quantity: incoming.quantity,
        });
      }
    }
  },
});
