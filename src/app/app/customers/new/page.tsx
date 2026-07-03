import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerForm } from "@/components/customers/customer-form";
import { createCustomerAction } from "@/app/app/customers/actions";

export default function NewCustomerPage() {
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
          <CustomerForm action={createCustomerAction} />
        </CardContent>
      </Card>
    </section>
  );
}
