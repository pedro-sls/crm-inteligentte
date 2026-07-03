import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemandStatusForm } from "@/components/demands/demand-status-form";
import { updateClientDemandStatusAction } from "@/app/app/demands/actions";
import { getDb } from "@/db/client";
import { auditEvents, customers, demands } from "@/db/schema";
import {
  demandPriorityLabels,
  demandStatusLabels,
} from "@/lib/demands/demand-status";
import { requireOrganizationContext } from "@/lib/organization-context";

type DemandDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Sem prazo";
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

export default async function DemandDetailPage({ params }: DemandDetailPageProps) {
  const { organization } = await requireOrganizationContext();
  const { id } = await params;
  const [demand] = await getDb()
    .select({
      id: demands.id,
      title: demands.title,
      description: demands.description,
      status: demands.status,
      priority: demands.priority,
      dueAt: demands.dueAt,
      customerId: customers.id,
      customerName: customers.name,
      updatedAt: demands.updatedAt,
    })
    .from(demands)
    .innerJoin(customers, eq(customers.id, demands.customerId))
    .where(
      and(
        eq(demands.id, id),
        eq(demands.organizationId, organization.id),
        eq(demands.type, "client"),
      ),
    )
    .limit(1);

  if (!demand) {
    notFound();
  }

  const events = await getDb()
    .select({
      action: auditEvents.action,
      createdAt: auditEvents.createdAt,
    })
    .from(auditEvents)
    .where(and(eq(auditEvents.organizationId, organization.id), eq(auditEvents.entityId, demand.id)))
    .orderBy(desc(auditEvents.createdAt))
    .limit(10);

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <CardTitle>{demand.title}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge>{demandStatusLabels[demand.status]}</Badge>
                  <Badge variant="outline">{demandPriorityLabels[demand.priority]}</Badge>
                  <Badge variant="secondary">{formatDate(demand.dueAt)}</Badge>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/app/customers/${demand.customerId}`}>Ver cliente</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Cliente</p>
              <p className="text-sm">{demand.customerName}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Descricao</p>
              <p className="text-sm leading-6 text-muted-foreground">
                {demand.description || "Sem descricao."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={`${event.action}-${event.createdAt.toISOString()}`} className="rounded-md border p-3">
                  <p className="text-sm font-medium">{event.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(event.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum evento registrado.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status e prioridade</CardTitle>
        </CardHeader>
        <CardContent>
          <DemandStatusForm
            action={updateClientDemandStatusAction}
            id={demand.id}
            status={demand.status}
            priority={demand.priority}
          />
        </CardContent>
      </Card>
    </section>
  );
}
