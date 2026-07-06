import { and, asc, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { DemandAssignmentForm } from "@/components/demands/demand-assignment-form";
import { DemandStatusForm } from "@/components/demands/demand-status-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateDemandAssignmentAction } from "@/app/app/demands/assignment-actions";
import { updateInternalDemandStatusAction } from "@/app/app/internal-demands/actions";
import { getDb } from "@/db/client";
import {
  auditEvents,
  demandWorkflowStatuses,
  demands,
  organizationMembers,
  teams,
  users,
} from "@/db/schema";
import {
  demandPriorityLabels,
  demandStatusOptions,
  getDemandStatusLabel,
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
  const { session, organization } = await requireOrganizationContext();
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
      teamId: demands.teamId,
      teamName: teams.name,
      assigneeId: demands.assigneeId,
      assigneeName: users.name,
      assigneeEmail: users.email,
      updatedAt: demands.updatedAt,
    })
    .from(demands)
    .leftJoin(teams, eq(teams.id, demands.teamId))
    .leftJoin(users, eq(users.id, demands.assigneeId))
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
  const [events, members, teamOptions, statusOptions] = await Promise.all([
    getDb()
      .select({
        action: auditEvents.action,
        createdAt: auditEvents.createdAt,
      })
      .from(auditEvents)
      .where(
        and(eq(auditEvents.organizationId, organization.id), eq(auditEvents.entityId, demand.id)),
      )
      .orderBy(desc(auditEvents.createdAt))
      .limit(10),
    getDb()
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(organizationMembers)
      .innerJoin(users, eq(users.id, organizationMembers.userId))
      .where(eq(organizationMembers.organizationId, organization.id))
      .orderBy(asc(users.name)),
    getDb()
      .select({
        id: teams.id,
        name: teams.name,
      })
      .from(teams)
      .where(eq(teams.organizationId, organization.id))
      .orderBy(asc(teams.name)),
    getDb()
      .select({
        value: demandWorkflowStatuses.key,
        label: demandWorkflowStatuses.label,
      })
      .from(demandWorkflowStatuses)
      .where(
        and(
          eq(demandWorkflowStatuses.organizationId, organization.id),
          eq(demandWorkflowStatuses.demandType, "internal"),
          eq(demandWorkflowStatuses.isActive, true),
        ),
      )
      .orderBy(asc(demandWorkflowStatuses.position), asc(demandWorkflowStatuses.label)),
  ]);

  const demandStatusSelectOptions =
    statusOptions.length > 0 ? statusOptions : demandStatusOptions.filter((option) => option.value !== "all");

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <CardTitle>{demand.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge>{getDemandStatusLabel(demand.status)}</Badge>
                <Badge variant="outline">{demandPriorityLabels[demand.priority]}</Badge>
                <Badge variant="secondary">{formatDate(demand.dueAt)}</Badge>
                {demand.assigneeId === session.user.id ? <Badge>Atribuida a voce</Badge> : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Equipe</p>
              <p className="text-sm">{demand.teamName || "Sem equipe definida"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Responsavel</p>
              <p className="text-sm">
                {demand.assigneeName || demand.assigneeEmail || "Sem responsavel"}
              </p>
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
        <div className="space-y-6">
          <div>
            <CardHeader>
              <CardTitle className="text-base">Status e prioridade</CardTitle>
            </CardHeader>
            <CardContent>
              <DemandStatusForm
                action={updateInternalDemandStatusAction}
                id={demand.id}
                status={demand.status}
                priority={demand.priority}
                statusOptions={demandStatusSelectOptions}
              />
            </CardContent>
          </div>

          <div>
            <CardHeader>
              <CardTitle className="text-base">Atribuicao</CardTitle>
            </CardHeader>
            <CardContent>
              <DemandAssignmentForm
                action={updateDemandAssignmentAction}
                demandId={demand.id}
                demandType="internal"
                currentAssigneeId={demand.assigneeId}
                currentTeamId={demand.teamId}
                members={members}
                teams={teamOptions}
              />
            </CardContent>
          </div>
        </div>
      </Card>
    </section>
  );
}
