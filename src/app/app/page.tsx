import {
  Building2,
  ClipboardList,
  Plug,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireSession } from "@/lib/session";

const modules = [
  {
    title: "Clientes",
    status: "Sprint 2",
    icon: UsersRound,
  },
  {
    title: "Demandas",
    status: "Sprint 3",
    icon: ClipboardList,
  },
  {
    title: "Integracoes",
    status: "Sprint 4",
    icon: Plug,
  },
];

export default async function AppPage() {
  const session = await requireSession();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-normal">CRM INTELIGENTTE</h1>
              <Badge variant="secondary">Sprint 1</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </header>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md border bg-muted">
                  <Building2 className="size-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Operacao</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Autenticacao, sessao e organizacoes conectadas ao Neon.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {modules.map((module) => (
                <div key={module.title} className="rounded-md border p-3">
                  <module.icon className="mb-3 size-4 text-primary" />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{module.title}</span>
                    <Badge variant="outline">{module.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Checklist da Sprint 1</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span>Login e cadastro</span>
                <Badge>Ativo</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <span>Organizacao inicial</span>
                <Badge>Ativo</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-3">
                <span>Rotas protegidas</span>
                <Badge>Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

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
            <p>Segredos seguem fora do Git e carregados apenas por variaveis de ambiente.</p>
            <p>Sessoes usam cookies do Better Auth e validacao server-side nas rotas internas.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
