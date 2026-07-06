import { describe, expect, it } from "vitest";
import { getAuthAllowedHosts, getAuthTrustedOrigins } from "@/lib/auth-url";

describe("configuracao de URLs de autenticacao", () => {
  it("Cenario: ambiente local aceita localhost e redes privadas", () => {
    const hosts = getAuthAllowedHosts(
      {
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      },
      "development",
    );

    expect(hosts).toContain("localhost:3000");
    expect(hosts).toContain("192.168.*.*:*");
    expect(hosts).toContain("10.*.*.*:*");
    expect(hosts).toContain("172.16.*.*:*");
    expect(hosts).toContain("172.31.*.*:*");
  });

  it("Cenario: origens adicionais podem ser configuradas sem expor segredos", () => {
    const origins = getAuthTrustedOrigins(
      {
        AUTH_TRUSTED_ORIGINS: "https://crm.exemplo.com, https://preview-*.vercel.app",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      },
      "production",
    );

    expect(origins).toEqual([
      "http://localhost:3000",
      "https://crm.exemplo.com",
      "https://preview-*.vercel.app",
    ]);
  });

  it("Cenario: producao nao libera rede privada por padrao", () => {
    const hosts = getAuthAllowedHosts(
      {
        AUTH_ALLOWED_HOSTS: "crm.exemplo.com",
        NEXT_PUBLIC_APP_URL: "https://crm.exemplo.com",
      },
      "production",
    );

    expect(hosts).toEqual(["crm.exemplo.com"]);
  });
});
