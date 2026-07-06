import { type DemandPriority, type DemandStatus } from "@/lib/demands/demand-status";

export type DistributionDemandType = "client" | "internal";
export type DistributionCustomerStatus = "prospect" | "active" | "at_risk" | "inactive";

export type DistributionRuleCandidate = {
  isActive: boolean;
  conditionDemandType: DistributionDemandType | null;
  conditionPriority: DemandPriority | null;
  conditionTeamId: string | null;
  conditionCustomerStatus: DistributionCustomerStatus | null;
  actionTeamId: string | null;
  actionAssigneeId: string | null;
  actionPriority: DemandPriority | null;
};

export type DistributionDemandCandidate = {
  type: DistributionDemandType;
  priority: DemandPriority;
  status: DemandStatus;
  teamId: string | null;
  customerStatus: DistributionCustomerStatus | null;
};

export function distributionRuleHasAction(rule: DistributionRuleCandidate) {
  return Boolean(rule.actionTeamId || rule.actionAssigneeId || rule.actionPriority);
}

export function doesDistributionRuleMatch(
  rule: DistributionRuleCandidate,
  demand: DistributionDemandCandidate,
) {
  if (!rule.isActive || !distributionRuleHasAction(rule)) {
    return false;
  }

  if (rule.conditionDemandType && rule.conditionDemandType !== demand.type) {
    return false;
  }

  if (rule.conditionPriority && rule.conditionPriority !== demand.priority) {
    return false;
  }

  if (rule.conditionTeamId && rule.conditionTeamId !== demand.teamId) {
    return false;
  }

  if (rule.conditionCustomerStatus && rule.conditionCustomerStatus !== demand.customerStatus) {
    return false;
  }

  return true;
}
