import { z } from "zod";

export const customFieldEntityValues = ["customer"] as const;
export const customFieldTypeValues = ["text", "number", "date", "boolean", "select"] as const;

export const defaultDemandWorkflowStatuses = [
  { key: "open", label: "Aberta", isInitial: true, isFinal: false },
  { key: "in_progress", label: "Em andamento", isInitial: false, isFinal: false },
  { key: "waiting", label: "Aguardando", isInitial: false, isFinal: false },
  { key: "done", label: "Concluida", isInitial: false, isFinal: true },
  { key: "canceled", label: "Cancelada", isInitial: false, isFinal: true },
] as const;

export const customFieldDefinitionSchema = z.object({
  entityType: z.enum(customFieldEntityValues),
  label: z.string().trim().min(2).max(80),
  fieldType: z.enum(customFieldTypeValues),
  isRequired: z.coerce.boolean().default(false),
  options: z.string().trim().max(1000).optional(),
});

export const demandWorkflowStatusSchema = z.object({
  demandType: z.enum(["client", "internal"]),
  label: z.string().trim().min(2).max(80),
  isInitial: z.coerce.boolean().default(false),
  isFinal: z.coerce.boolean().default(false),
});

export type CustomFieldDefinitionInput = z.infer<typeof customFieldDefinitionSchema>;
export type DemandWorkflowStatusInput = z.infer<typeof demandWorkflowStatusSchema>;

export function toFieldKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)+/g, "")
    .slice(0, 48);
}

export function parseSelectOptions(value?: string) {
  return (
    value
      ?.split("\n")
      .map((option) => option.trim())
      .filter(Boolean)
      .slice(0, 30) ?? []
  );
}

export function parseCustomFieldValue(type: string, rawValue: FormDataEntryValue | null) {
  if (rawValue === null) {
    return null;
  }

  const value = String(rawValue).trim();

  if (!value) {
    return null;
  }

  if (type === "number") {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  if (type === "boolean") {
    return value === "true" || value === "on";
  }

  return value;
}
