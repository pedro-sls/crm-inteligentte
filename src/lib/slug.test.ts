import { describe, expect, it } from "vitest";
import { toSlug } from "@/lib/slug";

describe("slug de organizacao", () => {
  it("Cenario: nome com acentos e espacos vira slug seguro", () => {
    expect(toSlug("Inteligentte São Paulo CRM")).toBe("inteligentte-sao-paulo-crm");
  });

  it("Cenario: caracteres especiais sao removidos das pontas", () => {
    expect(toSlug(" *** Minha Empresa!!! ")).toBe("minha-empresa");
  });
});
