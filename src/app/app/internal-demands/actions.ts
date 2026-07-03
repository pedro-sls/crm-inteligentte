"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db/client";
import { auditEvents, demands, teams } from "@/db/schema";
import {
  parseDemandStatusUpdateFormData,
  parseInternalDemandFormData,
} from "@/lib/demands/demand-input";
import { requireOrganizationContext } from "@/lib/organization-context";

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

export async function createInternalDemandAction(formData: FormData) {
  const { session, organization } = await requireOrganizationContext();
  const values = parseInternalDemandFormData(formData);

  if (values.teamId) {
    await ensureTeamBelongsToOrganization(values.teamId, organization.id);
  }

  const [demand] = await getDb()
    .insert(demands)
    .values({
      organizationId: organization.id,
      teamId: values.teamId,
      assigneeId: session.user.id,
      type: "internal",
      title: values.title,
      description: values.description,
      priority: values.priority,
      dueAt: values.dueAt,
      customFields: {
        area: values.area,
        project: values.project,
      },
    })
    .returning({ id: demands.id });

  if (demand) {
    await getDb().insert(auditEvents).values({
      organizationId: organization.id,
      actorId: session.user.id,
      entityType: "demand",
      entityId: demand.id,
      action: "demand.created",
      metadata: {
        type: "internal",
        teamId: values.teamId,
        priority: values.priority,
        status: "open",
      },
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/internal-demands");
  redirect("/app/internal-demands");
}

export async function updateInternalDemandStatusAction(formData: FormData) {
  const { session, organization } = await requireOrganizationContext();
  const id = z.string().uuid().parse(formData.get("id"));
  const values = parseDemandStatusUpdateFormData(formData);

  const [existing] = await getDb()
    .select({
      id: demands.id,
      status: demands.status,
      priority: demands.priority,
    })
    .from(demands)
    .where(
      and(
        eq(demands.id, id),
        eq(demands.organizationId, organization.id),
        eq(demands.type, "internal"),
      ),
    )
    .limit(1);

  if (!existing) {
    notFound();
  }

  await getDb()
    .update(demands)
    .set({
      status: values.status,
      priority: values.priority,
      updatedAt: new Date(),
    })
    .where(and(eq(demands.id, id), eq(demands.organizationId, organization.id)));

  const statusChanged = existing.status !== values.status;
  const priorityChanged = existing.priority !== values.priority;

  if (statusChanged || priorityChanged) {
    await getDb().insert(auditEvents).values({
      organizationId: organization.id,
      actorId: session.user.id,
      entityType: "demand",
      entityId: id,
      action: statusChanged ? "demand.status_changed" : "demand.updated",
      metadata: {
        type: "internal",
        previousStatus: existing.status,
        nextStatus: values.status,
        previousPriority: existing.priority,
        nextPriority: values.priority,
      },
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/internal-demands");
  revalidatePath(`/app/internal-demands/${id}`);
  redirect(`/app/internal-demands/${id}`);
}
