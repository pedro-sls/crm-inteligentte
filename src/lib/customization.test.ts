import { describe, expect, it } from "vitest";
import { parseCustomFieldValue, parseSelectOptions, toFieldKey } from "@/lib/customization";

describe("US-0701 - Campos personalizados", () => {
  it("Cenario: nome do campo vira chave tecnica segura", () => {
    expect(toFieldKey("Data da Última Reunião")).toBe("data_da_ultima_reuniao");
  });

  it("Cenario: opcoes de selecao sao normalizadas", () => {
    expect(parseSelectOptions(" Ouro \n\n Prata \n Bronze ")).toEqual(["Ouro", "Prata", "Bronze"]);
  });

  it("Cenario: valores sao convertidos pelo tipo do campo", () => {
    expect(parseCustomFieldValue("number", "42")).toBe(42);
    expect(parseCustomFieldValue("boolean", "on")).toBe(true);
    expect(parseCustomFieldValue("text", " Cliente VIP ")).toBe("Cliente VIP");
  });
});
