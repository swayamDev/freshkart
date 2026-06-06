"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/primitives";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "County/state is required"),
  postcode: z.string().min(1, "Postcode is required"),
  country: z.string().min(1, "Country is required"),
});

type AddressForm = z.infer<typeof addressSchema>;

interface Props {
  open: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

export function AddressDialog({ open, onSuccess, onClose }: Props) {
  const saveAddress = useMutation(api.users.saveAddress);

  const form = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "United Kingdom" },
  });

  const onSubmit = async (data: AddressForm) => {
    try {
      await saveAddress(data);
      form.reset();
      onSuccess();
    } catch {
      toast.error("Failed to save address");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delivery Address</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Address Line 1</Label>
            <Input
              {...form.register("line1")}
              placeholder="123 Baker Street"
            />
            {form.formState.errors.line1 && (
              <p className="text-xs text-[hsl(var(--destructive))]">
                {form.formState.errors.line1.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Address Line 2 (optional)</Label>
            <Input {...form.register("line2")} placeholder="Flat 2" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>City</Label>
              <Input {...form.register("city")} placeholder="London" />
              {form.formState.errors.city && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.city.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>County / State</Label>
              <Input {...form.register("state")} placeholder="Greater London" />
              {form.formState.errors.state && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.state.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Postcode</Label>
              <Input {...form.register("postcode")} placeholder="NW1 6XE" />
              {form.formState.errors.postcode && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.postcode.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Country</Label>
              <Input
                {...form.register("country")}
                placeholder="United Kingdom"
              />
              {form.formState.errors.country && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {form.formState.errors.country.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Address</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
