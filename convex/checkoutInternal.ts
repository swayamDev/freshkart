import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getCheckoutUser = internalQuery({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.tokenIdentifier))
      .unique();
  },
});

export const getCartForCheckout = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(100);
    return await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        if (!product) return null;
        return { ...item, product };
      })
    ).then((items) => items.filter(Boolean));
  },
});
