import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { webhookDeliveries, webhooks } from "@/db/schema";
import {
  createWebhookPayload,
  createWebhookSignature,
  type WebhookEvent,
} from "@/lib/webhook-events";

export async function dispatchWebhooks(input: {
  organizationId: string;
  event: WebhookEvent;
  entityId: string;
  data: Record<string, unknown>;
}) {
  const activeWebhooks = await getDb()
    .select()
    .from(webhooks)
    .where(eq(webhooks.organizationId, input.organizationId));

  const targets = activeWebhooks.filter((webhook) => webhook.isActive && webhook.event === input.event);

  await Promise.all(
    targets.map(async (webhook) => {
      const payload = createWebhookPayload({
        event: input.event,
        organizationId: input.organizationId,
        entityId: input.entityId,
        data: input.data,
      });
      const body = JSON.stringify(payload);
      const signingSecret = process.env.WEBHOOK_SIGNING_SECRET ?? "";

      try {
        const response = await fetch(webhook.url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-crm-event": input.event,
            "x-crm-signature": createWebhookSignature(body, signingSecret),
          },
          body,
        });

        await getDb().insert(webhookDeliveries).values({
          organizationId: input.organizationId,
          webhookId: webhook.id,
          event: input.event,
          payload,
          status: response.ok ? "success" : "failed",
          statusCode: response.status,
          error: response.ok ? null : `HTTP ${response.status}`,
          deliveredAt: new Date(),
        });
      } catch (error) {
        await getDb().insert(webhookDeliveries).values({
          organizationId: input.organizationId,
          webhookId: webhook.id,
          event: input.event,
          payload,
          status: "failed",
          error: error instanceof Error ? error.message : "Erro desconhecido",
          deliveredAt: new Date(),
        });
      }
    }),
  );
}
