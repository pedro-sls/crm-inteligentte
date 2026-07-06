import Link from "next/link";
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  Route,
  Settings,
  Plug,
  UsersRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireOrganizationContext } from "@/lib/organization-context";

const navItems = [
  {
    href: "/app",
    label: "Painel",
    icon: LayoutDashboard,
  },
  {
    href: "/app/customers",
    label: "Clientes",
    icon: UsersRound,
  },
  {
    href: "/app/demands",
    label: "Demandas clientes",
    icon: ClipboardList,
  },
  {
    href: "/app/internal-demands",
    label: "Demandas internas",
    icon: ListChecks,
  },
  {
    href: "/app/teams",
    label: "Equipes",
    icon: UsersRound,
  },
  {
    href: "/app/distribution-rules",
    label: "Distribuicao",
    icon: Route,
  },
  {
    href: "/app/integrations",
    label: "Integracoes",
    icon: Plug,
  },
  {
    href: "/app/settings",
    label: "Config",
    icon: Settings,
  },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, organization } = await requireOrganizationContext();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-normal">CRM INTELIGENTTE</h1>
                <Badge variant="secondary">Sprint Final</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="size-4" />
                <span>{organization.name}</span>
                <span className="hidden sm:inline">/</span>
                <span>{session.user.email}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ThemeToggle />
              <SignOutButton />
            </div>
          </div>

          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Button key={item.href} variant="outline" size="sm" asChild>
                <Link href={item.href}>
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
