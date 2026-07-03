"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db/client";
import { customers } from "@/db/schema";
import { requireOrganizationContext } from "@/lib/organization-context";

const customerStatusValues = ["prospect", "active", "at_risk", "inactive"] as const;

const customerSchema = z.object({
  name: z.string().trim().min(2).max(160),
  document: z.string().trim().max(64).optional(),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional(),
  website: z.string().trim().url().max(200).optional().or(z.literal("")),
  status: z.enum(customerStatusValues),
  notes: z.string().trim().max(2000).optional(),
});

function optionalValue(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function parseCustomerForm(formData: FormData) {
  const parsed = customerSchema.parse({
    name: formData.get("name"),
    document: formData.get("document"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    website: formData.get("website"),
    status: formData.get("status"),
    notes: formData.get("notes"),
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

export async function createCustomerAction(formData: FormData) {
  const { session, organization } = await requireOrganizationContext();
  const values = parseCustomerForm(formData);

  await getDb().insert(customers).values({
    ...values,
    organizationId: organization.id,
    ownerId: session.user.id,
  });

  revalidatePath("/app");
  revalidatePath("/app/customers");
  redirect("/app/customers");
}

export async function updateCustomerAction(formData: FormData) {
  const { organization } = await requireOrganizationContext();
  const id = z.string().uuid().parse(formData.get("id"));
  const values = parseCustomerForm(formData);

  const updated = await getDb()
    .update(customers)
    .set({
      ...values,
      updatedAt: new Date(),
    })
    .where(and(eq(customers.id, id), eq(customers.organizationId, organization.id)))
    .returning({ id: customers.id });

  if (!updated[0]) {
    notFound();
  }

  revalidatePath("/app");
  revalidatePath("/app/customers");
  revalidatePath(`/app/customers/${id}/edit`);
  redirect("/app/customers");
}
