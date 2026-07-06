"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db/client";
import { customFieldDefinitions, demandWorkflowStatuses } from "@/db/schema";
import {
  customFieldDefinitionSchema,
  demandWorkflowStatusSchema,
  parseSelectOptions,
  toFieldKey,
} from "@/lib/customization";
import { requireOrganizationContext } from "@/lib/organization-context";

export async function createCustomFieldAction(formData: FormData) {
  const { organization } = await requireOrganizationContext();
  const values = customFieldDefinitionSchema.parse({
    entityType: formData.get("entityType"),
    label: formData.get("label"),
    fieldType: formData.get("fieldType"),
    isRequired: formData.get("isRequired") === "on",
    options: formData.get("options"),
  });

  await getDb().insert(customFieldDefinitions).values({
    organizationId: organization.id,
    entityType: values.entityType,
    key: toFieldKey(values.label),
    label: values.label,
    fieldType: values.fieldType,
    isRequired: values.isRequired,
    options: values.fieldType === "select" ? parseSelectOptions(values.options) : [],
  });

  revalidatePath("/app/settings");
}

export async function createDemandWorkflowStatusAction(formData: FormData) {
  const { organization } = await requireOrganizationContext();
  const values = demandWorkflowStatusSchema.parse({
    demandType: formData.get("demandType"),
    label: formData.get("label"),
    isInitial: formData.get("isInitial") === "on",
    isFinal: formData.get("isFinal") === "on",
  });
  const key = toFieldKey(values.label).replaceAll("_", "-");

  if (values.isInitial) {
    await getDb()
      .update(demandWorkflowStatuses)
      .set({ isInitial: false, updatedAt: new Date() })
      .where(
        and(
          eq(demandWorkflowStatuses.organizationId, organization.id),
          eq(demandWorkflowStatuses.demandType, values.demandType),
        ),
      );
  }

  await getDb().insert(demandWorkflowStatuses).values({
    organizationId: organization.id,
    demandType: values.demandType,
    key,
    label: values.label,
    isInitial: values.isInitial,
    isFinal: values.isFinal,
  });

  revalidatePath("/app/settings");
}
