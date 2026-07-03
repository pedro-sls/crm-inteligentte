import { describe, expect, it } from "vitest";
import { parseTeamFormData } from "@/lib/teams/team-input";

function makeFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe("US-0402 - Cadastro de equipes", () => {
  it("Cenario: equipe com nome e descricao validos e aceita", () => {
    const values = parseTeamFormData(
      makeFormData({
        name: "Operacoes",
        description: "Equipe responsavel por demandas internas",
      }),
    );

    expect(values).toEqual({
      name: "Operacoes",
      description: "Equipe responsavel por demandas internas",
    });
  });

  it("Cenario: equipe nao pode ser criada sem nome", () => {
    expect(() =>
      parseTeamFormData(
        makeFormData({
          name: "",
          description: "Sem nome",
        }),
      ),
    ).toThrow();
  });
});
