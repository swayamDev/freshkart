"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/primitives";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "County / State is required"),
  postcode: z.string().min(1, "Postcode is required"),
  country: z.string().min(1, "Country is required"),
});

type AddressForm = z.infer<typeof addressSchema>;

interface AddressDialogProps {
  open: boolean;
  onSuccess: () => void;
  onClose?: () => void;
}

export function AddressDialog({ open, onSuccess, onClose }: AddressDialogProps) {
  const saveAddress = useMutation(api.users.saveAddress);
  const [saving, setSaving] = useState(false);

  const form = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "United Kingdom" },
  });

  const onSubmit = async (data: AddressForm) => {
    setSaving(true);
    try {
      await saveAddress(data);
      toast.success("Address saved!");
      onSuccess();
    } catch {
      toast.error("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[hsl(var(--primary))]" />
            Delivery Address
          </DialogTitle>
          <DialogDescription>
            We need your delivery address before we can process your order.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="line1">Address Line 1</Label>
            <Input id="line1" placeholder="123 Green Street" {...form.register("line1")} />
            {form.formState.errors.line1 && (
              <p className="text-xs text-[hsl(var(--destructive))]">{form.formState.errors.line1.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="line2">Address Line 2 (optional)</Label>
            <Input id="line2" placeholder="Apartment, suite, etc." {...form.register("line2")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="London" {...form.register("city")} />
              {form.formState.errors.city && (
                <p className="text-xs text-[hsl(var(--destructive))]">{form.formState.errors.city.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">County</Label>
              <Input id="state" placeholder="Greater London" {...form.register("state")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" placeholder="SW1A 1AA" {...form.register("postcode")} />
              {form.formState.errors.postcode && (
                <p className="text-xs text-[hsl(var(--destructive))]">{form.formState.errors.postcode.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" {...form.register("country")} />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving..." : "Save & Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
