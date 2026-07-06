import { z } from "zod";
import {
  demandPriorityValues,
  demandStatusValues,
} from "@/lib/demands/demand-input";

const demandTypeValues = ["client", "internal"] as const;
const customerStatusValues = ["prospect", "active", "at_risk", "inactive"] as const;
const nullableUuidSchema = z
  .string()
  .optional()
  .transform((value) => (value && value !== "all" && value !== "none" ? value : null))
  .pipe(z.string().uuid().nullable());

const nullableDemandTypeSchema = z
  .string()
  .optional()
  .transform((value) => (value && value !== "all" ? value : null))
  .pipe(z.enum(demandTypeValues).nullable());

const nullablePrioritySchema = z
  .string()
  .optional()
  .transform((value) => (value && value !== "all" && value !== "keep" ? value : null))
  .pipe(z.enum(demandPriorityValues).nullable());

const nullableCustomerStatusSchema = z
  .string()
  .optional()
  .transform((value) => (value && value !== "all" ? value : null))
  .pipe(z.enum(customerStatusValues).nullable());

export const demandAssignmentInputSchema = z.object({
  id: z.string().uuid(),
  assigneeId: nullableUuidSchema,
  teamId: nullableUuidSchema,
  demandType: z.enum(demandTypeValues),
});

export const distributionRuleInputSchema = z
  .object({
    name: z.string().trim().min(2).max(140),
    isActive: z.boolean(),
    conditionDemandType: nullableDemandTypeSchema,
    conditionPriority: nullablePrioritySchema,
    conditionTeamId: nullableUuidSchema,
    conditionCustomerStatus: nullableCustomerStatusSchema,
    actionTeamId: nullableUuidSchema,
    actionAssigneeId: nullableUuidSchema,
    actionPriority: nullablePrioritySchema,
  })
  .refine((value) => value.actionTeamId || value.actionAssigneeId || value.actionPriority, {
    message: "Configure pelo menos uma acao de distribuicao.",
    path: ["actionAssigneeId"],
  });

export const distributionRuleExecutionInputSchema = z.object({
  demandType: z.enum(demandTypeValues),
  priority: z.enum(demandPriorityValues),
  status: z.enum(demandStatusValues),
  teamId: nullableUuidSchema,
  customerStatus: nullableCustomerStatusSchema,
});

export type DemandAssignmentInput = z.infer<typeof demandAssignmentInputSchema>;
export type DistributionRuleInput = z.infer<typeof distributionRuleInputSchema>;

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function formBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function parseDemandAssignmentFormData(formData: FormData): DemandAssignmentInput {
  return demandAssignmentInputSchema.parse({
    id: formString(formData, "id"),
    assigneeId: formString(formData, "assigneeId"),
    teamId: formString(formData, "teamId"),
    demandType: formString(formData, "demandType"),
  });
}

export function parseDistributionRuleFormData(formData: FormData): DistributionRuleInput {
  return distributionRuleInputSchema.parse({
    name: formString(formData, "name"),
    isActive: formBoolean(formData, "isActive"),
    conditionDemandType: formString(formData, "conditionDemandType"),
    conditionPriority: formString(formData, "conditionPriority"),
    conditionTeamId: formString(formData, "conditionTeamId"),
    conditionCustomerStatus: formString(formData, "conditionCustomerStatus"),
    actionTeamId: formString(formData, "actionTeamId"),
    actionAssigneeId: formString(formData, "actionAssigneeId"),
    actionPriority: formString(formData, "actionPriority"),
  });
}
