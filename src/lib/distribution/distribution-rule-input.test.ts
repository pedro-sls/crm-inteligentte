import { describe, expect, it } from "vitest";
import {
  parseDemandAssignmentFormData,
  parseDistributionRuleFormData,
} from "@/lib/distribution/distribution-rule-input";

function createFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe("US-0501 - Atribuir demanda manualmente", () => {
  it("Cenario: responsavel e equipe validos sao aceitos", () => {
    const values = parseDemandAssignmentFormData(
      createFormData({
        id: "11111111-1111-4111-8111-111111111111",
        demandType: "client",
        assigneeId: "22222222-2222-4222-8222-222222222222",
        teamId: "33333333-3333-4333-8333-333333333333",
      }),
    );

    expect(values.assigneeId).toBe("22222222-2222-4222-8222-222222222222");
    expect(values.teamId).toBe("33333333-3333-4333-8333-333333333333");
  });

  it("Cenario: atribuicao pode remover responsavel", () => {
    const values = parseDemandAssignmentFormData(
      createFormData({
        id: "11111111-1111-4111-8111-111111111111",
        demandType: "internal",
        assigneeId: "none",
        teamId: "none",
      }),
    );

    expect(values.assigneeId).toBeNull();
    expect(values.teamId).toBeNull();
  });
});

describe("US-0502 - Configurar regra simples de distribuicao", () => {
  it("Cenario: regra urgente ativa com responsavel e aceita", () => {
    const formData = createFormData({
      name: "Urgentes para Operacoes",
      isActive: "on",
      conditionDemandType: "internal",
      conditionPriority: "urgent",
      conditionTeamId: "all",
      conditionCustomerStatus: "all",
      actionTeamId: "33333333-3333-4333-8333-333333333333",
      actionAssigneeId: "22222222-2222-4222-8222-222222222222",
      actionPriority: "keep",
    });

    expect(parseDistributionRuleFormData(formData)).toEqual({
      name: "Urgentes para Operacoes",
      isActive: true,
      conditionDemandType: "internal",
      conditionPriority: "urgent",
      conditionTeamId: null,
      conditionCustomerStatus: null,
      actionTeamId: "33333333-3333-4333-8333-333333333333",
      actionAssigneeId: "22222222-2222-4222-8222-222222222222",
      actionPriority: null,
    });
  });

  it("Cenario: regra sem acao nao deve ser salva", () => {
    expect(() =>
      parseDistributionRuleFormData(
        createFormData({
          name: "Sem acao",
          conditionDemandType: "all",
          conditionPriority: "all",
          actionTeamId: "none",
          actionAssigneeId: "none",
          actionPriority: "keep",
        }),
      ),
    ).toThrow();
  });
});
