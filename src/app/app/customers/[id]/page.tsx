import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDb } from "@/db/client";
import { customers, demands } from "@/db/schema";
import { customerStatusLabels } from "@/lib/customers/customer-status";
import {
  demandPriorityLabels,
  demandStatusLabels,
} from "@/lib/demands/demand-status";
import { requireOrganizationContext } from "@/lib/organization-context";

type CustomerDetailPageProps = {
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

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
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

  const demandRows = await getDb()
    .select({
      id: demands.id,
      title: demands.title,
      status: demands.status,
      priority: demands.priority,
      updatedAt: demands.updatedAt,
    })
    .from(demands)
    .where(
      and(
        eq(demands.organizationId, organization.id),
        eq(demands.customerId, customer.id),
        eq(demands.type, "client"),
      ),
    )
    .orderBy(desc(demands.updatedAt))
    .limit(20);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-normal">{customer.name}</h2>
          <div className="flex flex-wrap gap-2">
            <Badge>{customerStatusLabels[customer.status]}</Badge>
            <Badge variant="outline">{customer.document || "Sem documento"}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href={`/app/customers/${customer.id}/edit`}>Editar cliente</Link>
          </Button>
          <Button asChild>
            <Link href="/app/demands/new">Nova demanda</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Email</p>
              <p>{customer.email || "Sem email"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Telefone</p>
              <p>{customer.phone || "Sem telefone"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Site</p>
              <p>{customer.website || "Sem site"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Notas</p>
              <p className="leading-6 text-muted-foreground">{getNotes(customer.customFields) || "Sem notas"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Demandas vinculadas</CardTitle>
          </CardHeader>
          <CardContent>
            {demandRows.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titulo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {demandRows.map((demand) => (
                    <TableRow key={demand.id}>
                      <TableCell className="font-medium">{demand.title}</TableCell>
                      <TableCell>{demandStatusLabels[demand.status]}</TableCell>
                      <TableCell>{demandPriorityLabels[demand.priority]}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/app/demands/${demand.id}`}>Abrir</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center">
                <p className="text-sm font-medium">Nenhuma demanda vinculada.</p>
                <Button asChild>
                  <Link href="/app/demands/new">Nova demanda</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
