import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db/client";
import { customers } from "@/db/schema";
import { authenticateApiRequest, requireApiScope } from "@/lib/api-auth";
import { dispatchWebhooks } from "@/lib/webhook-dispatcher";

const createCustomerSchema = z.object({
  name: z.string().trim().min(2).max(160),
  document: z.string().trim().max(64).optional(),
  email: z.string().trim().email().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  website: z.string().trim().url().max(200).optional(),
  status: z.enum(["prospect", "active", "at_risk", "inactive"]).default("prospect"),
  customFields: z.record(z.string(), z.unknown()).default({}),
});

export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request);

  if (!auth || !requireApiScope(auth, "customers:write")) {
    return NextResponse.json({ error: "Chave de API invalida ou sem escopo." }, { status: 401 });
  }

  const parsed = createCustomerSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return NextResponse.json({ error: "Payload invalido.", issues: parsed.error.issues }, { status: 400 });
  }

  const [customer] = await getDb()
    .insert(customers)
    .values({
      organizationId: auth.organizationId,
      name: parsed.data.name,
      document: parsed.data.document ?? null,
      email: parsed.data.email ?? null,
      phone: parsed.data.phone ?? null,
      website: parsed.data.website ?? null,
      status: parsed.data.status,
      customFields: parsed.data.customFields,
    })
    .returning({ id: customers.id, name: customers.name, status: customers.status });

  await dispatchWebhooks({
    organizationId: auth.organizationId,
    event: "customer.created",
    entityId: customer.id,
    data: customer,
  });

  return NextResponse.json({ customer }, { status: 201 });
}
