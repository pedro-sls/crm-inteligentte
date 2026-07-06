import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerForm } from "@/components/customers/customer-form";
import { createCustomerAction } from "@/app/app/customers/actions";
import { getDb } from "@/db/client";
import { customFieldDefinitions } from "@/db/schema";
import { requireOrganizationContext } from "@/lib/organization-context";
import { and, asc, eq } from "drizzle-orm";

export default async function NewCustomerPage() {
  const { organization } = await requireOrganizationContext();
  const customFields = await getDb()
    .select()
    .from(customFieldDefinitions)
    .where(
      and(
        eq(customFieldDefinitions.organizationId, organization.id),
        eq(customFieldDefinitions.entityType, "customer"),
        eq(customFieldDefinitions.isActive, true),
      ),
    )
    .orderBy(asc(customFieldDefinitions.position), asc(customFieldDefinitions.label));

  return (
    <section className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Novo cliente</CardTitle>
          <p className="text-sm text-muted-foreground">
            O registro sera vinculado automaticamente a organizacao ativa.
          </p>
        </CardHeader>
        <CardContent>
          <CustomerForm action={createCustomerAction} customFields={customFields} />
        </CardContent>
      </Card>
    </section>
  );
}
