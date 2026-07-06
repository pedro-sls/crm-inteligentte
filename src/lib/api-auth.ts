import "server-only";

import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db/client";
import { apiKeys } from "@/db/schema";
import { getApiKeyPrefix, verifyApiKeyHash } from "@/lib/api-keys";

export type ApiAuthContext = {
  organizationId: string;
  apiKeyId: string;
  scopes: string[];
};

function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

export async function authenticateApiRequest(request: Request): Promise<ApiAuthContext | null> {
  const token = readBearerToken(request);

  if (!token) {
    return null;
  }

  const [apiKey] = await getDb()
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.prefix, getApiKeyPrefix(token)), isNull(apiKeys.revokedAt)))
    .limit(1);

  if (!apiKey || !verifyApiKeyHash(token, apiKey.keyHash)) {
    return null;
  }

  await getDb()
    .update(apiKeys)
    .set({ lastUsedAt: new Date(), updatedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id));

  return {
    organizationId: apiKey.organizationId,
    apiKeyId: apiKey.id,
    scopes: Array.isArray(apiKey.scopes) ? apiKey.scopes.filter((scope) => typeof scope === "string") : [],
  };
}

export function requireApiScope(context: ApiAuthContext, scope: string) {
  return context.scopes.includes(scope);
}
