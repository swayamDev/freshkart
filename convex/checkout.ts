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

    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user with address
    const user = await ctx.runQuery(
      internal.checkoutInternal.getCheckoutUser,
      {
        tokenIdentifier: identity.tokenIdentifier,
      }
    );

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.address) {
      throw new Error("ADDRESS_REQUIRED");
    }

    // Get cart items
    const rawCartItems = await ctx.runQuery(
      internal.checkoutInternal.getCartForCheckout,
      {
        userId: identity.tokenIdentifier,
      }
    );

    // Remove null products safely
    const cartItems = (rawCartItems ?? []).filter(
      (item): item is NonNullable<typeof item> => item !== null
    );

    if (cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Calculate subtotal
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Free delivery for members
    const meta = identity.publicMetadata as
      | Record<string, unknown>
      | undefined;

    const isMember = meta?.plan === "member";

    const deliveryFee = isMember ? 0 : 399;

    const total = subtotal + deliveryFee;

    // Get or create Stripe customer
    const customer = await stripe.getOrCreateCustomer(ctx, {
      userId: identity.tokenIdentifier,
      email: identity.email ?? "",
      name: identity.name ?? undefined,
    });

    // Stripe line items
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "gbp",
        product_data: {
          name: item.product.name,
        },
        unit_amount: item.product.price,
      },
      quantity: item.quantity,
    }));

    // Add delivery fee
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "gbp",
          product_data: {
            name: "Delivery",
          },
          unit_amount: deliveryFee,
        },
        quantity: 1,
      });
    }

    // Save cart snapshot
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

    // Create Stripe checkout session
    const session = await stripe.createCheckoutSession(ctx, {
      priceId: "price_placeholder",
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

    return {
      url: session.url,
      sessionId: session.sessionId,
    };
  },
});