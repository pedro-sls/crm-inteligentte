import { z } from "zod";
import { type DemandPriority, type DemandStatus } from "@/lib/demands/demand-status";

export const demandStatusValues = ["open", "in_progress", "waiting", "done", "canceled"] as const;
export const demandPriorityValues = ["low", "medium", "high", "urgent"] as const;

const optionalDateSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? new Date(`${value}T12:00:00.000Z`) : null))
  .refine((value) => value === null || !Number.isNaN(value.getTime()), {
    message: "Data invalida.",
  });

export const clientDemandInputSchema = z.object({
  customerId: z.string().uuid(),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(4000).optional(),
  priority: z.enum(demandPriorityValues),
  dueAt: optionalDateSchema,
});

export const demandStatusUpdateSchema = z.object({
  status: z.enum(demandStatusValues),
  priority: z.enum(demandPriorityValues),
});

export type ClientDemandInput = {
  customerId: string;
  title: string;
  description: string | null;
  priority: DemandPriority;
  dueAt: Date | null;
};

export type DemandStatusUpdateInput = {
  status: DemandStatus;
  priority: DemandPriority;
};

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function optionalValue(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

export function parseClientDemandFormData(formData: FormData): ClientDemandInput {
  const parsed = clientDemandInputSchema.parse({
    customerId: formString(formData, "customerId"),
    title: formString(formData, "title"),
    description: formString(formData, "description"),
    priority: formString(formData, "priority"),
    dueAt: formString(formData, "dueAt"),
  });

  return {
    customerId: parsed.customerId,
    title: parsed.title,
    description: optionalValue(parsed.description),
    priority: parsed.priority,
    dueAt: parsed.dueAt,
  };
}

export function parseDemandStatusUpdateFormData(formData: FormData): DemandStatusUpdateInput {
  return demandStatusUpdateSchema.parse({
    status: formString(formData, "status"),
    priority: formString(formData, "priority"),
  });
}
