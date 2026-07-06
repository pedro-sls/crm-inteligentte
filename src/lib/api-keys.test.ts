import { describe, expect, it } from "vitest";
import { createApiKey, getApiKeyPrefix, hashApiKey, verifyApiKeyHash } from "@/lib/api-keys";

describe("US-0602 - Chaves de API", () => {
  it("Cenario: chave gerada pode ser validada pelo hash sem salvar o segredo bruto", () => {
    const { key, prefix } = createApiKey();
    const hash = hashApiKey(key, "pepper-de-teste");

    expect(key).toMatch(/^crm_live_/);
    expect(prefix).toBe(getApiKeyPrefix(key));
    expect(hash).not.toContain(key);
    expect(verifyApiKeyHash(key, hash, "pepper-de-teste")).toBe(true);
    expect(verifyApiKeyHash(`${key}x`, hash, "pepper-de-teste")).toBe(false);
  });
});
