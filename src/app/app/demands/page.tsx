import Link from "next/link";
import { Eye, Plus, Search, ClipboardList } from "lucide-react";
import { and, desc, eq, ilike, or } from "drizzle-orm";
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
import { customers, demands } from "@/db/schema";
import {
  demandPriorityLabels,
  demandPriorityOptions,
  demandStatusLabels,
  demandStatusOptions,
  getDemandPriorityFilter,
  getDemandStatusFilter,
} from "@/lib/demands/demand-status";
import { requireOrganizationContext } from "@/lib/organization-context";

type DemandsPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    priority?: string;
  }>;
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Sem prazo";
  }

  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date);
}

export default async function DemandsPage({ searchParams }: DemandsPageProps) {
  const { organization } = await requireOrganizationContext();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status = getDemandStatusFilter(params.status);
  const priority = getDemandPriorityFilter(params.priority);
  const conditions = [eq(demands.organizationId, organization.id), eq(demands.type, "client")];

  if (query) {
    conditions.push(
      or(ilike(demands.title, `%${query}%`), ilike(customers.name, `%${query}%`))!,
    );
  }

  if (status !== "all") {
    conditions.push(eq(demands.status, status));
  }

  if (priority !== "all") {
    conditions.push(eq(demands.priority, priority));
  }

  const [rows, allDemands] = await Promise.all([
    getDb()
      .select({
        id: demands.id,
        title: demands.title,
        status: demands.status,
        priority: demands.priority,
        dueAt: demands.dueAt,
        updatedAt: demands.updatedAt,
        customerName: customers.name,
      })
      .from(demands)
      .innerJoin(customers, eq(customers.id, demands.customerId))
      .where(and(...conditions))
      .orderBy(desc(demands.updatedAt))
      .limit(100),
    getDb()
      .select({ status: demands.status })
      .from(demands)
      .where(and(eq(demands.organizationId, organization.id), eq(demands.type, "client"))),
  ]);

  const openCount = allDemands.filter((demand) => demand.status === "open").length;
  const progressCount = allDemands.filter((demand) => demand.status === "in_progress").length;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-normal">Demandas de clientes</h2>
          <p className="text-sm text-muted-foreground">
            Solicitacoes vinculadas a clientes da organizacao ativa.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/demands/new">
            <Plus className="size-4" />
            Nova demanda
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-2xl font-semibold">{allDemands.length}</CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Abertas</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-2xl font-semibold">{openCount}</CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Em andamento</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-2xl font-semibold">{progressCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lista de demandas</CardTitle>
          <CardAction>
            <Badge variant="outline">{rows.length} exibidas</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]" action="/app/demands">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Buscar por titulo ou cliente"
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
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Prazo</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((demand) => (
                  <TableRow key={demand.id}>
                    <TableCell className="font-medium">{demand.title}</TableCell>
                    <TableCell>{demand.customerName}</TableCell>
                    <TableCell>
                      <Badge variant={demand.status === "done" ? "default" : "outline"}>
                        {demandStatusLabels[demand.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{demandPriorityLabels[demand.priority]}</TableCell>
                    <TableCell>{formatDate(demand.dueAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/app/demands/${demand.id}`}>
                          <Eye className="size-4" />
                          Abrir
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center">
              <ClipboardList className="size-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Nenhuma demanda encontrada</p>
                <p className="text-sm text-muted-foreground">
                  Crie uma demanda para cliente ou ajuste os filtros.
                </p>
              </div>
              <Button asChild>
                <Link href="/app/demands/new">Nova demanda</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
