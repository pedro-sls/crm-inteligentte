"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db/client";
import { teams } from "@/db/schema";
import { parseTeamFormData } from "@/lib/teams/team-input";
import { requireOrganizationContext } from "@/lib/organization-context";

export async function createTeamAction(formData: FormData) {
  const { organization } = await requireOrganizationContext();
  const values = parseTeamFormData(formData);

  await getDb().insert(teams).values({
    organizationId: organization.id,
    name: values.name,
    description: values.description,
  });

  revalidatePath("/app");
  revalidatePath("/app/teams");
  revalidatePath("/app/internal-demands");
  redirect("/app/teams");
}
