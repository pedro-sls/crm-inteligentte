import { asc, desc, eq } from "drizzle-orm";
import { Route } from "lucide-react";
import { DistributionRuleForm } from "@/components/distribution/distribution-rule-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createDistributionRuleAction } from "@/app/app/distribution-rules/actions";
import { getDb } from "@/db/client";
import {
  distributionRules,
  organizationMembers,
  teams,
  users,
} from "@/db/schema";
import { demandPriorityLabels } from "@/lib/demands/demand-status";
import { requireOrganizationContext } from "@/lib/organization-context";

const demandTypeLabels = {
  client: "Cliente",
  internal: "Interna",
} as const;

const customerStatusLabels = {
  prospect: "Prospect",
  active: "Ativo",
  at_risk: "Em risco",
  inactive: "Inativo",
} as const;

export default async function DistributionRulesPage() {
  const { organization } = await requireOrganizationContext();
  const [members, teamOptions, rules] = await Promise.all([
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
        id: distributionRules.id,
        name: distributionRules.name,
        isActive: distributionRules.isActive,
        conditionDemandType: distributionRules.conditionDemandType,
        conditionPriority: distributionRules.conditionPriority,
        conditionCustomerStatus: distributionRules.conditionCustomerStatus,
        actionPriority: distributionRules.actionPriority,
        createdAt: distributionRules.createdAt,
      })
      .from(distributionRules)
      .where(eq(distributionRules.organizationId, organization.id))
      .orderBy(desc(distributionRules.createdAt)),
  ]);

  return (
    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Nova regra</CardTitle>
        </CardHeader>
        <CardContent>
          <DistributionRuleForm
            action={createDistributionRuleAction}
            members={members}
            teams={teamOptions}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regras de distribuicao</CardTitle>
          <CardAction>
            <Badge variant="outline">{rules.length} cadastradas</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          {rules.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Regra</TableHead>
                  <TableHead>Condicao</TableHead>
                  <TableHead>Acao</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {[
                        rule.conditionDemandType
                          ? demandTypeLabels[rule.conditionDemandType]
                          : "Qualquer tipo",
                        rule.conditionPriority
                          ? demandPriorityLabels[rule.conditionPriority]
                          : "Qualquer prioridade",
                        rule.conditionCustomerStatus
                          ? customerStatusLabels[rule.conditionCustomerStatus]
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" / ")}
                    </TableCell>
                    <TableCell>
                      {rule.actionPriority
                        ? `Prioridade ${demandPriorityLabels[rule.actionPriority]}`
                        : "Atribuicao configurada"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? "default" : "outline"}>
                        {rule.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center">
              <Route className="size-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Nenhuma regra cadastrada</p>
                <p className="text-sm text-muted-foreground">
                  Crie regras para automatizar equipe, responsavel ou prioridade.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
