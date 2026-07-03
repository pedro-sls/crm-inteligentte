import { asc, eq } from "drizzle-orm";
import { InternalDemandForm } from "@/components/demands/internal-demand-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createInternalDemandAction } from "@/app/app/internal-demands/actions";
import { getDb } from "@/db/client";
import { teams } from "@/db/schema";
import { requireOrganizationContext } from "@/lib/organization-context";

export default async function NewInternalDemandPage() {
  const { organization } = await requireOrganizationContext();
  const teamOptions = await getDb()
    .select({
      id: teams.id,
      name: teams.name,
    })
    .from(teams)
    .where(eq(teams.organizationId, organization.id))
    .orderBy(asc(teams.name));

  return (
    <section className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Nova demanda interna</CardTitle>
        </CardHeader>
        <CardContent>
          <InternalDemandForm action={createInternalDemandAction} teams={teamOptions} />
        </CardContent>
      </Card>
    </section>
  );
}
