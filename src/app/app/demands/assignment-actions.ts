"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getDb } from "@/db/client";
import {
  auditEvents,
  demands,
  organizationMembers,
  teams,
} from "@/db/schema";
import { parseDemandAssignmentFormData } from "@/lib/distribution/distribution-rule-input";
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

export async function updateDemandAssignmentAction(formData: FormData) {
  const { session, organization } = await requireOrganizationContext();
  const values = parseDemandAssignmentFormData(formData);

  if (values.assigneeId) {
    await ensureMemberBelongsToOrganization(values.assigneeId, organization.id);
  }

  if (values.teamId) {
    await ensureTeamBelongsToOrganization(values.teamId, organization.id);
  }

  const [existing] = await getDb()
    .select({
      id: demands.id,
      customerId: demands.customerId,
      type: demands.type,
      assigneeId: demands.assigneeId,
      teamId: demands.teamId,
    })
    .from(demands)
    .where(
      and(
        eq(demands.id, values.id),
        eq(demands.organizationId, organization.id),
        eq(demands.type, values.demandType),
      ),
    )
    .limit(1);

  if (!existing) {
    notFound();
  }

  await getDb()
    .update(demands)
    .set({
      assigneeId: values.assigneeId,
      teamId: values.teamId,
      updatedAt: new Date(),
    })
    .where(and(eq(demands.id, values.id), eq(demands.organizationId, organization.id)));

  await getDb().insert(auditEvents).values({
    organizationId: organization.id,
    actorId: session.user.id,
    entityType: "demand",
    entityId: values.id,
    action: "demand.assigned",
    metadata: {
      previousAssigneeId: existing.assigneeId,
      nextAssigneeId: values.assigneeId,
      previousTeamId: existing.teamId,
      nextTeamId: values.teamId,
    },
  });

  revalidatePath("/app");
  revalidatePath("/app/demands");
  revalidatePath("/app/internal-demands");
  revalidatePath(`/app/demands/${values.id}`);
  revalidatePath(`/app/internal-demands/${values.id}`);
  if (existing.customerId) {
    revalidatePath(`/app/customers/${existing.customerId}`);
  }

  redirect(values.demandType === "client" ? `/app/demands/${values.id}` : `/app/internal-demands/${values.id}`);
}
