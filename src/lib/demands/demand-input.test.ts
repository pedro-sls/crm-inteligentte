import { describe, expect, it } from "vitest";
import {
  parseClientDemandFormData,
  parseDemandStatusUpdateFormData,
  parseInternalDemandFormData,
} from "@/lib/demands/demand-input";

const customerId = "11111111-1111-4111-8111-111111111111";

function createFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe("US-0301 - Criar demanda para cliente", () => {
  it("Cenario: demanda de cliente exige cliente vinculado e dados validos", () => {
    const formData = createFormData({
      customerId,
      title: "  Revisar contrato  ",
      description: "  Cliente pediu revisao  ",
      priority: "high",
      dueAt: "2026-07-20",
    });

    expect(parseClientDemandFormData(formData)).toEqual({
      customerId,
      title: "Revisar contrato",
      description: "Cliente pediu revisao",
      priority: "high",
      dueAt: new Date("2026-07-20T12:00:00.000Z"),
    });
  });

  it("Cenario: demanda sem cliente vinculado e rejeitada", () => {
    const formData = createFormData({
      title: "Demanda sem cliente",
      priority: "medium",
      dueAt: "",
    });

    expect(() => parseClientDemandFormData(formData)).toThrow();
  });
});

describe("US-0302 - Alterar status e prioridade da demanda", () => {
  it("Cenario: status e prioridade validos sao aceitos", () => {
    const formData = createFormData({
      status: "in_progress",
      priority: "urgent",
    });

    expect(parseDemandStatusUpdateFormData(formData)).toEqual({
      status: "in_progress",
      priority: "urgent",
    });
  });

  it("Cenario: status customizado configurado pode ser salvo", () => {
    const formData = createFormData({
      status: "em_revisao",
      priority: "urgent",
    });

    expect(parseDemandStatusUpdateFormData(formData)).toEqual({
      status: "em_revisao",
      priority: "urgent",
    });
  });
});

describe("US-0401 - Criar demanda interna", () => {
  it("Cenario: demanda interna nao exige cliente vinculado", () => {
    const values = parseInternalDemandFormData(
      createFormData({
        title: "Revisar processo financeiro",
        description: "Organizar pendencias internas",
        priority: "medium",
        dueAt: "",
        area: "Financeiro",
        project: "Rotina operacional",
        teamId: "",
      }),
    );

    expect(values).toEqual({
      title: "Revisar processo financeiro",
      description: "Organizar pendencias internas",
      priority: "medium",
      dueAt: null,
      area: "Financeiro",
      project: "Rotina operacional",
      teamId: null,
    });
  });

  it("Cenario: demanda interna pode ser vinculada a uma equipe", () => {
    const teamId = "8d3af5af-a784-4df1-a5a5-d6d94614ecb4";
    const values = parseInternalDemandFormData(
      createFormData({
        title: "Preparar onboarding",
        priority: "high",
        teamId,
      }),
    );

    expect(values.teamId).toBe(teamId);
    expect(values.priority).toBe("high");
  });
});
