import { MutationCtx, QueryCtx } from "../_generated/server";

export async function requireAdmin(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const meta = identity.publicMetadata as Record<string, unknown> | undefined;
  const isAdmin = meta?.isAdmin === true;

  if (!isAdmin) throw new Error("Forbidden: admin access required");

  return identity;
}
