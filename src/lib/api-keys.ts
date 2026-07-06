import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const API_KEY_PREFIX = "crm_live";

export function createApiKey() {
  const secret = randomBytes(32).toString("base64url");
  const key = `${API_KEY_PREFIX}_${secret}`;

  return {
    key,
    prefix: key.slice(0, 18),
  };
}

export function hashApiKey(key: string, pepper = process.env.API_KEY_PEPPER ?? "") {
  return createHash("sha256").update(`${pepper}:${key}`).digest("hex");
}

export function getApiKeyPrefix(key: string) {
  return key.slice(0, 18);
}

export function verifyApiKeyHash(key: string, expectedHash: string, pepper = process.env.API_KEY_PEPPER ?? "") {
  const actualHash = hashApiKey(key, pepper);
  const actual = Buffer.from(actualHash, "hex");
  const expected = Buffer.from(expectedHash, "hex");

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
