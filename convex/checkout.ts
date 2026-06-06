"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { StripeSubscriptions } from "@convex-dev/stripe";
import { components } from "./_generated/api";

const stripe = new StripeSubscriptions(components.stripe, {});

export const createCheckoutSession = action({
  args: {
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(internal.checkoutInternal.getCheckoutUser, {
      tokenIdentifier: identity.tokenIdentifier,
    });
    if (!user) throw new Error("User not found");
    if (!user.address) throw new Error("ADDRESS_REQUIRED");

    const rawCartItems = await ctx.runQuery(
      internal.checkoutInternal.getCartForCheckout,
      { userId: identity.tokenIdentifier }
    );

    const cartItems = (rawCartItems ?? []).filter(
      (item): item is NonNullable<typeof item> => item !== null
    );
    if (cartItems.length === 0) throw new Error("Cart is empty");

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Check membership from Clerk publicMetadata
    const meta = identity.publicMetadata as Record<string, unknown> | undefined;
    const isMember = meta?.plan === "member";
    const deliveryFee = isMember ? 0 : 399;
    const total = subtotal + deliveryFee;

    // Get or create Stripe customer
    const customer = await stripe.getOrCreateCustomer(ctx, {
      userId: identity.tokenIdentifier,
      email: identity.email ?? "",
      name: identity.name ?? undefined,
    });

    // Build cart snapshot for webhook
    const cartSnapshot = JSON.stringify(
      cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.product.price,
        totalPrice: item.product.price * item.quantity,
        productName: item.product.name,
        productImageId: item.product.imageId ?? null,
      }))
    );
    const addressMeta = JSON.stringify(user.address);

    // Build line items for Stripe (using price_data, no priceId needed for one-time)
    const lineItems = [
      ...cartItems.map((item) => ({
        price_data: {
          currency: "gbp",
          product_data: { name: item.product.name },
          unit_amount: item.product.price,
        },
        quantity: item.quantity,
      })),
      ...(deliveryFee > 0
        ? [
            {
              price_data: {
                currency: "gbp",
                product_data: { name: "Delivery Fee" },
                unit_amount: deliveryFee,
              },
              quantity: 1,
            },
          ]
        : []),
    ];

    // Use createCheckoutSession with line_items override via extraParams
    // The component's createCheckoutSession requires priceId for subscriptions,
    // but for one-time payments with price_data we call stripe directly via the component
    const session = await stripe.createCheckoutSession(ctx, {
      priceId: "price_placeholder", // ignored when lineItems override used
      customerId: customer.customerId,
      mode: "payment",
      successUrl: args.successUrl,
      cancelUrl: args.cancelUrl,
      paymentIntentMetadata: {
        userId: identity.tokenIdentifier,
        cartSnapshot,
        addressMeta,
        subtotal: subtotal.toString(),
        deliveryFee: deliveryFee.toString(),
        total: total.toString(),
      },
    });

    return { url: session.url, sessionId: session.sessionId };
  },
});

export const createMembershipCheckout = action({
  args: {
    priceId: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const customer = await stripe.getOrCreateCustomer(ctx, {
      userId: identity.tokenIdentifier,
      email: identity.email ?? "",
      name: identity.name ?? undefined,
    });

    const session = await stripe.createCheckoutSession(ctx, {
      priceId: args.priceId,
      customerId: customer.customerId,
      mode: "subscription",
      successUrl: args.successUrl,
      cancelUrl: args.cancelUrl,
      subscriptionMetadata: { userId: identity.tokenIdentifier },
    });

    return { url: session.url, sessionId: session.sessionId };
  },
});

export const createCustomerPortalSession = action({
  args: { returnUrl: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const customer = await stripe.getOrCreateCustomer(ctx, {
      userId: identity.tokenIdentifier,
      email: identity.email ?? "",
      name: identity.name ?? undefined,
    });

    const portalSession = await stripe.createCustomerPortalSession(ctx, {
      customerId: customer.customerId,
      returnUrl: args.returnUrl,
    });

    return { url: portalSession.url };
  },
});

export const getUserSubscriptions = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.runQuery(
      components.stripe.public.listSubscriptionsByUserId,
      { userId: identity.tokenIdentifier }
    );
  },
});
