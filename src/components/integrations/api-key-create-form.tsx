"use client";

import { KeyRound, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ApiKeyCreateForm() {
  const [name, setName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCreatedKey(null);
    setIsSubmitting(true);

    const response = await fetch("/api/app/api-keys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? "Nao foi possivel criar a chave.");
      return;
    }

    setCreatedKey(data.key);
    setName("");
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {createdKey ? (
        <Alert>
          <AlertDescription>
            <span className="block font-medium">Chave criada. Ela aparece apenas agora.</span>
            <code className="mt-2 block break-all rounded bg-muted p-2 text-xs">{createdKey}</code>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="api-key-name">Nome</Label>
        <Input
          id="api-key-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="n8n producao"
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
        Criar chave
      </Button>
    </form>
  );
}
