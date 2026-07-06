import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db/client";
import { auditEvents, customers, demands } from "@/db/schema";
import { authenticateApiRequest, requireApiScope } from "@/lib/api-auth";
import { getInitialDemandStatus } from "@/lib/demand-workflows";
import { applyDistributionRulesToDemand } from "@/lib/distribution/distribution-engine";
import { dispatchWebhooks } from "@/lib/webhook-dispatcher";

const createDemandSchema = z.object({
  type: z.enum(["client", "internal"]).default("client"),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(4000).optional(),
  customerId: z.string().uuid().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueAt: z.string().datetime().optional(),
  customFields: z.record(z.string(), z.unknown()).default({}),
});

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request);

  if (!auth || !requireApiScope(auth, "demands:write")) {
    return NextResponse.json({ error: "Chave de API invalida ou sem escopo." }, { status: 401 });
  }

  const parsed = createDemandSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido.", issues: parsed.error.issues }, { status: 400 });
  }

  if (parsed.data.type === "client") {
    if (!parsed.data.customerId) {
      return NextResponse.json({ error: "customerId e obrigatorio para demanda de cliente." }, { status: 400 });
    }

    const [customer] = await getDb()
      .select({ id: customers.id })
      .from(customers)
      .where(and(eq(customers.id, parsed.data.customerId), eq(customers.organizationId, auth.organizationId)))
      .limit(1);

    if (!customer) {
      return NextResponse.json({ error: "Cliente nao encontrado." }, { status: 404 });
    }
  }

  const status = await getInitialDemandStatus(auth.organizationId, parsed.data.type);
  const [demand] = await getDb()
    .insert(demands)
    .values({
      organizationId: auth.organizationId,
      customerId: parsed.data.customerId ?? null,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      priority: parsed.data.priority,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
      status,
      customFields: parsed.data.customFields,
    })
    .returning({ id: demands.id, title: demands.title, status: demands.status, priority: demands.priority });

  await getDb().insert(auditEvents).values({
    organizationId: auth.organizationId,
    actorId: null,
    entityType: "demand",
    entityId: demand.id,
    action: "demand.created",
    metadata: { source: "api", apiKeyId: auth.apiKeyId },
  });

  await applyDistributionRulesToDemand({
    organizationId: auth.organizationId,
    actorId: null,
    demandId: demand.id,
    demandType: parsed.data.type,
    priority: parsed.data.priority,
    teamId: null,
    customerId: parsed.data.customerId ?? null,
  });

  await dispatchWebhooks({
    organizationId: auth.organizationId,
    event: "demand.created",
    entityId: demand.id,
    data: demand,
  });

  return NextResponse.json({ demand }, { status: 201 });
}
