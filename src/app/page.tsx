import {
  ArrowRight,
  Database,
  GitBranch,
  KeyRound,
  Plug,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const foundations = [
  {
    title: "Base web",
    description: "Next.js, React, TypeScript, Tailwind e shadcn/ui preparados.",
    status: "Em progresso",
    icon: GitBranch,
  },
  {
    title: "Banco Neon",
    description: "Drizzle ORM com schema inicial multi-organizacao.",
    status: "Pendente URL",
    icon: Database,
  },
  {
    title: "Seguranca",
    description: "Sem segredos versionados, envs ignorados e auditoria inicial.",
    status: "Ativo",
    icon: ShieldCheck,
  },
  {
    title: "Integracoes",
    description: "Modelo inicial para webhooks, n8n e Make.",
    status: "Modelado",
    icon: Plug,
  },
];

const nextSteps = [
  "Configurar DATABASE_URL do Neon no .env local",
  "Gerar e revisar a primeira migration do Drizzle",
  "Preparar Better Auth na Sprint 1",
  "Criar primeiro fluxo de clientes apos autenticacao",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Badge variant="secondary" className="w-fit">
                Sprint 0
              </Badge>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-normal md:text-4xl">
                  CRM INTELIGENTTE
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  Fundacao tecnica para gestao de clientes, demandas internas,
                  demandas de clientes, distribuicao de trabalho e automacoes.
                </p>
              </div>
            </div>
            <Button className="w-fit" asChild>
              <a href="/docs/planejamento-crm-inteligentte.pdf">
                Planejamento
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {foundations.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex size-10 items-center justify-center rounded-md border bg-muted">
                  <item.icon className="size-5 text-primary" />
                </div>
                <Badge variant="outline">{item.status}</Badge>
              </div>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 pb-8 sm:px-6 lg:grid-cols-[1.4fr_0.8fr] lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Arquitetura inicial</CardTitle>
            <CardDescription>
              Primeiros blocos para evoluirmos sem expor dados sensiveis.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <KeyRound className="size-5 text-primary" />
              <h2 className="text-sm font-medium">Segredos fora do Git</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                `.env` e arquivos sensiveis ficam ignorados. O repositorio
                recebe somente placeholders.
              </p>
            </div>
            <div className="space-y-2">
              <Database className="size-5 text-primary" />
              <h2 className="text-sm font-medium">PostgreSQL no Neon</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Schema inicial com organizacoes, usuarios, clientes, demandas,
                webhooks e auditoria.
              </p>
            </div>
            <div className="space-y-2">
              <Plug className="size-5 text-primary" />
              <h2 className="text-sm font-medium">n8n e Make</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Eventos e webhooks entram como parte nativa da arquitetura.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Proximos passos</CardTitle>
            <CardAction>
              <Badge>Neon</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextSteps.map((step, index) => (
              <div key={step}>
                <div className="flex gap-3 text-sm">
                  <span className="font-mono text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </div>
                {index < nextSteps.length - 1 ? <Separator className="mt-3" /> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
