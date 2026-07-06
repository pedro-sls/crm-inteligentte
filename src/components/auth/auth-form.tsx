"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { toSlug } from "@/lib/slug";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextUrl = useMemo(() => {
    const next = searchParams.get("next");
    return next?.startsWith("/") ? next : "/app";
  }, [searchParams]);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const result = await authClient.signIn.email({
      email,
      password,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message ?? "Nao foi possivel entrar.");
      return;
    }

    router.push(nextUrl);
    router.refresh();
  }

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const organizationName = String(formData.get("organizationName") ?? "");
    const slug = toSlug(organizationName || name);

    const signUpResult = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (signUpResult.error) {
      setIsSubmitting(false);
      setError(signUpResult.error.message ?? "Nao foi possivel criar a conta.");
      return;
    }

    const organizationResult = await authClient.organization.create({
      name: organizationName,
      slug,
    });

    setIsSubmitting(false);

    if (organizationResult.error) {
      setError("Conta criada. Finalize a organizacao para acessar o CRM.");
      router.replace("/setup");
      router.refresh();
      return;
    }

    router.push(nextUrl);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-sm">
      <div className="mb-5 space-y-1">
        <p className="text-sm font-medium text-muted-foreground">CRM INTELIGENTTE</p>
        <h1 className="text-2xl font-semibold tracking-normal">Acesso</h1>
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Entrar</TabsTrigger>
          <TabsTrigger value="signup">Criar conta</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="mt-5">
          <form className="grid gap-4" onSubmit={handleSignIn}>
            <div className="grid gap-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input id="signin-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="signin-password">Senha</Label>
              <Input
                id="signin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                minLength={8}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Entrar
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="mt-5">
          <form className="grid gap-4" onSubmit={handleSignUp}>
            <div className="grid gap-2">
              <Label htmlFor="signup-name">Nome</Label>
              <Input id="signup-name" name="name" autoComplete="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input id="signup-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="signup-password">Senha</Label>
              <Input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="organization-name">Organizacao</Label>
              <Input id="organization-name" name="organizationName" required />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Criar conta
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
