import { NextResponse } from "next/server";
import { getDb } from "@/db/client";
import { apiKeys } from "@/db/schema";
import { createApiKey, hashApiKey } from "@/lib/api-keys";
import { getOrganizationMembership } from "@/lib/organization-context";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const membership = await getOrganizationMembership(
    session.user.id,
    session.session.activeOrganizationId,
  );

  if (!membership) {
    return NextResponse.json({ error: "Organizacao nao encontrada." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : "Chave de API";
  const { key, prefix } = createApiKey();

  await getDb().insert(apiKeys).values({
    organizationId: membership.organizationId,
    name,
    prefix,
    keyHash: hashApiKey(key),
  });

  return NextResponse.json({ key, prefix });
}
