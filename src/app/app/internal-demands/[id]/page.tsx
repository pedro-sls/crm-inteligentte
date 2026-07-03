import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DemandStatusForm } from "@/components/demands/demand-status-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateInternalDemandStatusAction } from "@/app/app/internal-demands/actions";
import { getDb } from "@/db/client";
import { auditEvents, demands, teams } from "@/db/schema";
import {
  demandPriorityLabels,
  demandStatusLabels,
} from "@/lib/demands/demand-status";
import { requireOrganizationContext } from "@/lib/organization-context";

type InternalDemandDetailPageProps = {
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

function readInternalMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { area: null, project: null };
  }

  const metadata = value as Record<string, unknown>;
  return {
    area: typeof metadata.area === "string" && metadata.area ? metadata.area : null,
    project: typeof metadata.project === "string" && metadata.project ? metadata.project : null,
  };
}

export default async function InternalDemandDetailPage({ params }: InternalDemandDetailPageProps) {
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
      customFields: demands.customFields,
      teamName: teams.name,
      updatedAt: demands.updatedAt,
    })
    .from(demands)
    .leftJoin(teams, eq(teams.id, demands.teamId))
    .where(
      and(
        eq(demands.id, id),
        eq(demands.organizationId, organization.id),
        eq(demands.type, "internal"),
      ),
    )
    .limit(1);

  if (!demand) {
    notFound();
  }

  const metadata = readInternalMetadata(demand.customFields);
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
            <div className="space-y-2">
              <CardTitle>{demand.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge>{demandStatusLabels[demand.status]}</Badge>
                <Badge variant="outline">{demandPriorityLabels[demand.priority]}</Badge>
                <Badge variant="secondary">{formatDate(demand.dueAt)}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Equipe</p>
              <p className="text-sm">{demand.teamName || "Sem equipe definida"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Area</p>
              <p className="text-sm">{metadata.area || "Sem area definida"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Projeto</p>
              <p className="text-sm">{metadata.project || "Sem projeto definido"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Atualizada em</p>
              <p className="text-sm">
                {new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(demand.updatedAt)}
              </p>
            </div>
            <div className="md:col-span-2">
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
                <div
                  key={`${event.action}-${event.createdAt.toISOString()}`}
                  className="rounded-md border p-3"
                >
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
            action={updateInternalDemandStatusAction}
            id={demand.id}
            status={demand.status}
            priority={demand.priority}
          />
        </CardContent>
      </Card>
    </section>
  );
}
