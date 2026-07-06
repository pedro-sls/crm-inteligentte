import Link from "next/link";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { ClipboardList, Eye, Plus, Search } from "lucide-react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDb } from "@/db/client";
import { demands, teams, users } from "@/db/schema";
import {
  demandPriorityLabels,
  demandPriorityOptions,
  demandStatusLabels,
  demandStatusOptions,
  demandStatusValues,
  getDemandPriorityFilter,
  getDemandStatusFilter,
} from "@/lib/demands/demand-status";
import { requireOrganizationContext } from "@/lib/organization-context";

type InternalDemandsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    priority?: string;
    team?: string;
  }>;
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Sem prazo";
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

function getTeamFilter(value: string | undefined) {
  const parsed = z.string().uuid().safeParse(value);
  return parsed.success ? parsed.data : "all";
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

export default async function InternalDemandsPage({ searchParams }: InternalDemandsPageProps) {
  const { organization } = await requireOrganizationContext();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status = getDemandStatusFilter(params.status);
  const priority = getDemandPriorityFilter(params.priority);
  const team = getTeamFilter(params.team);
  const conditions = [eq(demands.organizationId, organization.id), eq(demands.type, "internal")];

  if (query) {
    conditions.push(or(ilike(demands.title, `%${query}%`), ilike(teams.name, `%${query}%`))!);
  }

  if (status !== "all") {
    conditions.push(eq(demands.status, status));
  }

  if (priority !== "all") {
    conditions.push(eq(demands.priority, priority));
  }

  if (team !== "all") {
    conditions.push(eq(demands.teamId, team));
  }

  const [rows, allDemands, teamOptions] = await Promise.all([
    getDb()
      .select({
        id: demands.id,
        title: demands.title,
        status: demands.status,
        priority: demands.priority,
        dueAt: demands.dueAt,
        customFields: demands.customFields,
        teamName: teams.name,
        assigneeName: users.name,
        assigneeEmail: users.email,
      })
      .from(demands)
      .leftJoin(teams, eq(teams.id, demands.teamId))
      .leftJoin(users, eq(users.id, demands.assigneeId))
      .where(and(...conditions))
      .orderBy(desc(demands.updatedAt))
      .limit(100),
    getDb()
      .select({
        id: demands.id,
        title: demands.title,
        status: demands.status,
        teamId: demands.teamId,
      })
      .from(demands)
      .where(and(eq(demands.organizationId, organization.id), eq(demands.type, "internal"))),
    getDb()
      .select({
        id: teams.id,
        name: teams.name,
      })
      .from(teams)
      .where(eq(teams.organizationId, organization.id))
      .orderBy(asc(teams.name)),
  ]);

  const boardColumns = demandStatusValues.map((columnStatus) => ({
    status: columnStatus,
    demands: allDemands.filter((demand) => demand.status === columnStatus),
  }));

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-normal">Demandas internas</h2>
          <p className="text-sm text-muted-foreground">
            Trabalho da equipe separado das solicitacoes de clientes.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/internal-demands/new">
            <Plus className="size-4" />
            Nova demanda interna
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {boardColumns.map((column) => (
          <Card key={column.status} size="sm">
            <CardHeader>
              <CardTitle>{demandStatusLabels[column.status]}</CardTitle>
              <CardAction>
                <Badge variant="outline">{column.demands.length}</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-2">
              {column.demands.slice(0, 3).map((demand) => (
                <div key={demand.id} className="rounded-md border bg-muted/30 p-2">
                  <p className="line-clamp-2 text-sm font-medium">{demand.title}</p>
                </div>
              ))}
              {column.demands.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sem demandas.</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de demandas internas</CardTitle>
          <CardAction>
            <Badge variant="outline">{rows.length} exibidas</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="grid gap-3 xl:grid-cols-[1fr_180px_180px_220px_auto]"
            action="/app/internal-demands"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Buscar por titulo ou equipe"
                className="pl-8"
              />
            </div>
            <Select name="status" defaultValue={status}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {demandStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="priority" defaultValue={priority}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {demandPriorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="team" defaultValue={team}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as equipes</SelectItem>
                {teamOptions.map((teamOption) => (
                  <SelectItem key={teamOption.id} value={teamOption.id}>
                    {teamOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" variant="outline">
              <Search className="size-4" />
              Filtrar
            </Button>
          </form>

          {rows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titulo</TableHead>
                  <TableHead>Equipe</TableHead>
                  <TableHead>Responsavel</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((demand) => {
                  const metadata = readInternalMetadata(demand.customFields);

                  return (
                    <TableRow key={demand.id}>
                      <TableCell className="font-medium">{demand.title}</TableCell>
                      <TableCell>{demand.teamName || "Sem equipe"}</TableCell>
                      <TableCell>
                        {demand.assigneeName || demand.assigneeEmail || "Sem responsavel"}
                      </TableCell>
                      <TableCell>{metadata.area || "Sem area"}</TableCell>
                      <TableCell>
                        <Badge variant={demand.status === "done" ? "default" : "outline"}>
                          {demandStatusLabels[demand.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{demandPriorityLabels[demand.priority]}</TableCell>
                      <TableCell>{formatDate(demand.dueAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/app/internal-demands/${demand.id}`}>
                            <Eye className="size-4" />
                            Abrir
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center">
              <ClipboardList className="size-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Nenhuma demanda interna encontrada</p>
                <p className="text-sm text-muted-foreground">
                  Crie uma demanda interna ou ajuste os filtros.
                </p>
              </div>
              <Button asChild>
                <Link href="/app/internal-demands/new">Nova demanda interna</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
