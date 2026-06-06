import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("categories").take(1);
    if (existing.length > 0) {
      return { message: "Already seeded" };
    }

    // Seed categories
    const categories = [
      { name: "Fruit & Veg", slug: "fruit-veg", description: "Fresh fruit and vegetables", sortOrder: 1 },
      { name: "Dairy & Eggs", slug: "dairy-eggs", description: "Milk, cheese, eggs and more", sortOrder: 2 },
      { name: "Bakery", slug: "bakery", description: "Fresh bread and baked goods", sortOrder: 3 },
      { name: "Meat & Fish", slug: "meat-fish", description: "Fresh meat and seafood", sortOrder: 4 },
      { name: "Pantry", slug: "pantry", description: "Dry goods and cupboard essentials", sortOrder: 5 },
      { name: "Drinks", slug: "drinks", description: "Soft drinks, juice and water", sortOrder: 6 },
    ];

    const catIds: Record<string, any> = {};
    for (const cat of categories) {
      catIds[cat.slug] = await ctx.db.insert("categories", cat);
    }

    // Seed products
    const products = [
      { name: "Organic Apples", slug: "organic-apples", price: 199, stock: 100, categoryId: catIds["fruit-veg"], unit: "kg", isActive: true, isFeatured: true },
      { name: "Bananas", slug: "bananas", price: 99, compareAtPrice: 129, stock: 150, categoryId: catIds["fruit-veg"], unit: "bunch", isActive: true, isFeatured: true },
      { name: "Baby Spinach", slug: "baby-spinach", price: 149, stock: 60, categoryId: catIds["fruit-veg"], unit: "bag", isActive: true, isFeatured: false },
      { name: "Cherry Tomatoes", slug: "cherry-tomatoes", price: 179, stock: 80, categoryId: catIds["fruit-veg"], unit: "punnet", isActive: true, isFeatured: true },
      { name: "Broccoli", slug: "broccoli", price: 129, stock: 70, categoryId: catIds["fruit-veg"], unit: "head", isActive: true, isFeatured: false },
      { name: "Whole Milk 2L", slug: "whole-milk-2l", price: 159, stock: 200, categoryId: catIds["dairy-eggs"], unit: "2L", isActive: true, isFeatured: true },
      { name: "Free Range Eggs 12pk", slug: "free-range-eggs-12pk", price: 299, stock: 120, categoryId: catIds["dairy-eggs"], unit: "12 pack", isActive: true, isFeatured: true },
      { name: "Mature Cheddar 400g", slug: "mature-cheddar-400g", price: 349, stock: 90, categoryId: catIds["dairy-eggs"], unit: "400g", isActive: true, isFeatured: false },
      { name: "Greek Yoghurt 500g", slug: "greek-yoghurt-500g", price: 229, compareAtPrice: 279, stock: 80, categoryId: catIds["dairy-eggs"], unit: "500g", isActive: true, isFeatured: true },
      { name: "Sourdough Loaf", slug: "sourdough-loaf", price: 279, stock: 40, categoryId: catIds["bakery"], unit: "loaf", isActive: true, isFeatured: true },
      { name: "Croissants 4pk", slug: "croissants-4pk", price: 199, stock: 50, categoryId: catIds["bakery"], unit: "4 pack", isActive: true, isFeatured: false },
      { name: "Chicken Breast 500g", slug: "chicken-breast-500g", price: 449, compareAtPrice: 499, stock: 60, categoryId: catIds["meat-fish"], unit: "500g", isActive: true, isFeatured: true },
      { name: "Atlantic Salmon 300g", slug: "atlantic-salmon-300g", price: 599, stock: 40, categoryId: catIds["meat-fish"], unit: "300g", isActive: true, isFeatured: false },
      { name: "Basmati Rice 1kg", slug: "basmati-rice-1kg", price: 189, stock: 200, categoryId: catIds["pantry"], unit: "1kg", isActive: true, isFeatured: false },
      { name: "Pasta 500g", slug: "pasta-500g", price: 119, stock: 250, categoryId: catIds["pantry"], unit: "500g", isActive: true, isFeatured: false },
      { name: "Olive Oil 500ml", slug: "olive-oil-500ml", price: 499, compareAtPrice: 599, stock: 80, categoryId: catIds["pantry"], unit: "500ml", isActive: true, isFeatured: true },
      { name: "Orange Juice 1L", slug: "orange-juice-1l", price: 199, stock: 100, categoryId: catIds["drinks"], unit: "1L", isActive: true, isFeatured: false },
      { name: "Sparkling Water 6pk", slug: "sparkling-water-6pk", price: 249, stock: 120, categoryId: catIds["drinks"], unit: "6 x 500ml", isActive: true, isFeatured: false },
    ];

    for (const product of products) {
      await ctx.db.insert("products", product);
    }

    return { message: "Seeded successfully", categories: Object.keys(catIds).length, products: products.length };
  },
});
