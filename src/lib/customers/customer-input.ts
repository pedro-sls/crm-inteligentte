import { z } from "zod";
import { type CustomerStatus } from "@/lib/customers/customer-status";

export const customerStatusValues = ["prospect", "active", "at_risk", "inactive"] as const;

export const customerInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  document: z.string().trim().max(64).optional(),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  website: z.string().trim().url().max(200).optional().or(z.literal("")),
  status: z.enum(customerStatusValues),
  notes: z.string().trim().max(2000).optional(),
});

export type CustomerInput = {
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  status: CustomerStatus;
  customFields: {
    notes?: string;
  };
};

function optionalValue(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function parseCustomerFormData(formData: FormData): CustomerInput {
  const parsed = customerInputSchema.parse({
    name: formString(formData, "name"),
    document: formString(formData, "document"),
    email: formString(formData, "email"),
    phone: formString(formData, "phone"),
    website: formString(formData, "website"),
    status: formString(formData, "status"),
    notes: formString(formData, "notes"),
  });

  return {
    name: parsed.name,
    document: optionalValue(parsed.document),
    email: optionalValue(parsed.email),
    phone: optionalValue(parsed.phone),
    website: optionalValue(parsed.website),
    status: parsed.status,
    customFields: parsed.notes ? { notes: parsed.notes } : {},
  };
}
