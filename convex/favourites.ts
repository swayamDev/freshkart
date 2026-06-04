import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMyFavourites = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const favs = await ctx.db
      .query("favourites")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .take(200);
    return await Promise.all(
      favs.map(async (fav) => {
        const product = await ctx.db.get(fav.productId);
        if (!product) return null;
        const imageUrl = product.imageId
          ? await ctx.storage.getUrl(product.imageId)
          : null;
        return { ...fav, product: { ...product, imageUrl } };
      })
    ).then((items) => items.filter(Boolean));
  },
});

export const toggle = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("favourites")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", identity.tokenIdentifier).eq("productId", args.productId)
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
      return false;
    } else {
      await ctx.db.insert("favourites", {
        userId: identity.tokenIdentifier,
        productId: args.productId,
      });
      return true;
    }
  },
});

export const isFavourited = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;
    const existing = await ctx.db
      .query("favourites")
      .withIndex("by_user_and_product", (q) =>
        q.eq("userId", identity.tokenIdentifier).eq("productId", args.productId)
      )
      .unique();
    return !!existing;
  },
});
