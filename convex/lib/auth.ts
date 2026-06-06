import { MutationCtx, QueryCtx, ActionCtx } from "../_generated/server";

export async function requireAdmin(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.tokenIdentifier))
    .unique();

  if (!user?.isAdmin) throw new Error("Forbidden: admin access required");
  return user;
}
