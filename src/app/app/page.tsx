import Link from "next/link";
import { ClipboardList, Plug, ShieldCheck, UsersRound } from "lucide-react";
import { count, eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDb } from "@/db/client";
import { customers } from "@/db/schema";
import { requireOrganizationContext } from "@/lib/organization-context";

const modules = [
  {
    title: "Clientes",
    status: "Ativo",
    href: "/app/customers",
    icon: UsersRound,
  },
  {
    title: "Demandas",
    status: "Sprint 3",
    href: "/app",
    icon: ClipboardList,
  },
  {
    title: "Integracoes",
    status: "Sprint 4",
    href: "/app",
    icon: Plug,
  },
];

export default async function AppPage() {
  const { organization } = await requireOrganizationContext();
  const [customerStats] = await getDb()
    .select({ total: count() })
    .from(customers)
    .where(eq(customers.organizationId, organization.id));

  return (
    <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Operacao</CardTitle>
            <p className="text-sm text-muted-foreground">
              Clientes, demandas e integracoes dentro da organizacao ativa.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {modules.map((module) => (
              <div key={module.title} className="rounded-md border p-3">
                <module.icon className="mb-3 size-4 text-primary" />
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{module.title}</span>
                  <Badge variant="outline">{module.status}</Badge>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={module.href}>Abrir</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Checklist da Sprint 2</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>Clientes por organizacao</span>
              <Badge>Ativo</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <span>Cadastro e edicao</span>
              <Badge>Ativo</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <span>Filtros iniciais</span>
              <Badge>Ativo</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md border bg-muted">
                <UsersRound className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">Clientes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-mono text-3xl font-semibold">{customerStats?.total ?? 0}</p>
            <p className="text-sm text-muted-foreground">Registros vinculados a esta organizacao.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md border bg-muted">
                <ShieldCheck className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">Seguranca</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Consultas e mutacoes usam a organizacao resolvida no servidor.</p>
            <p>Nenhum formulario aceita `organization_id` vindo do cliente.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
