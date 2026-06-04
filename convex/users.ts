import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
  },
});

export const upsertUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
    });
  },
});

export const saveAddress = mutation({
  args: {
    line1: v.string(),
    line2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    postcode: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, {
      address: {
        line1: args.line1,
        line2: args.line2,
        city: args.city,
        state: args.state,
        postcode: args.postcode,
        country: args.country,
      },
    });
  },
});

// Admin: paginated list of all users
export const listUsers = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.tokenIdentifier))
      .unique();
    if (!me?.isAdmin) throw new Error("Forbidden");
    return await ctx.db.query("users").paginate(args.paginationOpts);
  },
});
