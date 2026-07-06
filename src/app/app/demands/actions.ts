"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getDb } from "@/db/client";
import { auditEvents, customers, demands } from "@/db/schema";
import {
  parseClientDemandFormData,
  parseDemandStatusUpdateFormData,
} from "@/lib/demands/demand-input";
import { getInitialDemandStatus } from "@/lib/demand-workflows";
import { applyDistributionRulesToDemand } from "@/lib/distribution/distribution-engine";
import { requireOrganizationContext } from "@/lib/organization-context";
import { dispatchWebhooks } from "@/lib/webhook-dispatcher";

async function ensureCustomerBelongsToOrganization(customerId: string, organizationId: string) {
  const [customer] = await getDb()
    .select({ id: customers.id })
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.organizationId, organizationId)))
    .limit(1);

  if (!customer) {
    notFound();
  }
}

export async function createClientDemandAction(formData: FormData) {
  const { session, organization } = await requireOrganizationContext();
  const values = parseClientDemandFormData(formData);

  await ensureCustomerBelongsToOrganization(values.customerId, organization.id);
  const status = await getInitialDemandStatus(organization.id, "client");

  const [demand] = await getDb()
    .insert(demands)
    .values({
      organizationId: organization.id,
      customerId: values.customerId,
      assigneeId: session.user.id,
      type: "client",
      title: values.title,
      description: values.description,
      status,
      priority: values.priority,
      dueAt: values.dueAt,
      customFields: {},
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
        customerId: values.customerId,
        priority: values.priority,
        status,
      },
    });

    await applyDistributionRulesToDemand({
      organizationId: organization.id,
      actorId: session.user.id,
      demandId: demand.id,
      demandType: "client",
      priority: values.priority,
      teamId: null,
      customerId: values.customerId,
    });

    await dispatchWebhooks({
      organizationId: organization.id,
      event: "demand.created",
      entityId: demand.id,
      data: {
        id: demand.id,
        customerId: values.customerId,
        priority: values.priority,
        status,
      },
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/demands");
  revalidatePath(`/app/customers/${values.customerId}`);
  redirect("/app/demands");
}

export async function updateClientDemandStatusAction(formData: FormData) {
  const { session, organization } = await requireOrganizationContext();
  const id = z.string().uuid().parse(formData.get("id"));
  const values = parseDemandStatusUpdateFormData(formData);

  const [existing] = await getDb()
    .select({
      id: demands.id,
      customerId: demands.customerId,
      status: demands.status,
      priority: demands.priority,
    })
    .from(demands)
    .where(
      and(
        eq(demands.id, id),
        eq(demands.organizationId, organization.id),
        eq(demands.type, "client"),
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
        previousStatus: existing.status,
        nextStatus: values.status,
        previousPriority: existing.priority,
        nextPriority: values.priority,
      },
    });

    await dispatchWebhooks({
      organizationId: organization.id,
      event: statusChanged ? "demand.status_changed" : "demand.updated",
      entityId: id,
      data: {
        id,
        previousStatus: existing.status,
        nextStatus: values.status,
        previousPriority: existing.priority,
        nextPriority: values.priority,
      },
    });
  }

  revalidatePath("/app");
  revalidatePath("/app/demands");
  revalidatePath(`/app/demands/${id}`);
  if (existing.customerId) {
    revalidatePath(`/app/customers/${existing.customerId}`);
  }
  redirect(`/app/demands/${id}`);
}
