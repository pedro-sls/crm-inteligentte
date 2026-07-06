import { signPayload } from "@/lib/security";

export const webhookEventLabels = {
  "customer.created": "Cliente criado",
  "customer.updated": "Cliente atualizado",
  "demand.created": "Demanda criada",
  "demand.updated": "Demanda atualizada",
  "demand.status_changed": "Status de demanda alterado",
  "demand.assigned": "Demanda atribuida",
} as const;

export type WebhookEvent = keyof typeof webhookEventLabels;

export const webhookEventValues = Object.keys(webhookEventLabels) as WebhookEvent[];

export function createWebhookPayload(input: {
  event: WebhookEvent;
  organizationId: string;
  entityId: string;
  data: Record<string, unknown>;
}) {
  return {
    event: input.event,
    organizationId: input.organizationId,
    entityId: input.entityId,
    data: input.data,
    occurredAt: new Date().toISOString(),
  };
}

export function createWebhookSignature(payload: string, secret: string) {
  return signPayload(payload, secret);
}
