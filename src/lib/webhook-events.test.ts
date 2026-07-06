import { describe, expect, it } from "vitest";
import { createWebhookPayload, createWebhookSignature } from "@/lib/webhook-events";

describe("US-0601 - Webhooks de saida", () => {
  it("Cenario: payload de evento contem dados essenciais e assinatura", () => {
    const payload = createWebhookPayload({
      event: "demand.created",
      organizationId: "00000000-0000-4000-8000-000000000001",
      entityId: "00000000-0000-4000-8000-000000000002",
      data: { title: "Demanda urgente" },
    });
    const body = JSON.stringify(payload);

    expect(payload.event).toBe("demand.created");
    expect(payload.data.title).toBe("Demanda urgente");
    expect(createWebhookSignature(body, "secret")).toHaveLength(64);
  });
});
