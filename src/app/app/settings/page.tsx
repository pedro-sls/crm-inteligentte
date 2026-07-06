import { asc, eq } from "drizzle-orm";
import { Settings } from "lucide-react";
import {
  createCustomFieldAction,
  createDemandWorkflowStatusAction,
} from "@/app/app/settings/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { getDb } from "@/db/client";
import { customFieldDefinitions, demandWorkflowStatuses } from "@/db/schema";
import { customFieldTypeValues } from "@/lib/customization";
import { requireOrganizationContext } from "@/lib/organization-context";

const fieldTypeLabels = {
  text: "Texto",
  number: "Numero",
  date: "Data",
  boolean: "Sim/Nao",
  select: "Selecao",
} as const;

export default async function SettingsPage() {
  const { organization } = await requireOrganizationContext();
  const [customFields, workflowStatuses] = await Promise.all([
    getDb()
      .select()
      .from(customFieldDefinitions)
      .where(eq(customFieldDefinitions.organizationId, organization.id))
      .orderBy(asc(customFieldDefinitions.entityType), asc(customFieldDefinitions.position)),
    getDb()
      .select()
      .from(demandWorkflowStatuses)
      .where(eq(demandWorkflowStatuses.organizationId, organization.id))
      .orderBy(asc(demandWorkflowStatuses.demandType), asc(demandWorkflowStatuses.position)),
  ]);

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-normal">Configuracoes</h2>
        <p className="text-sm text-muted-foreground">Personalizacao de campos e status da organizacao.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campo personalizado de cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCustomFieldAction} className="grid gap-3">
              <input type="hidden" name="entityType" value="customer" />
              <div className="grid gap-2">
                <Label htmlFor="field-label">Rotulo</Label>
                <Input id="field-label" name="label" placeholder="Segmento" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="field-type">Tipo</Label>
                <Select name="fieldType" defaultValue="text">
                  <SelectTrigger id="field-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {customFieldTypeValues.map((type) => (
                      <SelectItem key={type} value={type}>
                        {fieldTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="field-options">Opcoes para selecao</Label>
                <Textarea id="field-options" name="options" placeholder={"Ouro\nPrata\nBronze"} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isRequired" className="size-4" />
                Obrigatorio
              </label>
              <Button type="submit">
                <Settings className="size-4" />
                Criar campo
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status personalizado de demanda</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createDemandWorkflowStatusAction} className="grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="demand-type">Tipo de demanda</Label>
                <Select name="demandType" defaultValue="client">
                  <SelectTrigger id="demand-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="internal">Interna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status-label">Status</Label>
                <Input id="status-label" name="label" placeholder="Em revisao" required />
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isInitial" className="size-4" />
                  Inicial
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="isFinal" className="size-4" />
                  Final
                </label>
              </div>
              <Button type="submit">
                <Settings className="size-4" />
                Criar status
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campos personalizados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Obrigatorio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customFields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell>{field.label}</TableCell>
                  <TableCell>{fieldTypeLabels[field.fieldType as keyof typeof fieldTypeLabels] ?? field.fieldType}</TableCell>
                  <TableCell>{field.isRequired ? "Sim" : "Nao"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status de demandas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {workflowStatuses.map((status) => (
            <Badge key={status.id} variant={status.isFinal ? "default" : "outline"}>
              {status.demandType === "client" ? "Cliente" : "Interna"} / {status.label}
              {status.isInitial ? " / inicial" : ""}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
