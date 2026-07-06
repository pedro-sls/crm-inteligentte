"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { toSlug } from "@/lib/slug";

export function OrganizationSetupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const organizationName = String(formData.get("organizationName") ?? "");
    const slug = toSlug(organizationName);

    if (!slug) {
      setIsSubmitting(false);
      setError("Informe um nome valido para a organizacao.");
      return;
    }

    const result = await authClient.organization.create({
      name: organizationName,
      slug,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message ?? "Nao foi possivel criar a organizacao.");
      return;
    }

    router.replace("/app");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-lg border bg-card p-5 shadow-sm">
      <div className="mb-5 space-y-1">
        <p className="text-sm font-medium text-muted-foreground">CRM INTELIGENTTE</p>
        <h1 className="text-2xl font-semibold tracking-normal">Configurar organizacao</h1>
      </div>

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="organization-name">Organizacao</Label>
          <Input id="organization-name" name="organizationName" autoComplete="organization" required />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          Continuar
        </Button>
      </form>
    </div>
  );
}
