import { describe, expect, it } from "vitest";
import {
  distributionRuleHasAction,
  doesDistributionRuleMatch,
  type DistributionDemandCandidate,
  type DistributionRuleCandidate,
} from "@/lib/distribution/distribution-rule";

const urgentInternalDemand: DistributionDemandCandidate = {
  type: "internal",
  priority: "urgent",
  status: "open",
  teamId: null,
  customerStatus: null,
};

const assignUrgentRule: DistributionRuleCandidate = {
  isActive: true,
  conditionDemandType: "internal",
  conditionPriority: "urgent",
  conditionTeamId: null,
  conditionCustomerStatus: null,
  actionTeamId: "11111111-1111-4111-8111-111111111111",
  actionAssigneeId: "22222222-2222-4222-8222-222222222222",
  actionPriority: null,
};

describe("US-0502 - Regra simples de distribuicao", () => {
  it("Cenario: regra ativa para demandas urgentes deve ser aplicavel", () => {
    expect(distributionRuleHasAction(assignUrgentRule)).toBe(true);
    expect(doesDistributionRuleMatch(assignUrgentRule, urgentInternalDemand)).toBe(true);
  });

  it("Cenario: regra inativa nao deve ser aplicada", () => {
    expect(
      doesDistributionRuleMatch(
        {
          ...assignUrgentRule,
          isActive: false,
        },
        urgentInternalDemand,
      ),
    ).toBe(false);
  });

  it("Cenario: prioridade diferente impede aplicacao da regra", () => {
    expect(
      doesDistributionRuleMatch(assignUrgentRule, {
        ...urgentInternalDemand,
        priority: "medium",
      }),
    ).toBe(false);
  });
});
