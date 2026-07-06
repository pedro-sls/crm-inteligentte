"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/db/client";
import {
  distributionRules,
  organizationMembers,
  teams,
} from "@/db/schema";
import { parseDistributionRuleFormData } from "@/lib/distribution/distribution-rule-input";
import { requireOrganizationContext } from "@/lib/organization-context";

async function ensureMemberBelongsToOrganization(userId: string, organizationId: string) {
  const [member] = await getDb()
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId),
      ),
    )
    .limit(1);

  if (!member) {
    notFound();
  }
}

async function ensureTeamBelongsToOrganization(teamId: string, organizationId: string) {
  const [team] = await getDb()
    .select({ id: teams.id })
    .from(teams)
    .where(and(eq(teams.id, teamId), eq(teams.organizationId, organizationId)))
    .limit(1);

  if (!team) {
    notFound();
  }
}

export async function createDistributionRuleAction(formData: FormData) {
  const { organization } = await requireOrganizationContext();
  const values = parseDistributionRuleFormData(formData);

  const teamIds = [
    values.conditionTeamId,
    values.actionTeamId,
  ].filter((value): value is string => Boolean(value));

  for (const teamId of new Set(teamIds)) {
    await ensureTeamBelongsToOrganization(teamId, organization.id);
  }

  if (values.actionAssigneeId) {
    await ensureMemberBelongsToOrganization(values.actionAssigneeId, organization.id);
  }

  await getDb().insert(distributionRules).values({
    organizationId: organization.id,
    name: values.name,
    isActive: values.isActive,
    conditionDemandType: values.conditionDemandType,
    conditionPriority: values.conditionPriority,
    conditionTeamId: values.conditionTeamId,
    conditionCustomerStatus: values.conditionCustomerStatus,
    actionTeamId: values.actionTeamId,
    actionAssigneeId: values.actionAssigneeId,
    actionPriority: values.actionPriority,
  });

  revalidatePath("/app");
  revalidatePath("/app/distribution-rules");
  redirect("/app/distribution-rules");
}
