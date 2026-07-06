"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db/client";
import { customFieldDefinitions, customers } from "@/db/schema";
import { parseCustomerFormData } from "@/lib/customers/customer-input";
import { parseCustomFieldValue } from "@/lib/customization";
import { requireOrganizationContext } from "@/lib/organization-context";
import { dispatchWebhooks } from "@/lib/webhook-dispatcher";

async function parseCustomerCustomFields(formData: FormData, organizationId: string, notes?: string) {
  const definitions = await getDb()
    .select()
    .from(customFieldDefinitions)
    .where(and(eq(customFieldDefinitions.organizationId, organizationId), eq(customFieldDefinitions.entityType, "customer")));

  const customFields: Record<string, unknown> = notes ? { notes } : {};

  for (const definition of definitions.filter((field) => field.isActive)) {
    const value = parseCustomFieldValue(definition.fieldType, formData.get(`custom_${definition.key}`));

    if (definition.isRequired && (value === null || value === "")) {
      throw new Error(`Campo obrigatorio nao preenchido: ${definition.label}`);
    }

    if (value !== null) {
      customFields[definition.key] = value;
    }
  }

  return customFields;
}

export async function createCustomerAction(formData: FormData) {
  const { session, organization } = await requireOrganizationContext();
  const values = parseCustomerFormData(formData);
  const customFields = await parseCustomerCustomFields(formData, organization.id, values.customFields.notes);

  const [customer] = await getDb().insert(customers).values({
    ...values,
    customFields,
    organizationId: organization.id,
    ownerId: session.user.id,
  }).returning({ id: customers.id, name: customers.name, status: customers.status });

  if (customer) {
    await dispatchWebhooks({
      organizationId: organization.id,
      event: "customer.created",
      entityId: customer.id,
      data: customer,
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/customers");
  redirect("/app/customers");
}

export async function updateCustomerAction(formData: FormData) {
  const { organization } = await requireOrganizationContext();
  const id = z.string().uuid().parse(formData.get("id"));
  const values = parseCustomerFormData(formData);
  const customFields = await parseCustomerCustomFields(formData, organization.id, values.customFields.notes);

  const updated = await getDb()
    .update(customers)
    .set({
      ...values,
      customFields,
      updatedAt: new Date(),
    })
    .where(and(eq(customers.id, id), eq(customers.organizationId, organization.id)))
    .returning({ id: customers.id });

  if (!updated[0]) {
    notFound();
  }

  await dispatchWebhooks({
    organizationId: organization.id,
    event: "customer.updated",
    entityId: id,
    data: { id, name: values.name, status: values.status },
  });

  revalidatePath("/app");
  revalidatePath("/app/customers");
  revalidatePath(`/app/customers/${id}/edit`);
  redirect("/app/customers");
}
