"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db/client";
import { customers } from "@/db/schema";
import { parseCustomerFormData } from "@/lib/customers/customer-input";
import { requireOrganizationContext } from "@/lib/organization-context";

export async function createCustomerAction(formData: FormData) {
  const { session, organization } = await requireOrganizationContext();
  const values = parseCustomerFormData(formData);

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
  const values = parseCustomerFormData(formData);

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
