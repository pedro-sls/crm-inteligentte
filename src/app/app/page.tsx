import Link from "next/link";
import { ClipboardList, KeyRound, ListChecks, Plug, Route, Settings, ShieldCheck, UserCheck, UsersRound } from "lucide-react";
import { and, count, eq, sql } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getDb } from "@/db/client";
import { apiKeys, customers, demands, distributionRules, webhookDeliveries, webhooks } from "@/db/schema";
import { requireOrganizationContext } from "@/lib/organization-context";

const modules = [
  {
    title: "Clientes",
    status: "Ativo",
    href: "/app/customers",
    icon: UsersRound,
  },
  {
    title: "Demandas clientes",
    status: "Ativo",
    href: "/app/demands",
    icon: ClipboardList,
  },
  {
    title: "Demandas internas",
    status: "Ativo",
    href: "/app/internal-demands",
    icon: ListChecks,
  },
  {
    title: "Equipes",
    status: "Ativo",
    href: "/app/teams",
    icon: UsersRound,
  },
  {
    title: "Distribuicao",
    status: "Ativo",
    href: "/app/distribution-rules",
    icon: Route,
  },
  {
    title: "Integracoes",
    status: "Ativo",
    href: "/app/integrations",
    icon: Plug,
  },
  {
    title: "Configuracoes",
    status: "Ativo",
    href: "/app/settings",
    icon: Settings,
  },
];

export default async function AppPage() {
  const { session, organization } = await requireOrganizationContext();
  const [
    [customerStats],
    [clientDemandStats],
    [internalDemandStats],
    [assignedToMeStats],
    [distributionRuleStats],
    [openDemandStats],
    [webhookStats],
    [apiKeyStats],
    [failedDeliveryStats],
  ] = await Promise.all([
    getDb()
      .select({ total: count() })
      .from(customers)
      .where(eq(customers.organizationId, organization.id)),
    getDb()
      .select({ total: count() })
      .from(demands)
      .where(and(eq(demands.organizationId, organization.id), eq(demands.type, "client"))),
    getDb()
      .select({ total: count() })
      .from(demands)
      .where(and(eq(demands.organizationId, organization.id), eq(demands.type, "internal"))),
    getDb()
      .select({ total: count() })
      .from(demands)
      .where(and(eq(demands.organizationId, organization.id), eq(demands.assigneeId, session.user.id))),
    getDb()
      .select({ total: count() })
      .from(distributionRules)
      .where(eq(distributionRules.organizationId, organization.id)),
    getDb()
      .select({ total: count() })
      .from(demands)
      .where(and(eq(demands.organizationId, organization.id), sql`${demands.status} != 'done'`)),
    getDb()
      .select({ total: count() })
      .from(webhooks)
      .where(and(eq(webhooks.organizationId, organization.id), eq(webhooks.isActive, true))),
    getDb()
      .select({ total: count() })
      .from(apiKeys)
      .where(and(eq(apiKeys.organizationId, organization.id), sql`${apiKeys.revokedAt} is null`)),
    getDb()
      .select({ total: count() })
      .from(webhookDeliveries)
      .where(and(eq(webhookDeliveries.organizationId, organization.id), eq(webhookDeliveries.status, "failed"))),
  ]);

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
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
            <CardTitle className="text-base">Sprint Final</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>Webhooks e API para n8n/Make</span>
              <Badge>Ativo</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <span>Campos personalizados e status configuraveis</span>
              <Badge>Ativo</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-3">
              <span>Dashboard operacional</span>
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
                <UserCheck className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">Para mim</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-mono text-3xl font-semibold">{assignedToMeStats?.total ?? 0}</p>
            <p className="text-sm text-muted-foreground">Demandas atribuidas ao seu usuario.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md border bg-muted">
                <ClipboardList className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">Abertas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-mono text-3xl font-semibold">{openDemandStats?.total ?? 0}</p>
            <p className="text-sm text-muted-foreground">Demandas ainda nao finalizadas.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md border bg-muted">
                <Route className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">Regras</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-mono text-3xl font-semibold">{distributionRuleStats?.total ?? 0}</p>
            <p className="text-sm text-muted-foreground">Regras de distribuicao cadastradas.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md border bg-muted">
                <Plug className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">Webhooks</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-mono text-3xl font-semibold">{webhookStats?.total ?? 0}</p>
            <p className="text-sm text-muted-foreground">Webhooks ativos nesta organizacao.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md border bg-muted">
                <KeyRound className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">API keys</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-mono text-3xl font-semibold">{apiKeyStats?.total ?? 0}</p>
            <p className="text-sm text-muted-foreground">Chaves ativas para integracoes.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md border bg-muted">
                <ShieldCheck className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">Falhas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-mono text-3xl font-semibold">{failedDeliveryStats?.total ?? 0}</p>
            <p className="text-sm text-muted-foreground">Entregas de webhook com falha.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md border bg-muted">
                <ClipboardList className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">Demandas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-mono text-3xl font-semibold">{clientDemandStats?.total ?? 0}</p>
            <p className="text-sm text-muted-foreground">Solicitacoes de clientes nesta organizacao.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-md border bg-muted">
                <ListChecks className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">Internas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-mono text-3xl font-semibold">{internalDemandStats?.total ?? 0}</p>
            <p className="text-sm text-muted-foreground">Demandas internas nesta organizacao.</p>
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
