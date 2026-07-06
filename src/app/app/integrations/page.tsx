import { desc, eq } from "drizzle-orm";
import { Plug, Power, PowerOff } from "lucide-react";
import { createWebhookAction, toggleWebhookAction } from "@/app/app/integrations/actions";
import { ApiKeyCreateForm } from "@/components/integrations/api-key-create-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDb } from "@/db/client";
import { apiKeys, webhookDeliveries, webhooks } from "@/db/schema";
import { requireOrganizationContext } from "@/lib/organization-context";
import { webhookEventLabels, webhookEventValues } from "@/lib/webhook-events";

export default async function IntegrationsPage() {
  const { organization } = await requireOrganizationContext();
  const [webhookRows, deliveryRows, apiKeyRows] = await Promise.all([
    getDb().select().from(webhooks).where(eq(webhooks.organizationId, organization.id)).orderBy(desc(webhooks.createdAt)),
    getDb()
      .select()
      .from(webhookDeliveries)
      .where(eq(webhookDeliveries.organizationId, organization.id))
      .orderBy(desc(webhookDeliveries.createdAt))
      .limit(20),
    getDb().select().from(apiKeys).where(eq(apiKeys.organizationId, organization.id)).orderBy(desc(apiKeys.createdAt)),
  ]);

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-normal">Integracoes</h2>
        <p className="text-sm text-muted-foreground">Webhooks de saida e API para n8n/Make.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Novo webhook</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createWebhookAction} className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="webhook-name">Nome</Label>
                <Input id="webhook-name" name="name" placeholder="n8n demanda criada" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="webhook-url">URL</Label>
                <Input id="webhook-url" name="url" type="url" placeholder="https://..." required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="webhook-event">Evento</Label>
                <Select name="event" defaultValue="demand.created">
                  <SelectTrigger id="webhook-event" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {webhookEventValues.map((event) => (
                      <SelectItem key={event} value={event}>
                        {webhookEventLabels[event]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">
                <Plug className="size-4" />
                Cadastrar webhook
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chaves de API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ApiKeyCreateForm />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Prefixo</TableHead>
                  <TableHead>Ultimo uso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeyRows.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell>{apiKey.name}</TableCell>
                    <TableCell className="font-mono text-xs">{apiKey.prefix}</TableCell>
                    <TableCell>
                      {apiKey.lastUsedAt
                        ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(apiKey.lastUsedAt)
                        : "Nunca usada"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Webhooks cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhookRows.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>{webhook.name}</TableCell>
                  <TableCell>{webhookEventLabels[webhook.event]}</TableCell>
                  <TableCell>
                    <Badge variant={webhook.isActive ? "default" : "outline"}>
                      {webhook.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <form action={toggleWebhookAction}>
                      <input type="hidden" name="id" value={webhook.id} />
                      <input type="hidden" name="isActive" value={String(webhook.isActive)} />
                      <Button type="submit" variant="outline" size="sm">
                        {webhook.isActive ? <PowerOff className="size-4" /> : <Power className="size-4" />}
                        {webhook.isActive ? "Desativar" : "Ativar"}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Logs de entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>HTTP</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryRows.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell>{webhookEventLabels[delivery.event]}</TableCell>
                  <TableCell>{delivery.status}</TableCell>
                  <TableCell>{delivery.statusCode ?? "-"}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(delivery.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
