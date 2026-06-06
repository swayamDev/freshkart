"use client";

import { Crown, Truck, Star, Zap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/primitives";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

// Set this to your actual Stripe membership price ID
const MEMBERSHIP_PRICE_ID = process.env.NEXT_PUBLIC_MEMBERSHIP_PRICE_ID ?? "price_membership_placeholder";

export default function MembershipPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const createMembershipCheckout = useAction(api.checkout.createMembershipCheckout);
  const createPortalSession = useAction(api.checkout.createCustomerPortalSession);

  const perks = [
    {
      icon: Truck,
      title: "Free delivery, always",
      desc: "No delivery fees on every order, every time.",
    },
    {
      icon: Zap,
      title: "Priority picking",
      desc: "Your orders get picked and packed first.",
    },
    {
      icon: Star,
      title: "Early access",
      desc: "Be first to shop new products and seasonal ranges.",
    },
  ];

  const handleSubscribe = async () => {
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/membership");
      return;
    }
    setLoading(true);
    try {
      const result = await createMembershipCheckout({
        priceId: MEMBERSHIP_PRICE_ID,
        successUrl: `${window.location.origin}/membership?success=true`,
        cancelUrl: `${window.location.origin}/membership`,
      });
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      toast.error("Failed to start membership checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const result = await createPortalSession({
        returnUrl: `${window.location.origin}/membership`,
      });
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      toast.error("Failed to open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 rounded-full px-4 py-2 text-sm font-medium mb-6">
        <Crown className="h-4 w-4" />
        FreshKart Membership
      </div>

      <h1 className="text-4xl font-bold mb-4">Free delivery on every order</h1>
      <p className="text-[hsl(var(--muted-foreground))] text-lg mb-10 max-w-xl mx-auto">
        Join FreshKart Membership and never pay for delivery again. Cancel any
        time.
      </p>

      <Card className="mb-10 border-2 border-[hsl(var(--primary))]">
        <CardHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge className="bg-yellow-500 text-white">Most popular</Badge>
          </div>
          <CardTitle className="text-3xl">
            £4.99{" "}
            <span className="text-lg font-normal text-[hsl(var(--muted-foreground))]">
              / month
            </span>
          </CardTitle>
          <CardDescription>Cancel any time · No commitment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            size="lg"
            className="w-full max-w-sm mx-auto flex"
            onClick={handleSubscribe}
            disabled={loading}
          >
            <Crown className="h-4 w-4 mr-2" />
            {loading ? "Redirecting..." : "Start Membership"}
          </Button>

          {isSignedIn && (
            <div>
              <button
                className="text-xs text-[hsl(var(--muted-foreground))] underline mt-2 hover:text-[hsl(var(--foreground))]"
                onClick={handleManageBilling}
                disabled={portalLoading}
              >
                {portalLoading ? "Opening..." : "Manage existing subscription →"}
              </button>
            </div>
          )}

          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Powered by Stripe · Secure and encrypted.
          </p>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-3 gap-6">
        {perks.map((perk) => (
          <div key={perk.title} className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
              <perk.icon className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="font-semibold text-sm">{perk.title}</h3>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {perk.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 p-4 bg-[hsl(var(--muted))] rounded-lg text-sm text-[hsl(var(--muted-foreground))]">
        <p className="font-medium text-[hsl(var(--foreground))] mb-1">
          Already a member?
        </p>
        <p>
          Your free delivery benefit is automatically applied at checkout. No
          code needed.
        </p>
      </div>
    </div>
  );
}
