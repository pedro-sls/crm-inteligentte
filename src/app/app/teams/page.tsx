import { desc, eq } from "drizzle-orm";
import { UsersRound } from "lucide-react";
import { TeamForm } from "@/components/teams/team-form";
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
import { createTeamAction } from "@/app/app/teams/actions";
import { getDb } from "@/db/client";
import { teams } from "@/db/schema";
import { requireOrganizationContext } from "@/lib/organization-context";

export default async function TeamsPage() {
  const { organization } = await requireOrganizationContext();
  const rows = await getDb()
    .select({
      id: teams.id,
      name: teams.name,
      description: teams.description,
      createdAt: teams.createdAt,
    })
    .from(teams)
    .where(eq(teams.organizationId, organization.id))
    .orderBy(desc(teams.createdAt));

  return (
    <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Nova equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamForm action={createTeamAction} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipes</CardTitle>
          <CardAction>
            <Badge variant="outline">{rows.length} cadastradas</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          {rows.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descricao</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {team.description || "Sem descricao."}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center">
              <UsersRound className="size-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Nenhuma equipe cadastrada</p>
                <p className="text-sm text-muted-foreground">
                  Crie equipes para organizar demandas internas por responsabilidade.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
