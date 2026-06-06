import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const toggle = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("favourites")
      .withIndex("by_user_and_product", (q) =>
        q
          .eq("userId", identity.tokenIdentifier)
          .eq("productId", args.productId)
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
        q
          .eq("userId", identity.tokenIdentifier)
          .eq("productId", args.productId)
      )
      .unique();
    return !!existing;
  },
});

export const getMyFavourites = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], isDone: true, continueCursor: "" };

    const favPage = await ctx.db
      .query("favourites")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .order("desc")
      .paginate(args.paginationOpts);

    const withProducts = await Promise.all(
      favPage.page.map(async (fav) => {
        const product = await ctx.db.get(fav.productId);
        if (!product || !product.isActive) return null;
        const imageUrl = product.imageId
          ? await ctx.storage.getUrl(product.imageId)
          : null;
        return { ...fav, product: { ...product, imageUrl } };
      })
    );

    return {
      ...favPage,
      page: withProducts.filter(Boolean),
    };
  },
});
