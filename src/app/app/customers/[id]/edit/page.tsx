import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerForm } from "@/components/customers/customer-form";
import { updateCustomerAction } from "@/app/app/customers/actions";
import { getDb } from "@/db/client";
import { customers } from "@/db/schema";
import { requireOrganizationContext } from "@/lib/organization-context";

type EditCustomerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getNotes(customFields: unknown) {
  if (!customFields || typeof customFields !== "object" || !("notes" in customFields)) {
    return "";
  }

  const notes = customFields.notes;
  return typeof notes === "string" ? notes : "";
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { organization } = await requireOrganizationContext();
  const { id } = await params;
  const [customer] = await getDb()
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.organizationId, organization.id)))
    .limit(1);

  if (!customer) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Editar cliente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Alteracoes ficam restritas a organizacao ativa.
          </p>
        </CardHeader>
        <CardContent>
          <CustomerForm
            action={updateCustomerAction}
            values={{
              id: customer.id,
              name: customer.name,
              document: customer.document,
              email: customer.email,
              phone: customer.phone,
              website: customer.website,
              status: customer.status,
              notes: getNotes(customer.customFields),
            }}
          />
        </CardContent>
      </Card>
    </section>
  );
}
