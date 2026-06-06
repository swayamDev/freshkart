import { httpRouter } from "convex/server";
import { components, internal } from "./_generated/api";
import { registerRoutes } from "@convex-dev/stripe";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// ── Stripe webhook ─────────────────────────────────────────────────────────
registerRoutes(http, components.stripe, {
  webhookPath: "/stripe/webhook",
  events: {
    "checkout.session.completed": async (ctx, event) => {
      const session = event.data.object as unknown as {
        id: string;
        payment_intent?: string | null;
        metadata?: Record<string, string> | null;
        payment_intent_data?: {
          metadata?: Record<string, string>;
        } | null;
      };

      const meta: Record<string, string> =
        (session as any).payment_intent_data?.metadata ??
        session.metadata ??
        {};

      const userId = meta.userId;
      const cartSnapshot = meta.cartSnapshot;
      const addressMeta = meta.addressMeta;

      if (!userId || !cartSnapshot || !addressMeta) {
        // This may be a membership checkout — skip silently
        return;
      }

      const items = JSON.parse(cartSnapshot) as Array<{
        productId: string;
        productName: string;
        productImageId: string | null;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }>;

      const address = JSON.parse(addressMeta) as {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
      };

      const subtotal = parseInt(meta.subtotal ?? "0", 10);
      const deliveryFee = parseInt(meta.deliveryFee ?? "0", 10);
      const total = parseInt(meta.total ?? "0", 10);

      await ctx.runMutation(internal.orders.createFromCheckout, {
        userId,
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : undefined,
        deliveryAddress: address,
        items: items.map((i) => ({
          productId: i.productId as any,
          productName: i.productName,
          productImageId: (i.productImageId as any) ?? undefined,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
        })),
        subtotal,
        deliveryFee,
        total,
      });
    },
  },
});

// ── Clerk webhook (user sync) ───────────────────────────────────────────────
http.route({
  path: "/clerk/webhook",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
    }

    const body = await req.text();
    const svixId = req.headers.get("svix-id") ?? "";
    const svixTimestamp = req.headers.get("svix-timestamp") ?? "";
    const svixSignature = req.headers.get("svix-signature") ?? "";

    const { Webhook } = await import("svix");

    let event: { type: string; data: Record<string, unknown> };
    try {
      const wh = new Webhook(secret);
      event = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as typeof event;
    } catch {
      return new Response("Webhook signature invalid", { status: 400 });
    }

    if (event.type === "user.created" || event.type === "user.updated") {
      const data = event.data;
      const emailAddresses = data.email_addresses as Array<{
        email_address: string;
      }>;
      const primaryEmail = emailAddresses?.[0]?.email_address ?? "";
      await ctx.runMutation(internal.users.upsertUser, {
        clerkId: data.id as string,
        email: primaryEmail,
        name:
          `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() ||
          undefined,
        imageUrl: (data.image_url as string | undefined) ?? undefined,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
