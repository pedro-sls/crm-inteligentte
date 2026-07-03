import Link from "next/link";
import { Edit, Plus, Search, UsersRound } from "lucide-react";
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
import { customers } from "@/db/schema";
import {
  customerStatusLabels,
  customerStatusOptions,
  getCustomerStatusFilter,
} from "@/lib/customers/customer-status";
import { requireOrganizationContext } from "@/lib/organization-context";

type CustomersPageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
};

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const { organization } = await requireOrganizationContext();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status = getCustomerStatusFilter(params.status);
  const conditions = [eq(customers.organizationId, organization.id)];

  if (query) {
    conditions.push(
      or(
        ilike(customers.name, `%${query}%`),
        ilike(customers.email, `%${query}%`),
        ilike(customers.document, `%${query}%`),
      )!,
    );
  }

  if (status !== "all") {
    conditions.push(eq(customers.status, status));
  }

  const [rows, allCustomers] = await Promise.all([
    getDb()
      .select()
      .from(customers)
      .where(and(...conditions))
      .orderBy(desc(customers.updatedAt))
      .limit(100),
    getDb()
      .select({ status: customers.status })
      .from(customers)
      .where(eq(customers.organizationId, organization.id)),
  ]);

  const activeCount = allCustomers.filter((customer) => customer.status === "active").length;
  const prospectCount = allCustomers.filter((customer) => customer.status === "prospect").length;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-normal">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            Cadastro comercial isolado por organizacao.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/customers/new">
            <Plus className="size-4" />
            Novo cliente
          </Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-2xl font-semibold">{allCustomers.length}</CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Ativos</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-2xl font-semibold">{activeCount}</CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle>Prospects</CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-2xl font-semibold">{prospectCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Base de clientes</CardTitle>
          <CardAction>
            <Badge variant="outline">{rows.length} exibidos</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-[1fr_180px_auto]" action="/app/customers">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2 size-4 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Buscar por nome, email ou documento"
                className="pl-8"
              />
            </div>
            <Select name="status" defaultValue={status}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {customerStatusOptions.map((option) => (
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-xs text-muted-foreground">{customer.document || "Sem documento"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.status === "active" ? "default" : "outline"}>
                        {customerStatusLabels[customer.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.email || "Sem email"}</TableCell>
                    <TableCell>{customer.phone || "Sem telefone"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/app/customers/${customer.id}/edit`}>
                          <Edit className="size-4" />
                          Editar
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center">
              <UsersRound className="size-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Nenhum cliente encontrado</p>
                <p className="text-sm text-muted-foreground">
                  Crie o primeiro registro ou ajuste os filtros.
                </p>
              </div>
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
