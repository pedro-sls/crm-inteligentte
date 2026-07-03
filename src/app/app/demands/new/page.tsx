import Link from "next/link";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemandForm } from "@/components/demands/demand-form";
import { createClientDemandAction } from "@/app/app/demands/actions";
import { getDb } from "@/db/client";
import { customers } from "@/db/schema";
import { requireOrganizationContext } from "@/lib/organization-context";

export default async function NewDemandPage() {
  const { organization } = await requireOrganizationContext();
  const customerRows = await getDb()
    .select({ id: customers.id, name: customers.name })
    .from(customers)
    .where(eq(customers.organizationId, organization.id))
    .orderBy(customers.name);

  return (
    <section className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Nova demanda de cliente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Toda demanda de cliente precisa estar vinculada a um cliente desta organizacao.
          </p>
        </CardHeader>
        <CardContent>
          {customerRows.length > 0 ? (
            <DemandForm action={createClientDemandAction} customers={customerRows} />
          ) : (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center">
              <p className="text-sm font-medium">Cadastre um cliente antes de criar demandas.</p>
              <Button asChild>
                <Link href="/app/customers/new">Novo cliente</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
