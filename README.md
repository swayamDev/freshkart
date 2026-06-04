# FreshKart 🥦

A full-stack grocery shopping platform built with Next.js 16, Convex, Clerk, and Stripe.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind v4, shadcn/ui
- **Backend**: Convex (database, real-time, file storage, HTTP actions)
- **Auth**: Clerk (authentication + Clerk Billing for membership)
- **Payments**: Stripe via @convex-dev/stripe component
- **State**: Zustand with localStorage persistence (cart)

## Quick Start

1. cp .env.example .env.local and fill in all values
2. npx convex dev (sets up backend + tables)
3. Add CLERK_FRONTEND_API_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET to Convex env vars
4. npm run dev

## Make a user admin
Clerk Dashboard → Users → your user → Public metadata:
{ "isAdmin": true }

## Webhook URLs (use your Convex deployment URL)
- Clerk: https://your-deployment.convex.site/clerk/webhook
- Stripe: https://your-deployment.convex.site/stripe/webhook

## Routes
Store: / /shop /products/[slug] /checkout /orders /favourites /membership
Admin: /admin /admin/products /admin/categories /admin/orders /admin/customers
