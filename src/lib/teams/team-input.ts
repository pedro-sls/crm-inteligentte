import { z } from "zod";

export const teamInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
});

export type TeamInput = {
  name: string;
  description: string | null;
};

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function optionalValue(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

export function parseTeamFormData(formData: FormData): TeamInput {
  const parsed = teamInputSchema.parse({
    name: formString(formData, "name"),
    description: formString(formData, "description"),
  });

  return {
    name: parsed.name,
    description: optionalValue(parsed.description),
  };
}
