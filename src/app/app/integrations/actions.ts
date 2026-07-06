"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db/client";
import { webhooks } from "@/db/schema";
import { hashApiKey } from "@/lib/api-keys";
import { requireOrganizationContext } from "@/lib/organization-context";
import { webhookEventValues } from "@/lib/webhook-events";

const webhookInputSchema = z.object({
  name: z.string().trim().min(2).max(100),
  url: z.string().trim().url().max(500),
  event: z.enum(webhookEventValues),
});

export async function createWebhookAction(formData: FormData) {
  const { organization } = await requireOrganizationContext();
  const values = webhookInputSchema.parse({
    name: formData.get("name"),
    url: formData.get("url"),
    event: formData.get("event"),
  });

  await getDb().insert(webhooks).values({
    organizationId: organization.id,
    name: values.name,
    url: values.url,
    event: values.event,
    secretHash: hashApiKey(`${values.url}:${values.name}:${Date.now()}`),
  });

  revalidatePath("/app/integrations");
}

export async function toggleWebhookAction(formData: FormData) {
  const { organization } = await requireOrganizationContext();
  const id = z.string().uuid().parse(formData.get("id"));
  const isActive = formData.get("isActive") === "true";

  await getDb()
    .update(webhooks)
    .set({ isActive: !isActive, updatedAt: new Date() })
    .where(and(eq(webhooks.id, id), eq(webhooks.organizationId, organization.id)));

  revalidatePath("/app/integrations");
}
