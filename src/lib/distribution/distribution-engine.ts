import "server-only";

import { and, asc, eq, isNull, or } from "drizzle-orm";
import { getDb } from "@/db/client";
import { auditEvents, customers, demands, distributionRules } from "@/db/schema";
import {
  doesDistributionRuleMatch,
  type DistributionCustomerStatus,
  type DistributionDemandType,
} from "@/lib/distribution/distribution-rule";
import { type DemandPriority } from "@/lib/demands/demand-status";

type ApplyDistributionRulesInput = {
  organizationId: string;
  actorId: string | null;
  demandId: string;
  demandType: DistributionDemandType;
  priority: DemandPriority;
  teamId: string | null;
  customerId: string | null;
};

async function getCustomerStatus(customerId: string | null, organizationId: string) {
  if (!customerId) {
    return null;
  }

  const [customer] = await getDb()
    .select({ status: customers.status })
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.organizationId, organizationId)))
    .limit(1);

  return customer?.status ?? null;
}

export async function applyDistributionRulesToDemand(input: ApplyDistributionRulesInput) {
  const customerStatus = await getCustomerStatus(input.customerId, input.organizationId);
  const rules = await getDb()
    .select({
      id: distributionRules.id,
      name: distributionRules.name,
      isActive: distributionRules.isActive,
      conditionDemandType: distributionRules.conditionDemandType,
      conditionPriority: distributionRules.conditionPriority,
      conditionTeamId: distributionRules.conditionTeamId,
      conditionCustomerStatus: distributionRules.conditionCustomerStatus,
      actionTeamId: distributionRules.actionTeamId,
      actionAssigneeId: distributionRules.actionAssigneeId,
      actionPriority: distributionRules.actionPriority,
    })
    .from(distributionRules)
    .where(
      and(
        eq(distributionRules.organizationId, input.organizationId),
        eq(distributionRules.isActive, true),
        or(
          isNull(distributionRules.conditionDemandType),
          eq(distributionRules.conditionDemandType, input.demandType),
        ),
        or(
          isNull(distributionRules.conditionPriority),
          eq(distributionRules.conditionPriority, input.priority),
        ),
      ),
    )
    .orderBy(asc(distributionRules.createdAt))
    .limit(20);

  const matchingRule = rules.find((rule) =>
    doesDistributionRuleMatch(rule, {
      type: input.demandType,
      priority: input.priority,
      status: "open",
      teamId: input.teamId,
      customerStatus: customerStatus as DistributionCustomerStatus | null,
    }),
  );

  if (!matchingRule) {
    return null;
  }

  const nextTeamId = matchingRule.actionTeamId ?? input.teamId;
  const nextAssigneeId = matchingRule.actionAssigneeId ?? undefined;
  const nextPriority = matchingRule.actionPriority ?? input.priority;

  await getDb()
    .update(demands)
    .set({
      teamId: nextTeamId,
      assigneeId: nextAssigneeId,
      priority: nextPriority,
      updatedAt: new Date(),
    })
    .where(and(eq(demands.id, input.demandId), eq(demands.organizationId, input.organizationId)));

  await getDb().insert(auditEvents).values({
    organizationId: input.organizationId,
    actorId: input.actorId,
    entityType: "demand",
    entityId: input.demandId,
    action: "distribution_rule.applied",
    metadata: {
      ruleId: matchingRule.id,
      ruleName: matchingRule.name,
      previousTeamId: input.teamId,
      nextTeamId,
      nextAssigneeId,
      previousPriority: input.priority,
      nextPriority,
    },
  });

  return matchingRule;
}
