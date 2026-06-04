import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/auth";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    categoryId: v.optional(v.id("categories")),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const activeOnly = args.activeOnly ?? true;
    let rawPage;

    if (args.categoryId) {
      rawPage = await ctx.db
        .query("products")
        .withIndex("by_category_and_active", (q) =>
          q.eq("categoryId", args.categoryId!).eq("isActive", activeOnly)
        )
        .order("desc")
        .paginate(args.paginationOpts);
    } else if (activeOnly) {
      rawPage = await ctx.db
        .query("products")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      rawPage = await ctx.db
        .query("products")
        .order("desc")
        .paginate(args.paginationOpts);
    }

    const pageWithImages = await Promise.all(
      rawPage.page.map(async (p) => ({
        ...p,
        imageUrl: p.imageId ? await ctx.storage.getUrl(p.imageId) : null,
      }))
    );
    return { ...rawPage, page: pageWithImages };
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .take(8);
    return await Promise.all(
      products.map(async (p) => ({
        ...p,
        imageUrl: p.imageId ? await ctx.storage.getUrl(p.imageId) : null,
      }))
    );
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!product) return null;
    const category = await ctx.db.get(product.categoryId);
    const imageUrl = product.imageId
      ? await ctx.storage.getUrl(product.imageId)
      : null;
    return { ...product, category, imageUrl };
  },
});

export const getById = query({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;
    const imageUrl = product.imageId
      ? await ctx.storage.getUrl(product.imageId)
      : null;
    return { ...product, imageUrl };
  },
});

export const search = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return [];
    const results = await ctx.db
      .query("products")
      .withSearchIndex("search_products", (q) =>
        q.search("name", args.query).eq("isActive", true)
      )
      .take(args.limit ?? 10);
    return await Promise.all(
      results.map(async (p) => ({
        ...p,
        imageUrl: p.imageId ? await ctx.storage.getUrl(p.imageId) : null,
      }))
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    compareAtPrice: v.optional(v.number()),
    categoryId: v.id("categories"),
    imageId: v.optional(v.id("_storage")),
    stock: v.number(),
    unit: v.optional(v.string()),
    isActive: v.boolean(),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("products", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    compareAtPrice: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
    imageId: v.optional(v.id("_storage")),
    stock: v.optional(v.number()),
    unit: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
