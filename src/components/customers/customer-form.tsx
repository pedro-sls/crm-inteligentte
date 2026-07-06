import Link from "next/link";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type CustomerFormValues = {
  id?: string;
  name?: string;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  status?: "prospect" | "active" | "at_risk" | "inactive";
  notes?: string;
  customFields?: Record<string, unknown>;
};

const statuses = [
  { value: "prospect", label: "Prospect" },
  { value: "active", label: "Ativo" },
  { value: "at_risk", label: "Em risco" },
  { value: "inactive", label: "Inativo" },
] as const;

type CustomerFormProps = {
  action: (formData: FormData) => Promise<void>;
  values?: CustomerFormValues;
  customFields?: Array<{
    key: string;
    label: string;
    fieldType: string;
    isRequired: boolean;
    options: unknown;
  }>;
};

function getFieldValue(values: CustomerFormValues | undefined, key: string) {
  const value = values?.customFields?.[key];
  return value === null || value === undefined ? "" : String(value);
}

function getFieldOptions(options: unknown) {
  return Array.isArray(options) ? options.filter((option) => typeof option === "string") : [];
}

export function CustomerForm({ action, values, customFields = [] }: CustomerFormProps) {
  return (
    <form action={action} className="grid gap-4">
      {values?.id ? <input type="hidden" name="id" value={values.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" name="name" defaultValue={values?.name ?? ""} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={values?.status ?? "prospect"}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="document">Documento</Label>
          <Input id="document" name="document" defaultValue={values?.document ?? ""} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={values?.email ?? ""} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" defaultValue={values?.phone ?? ""} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="website">Site</Label>
          <Input id="website" name="website" type="url" defaultValue={values?.website ?? ""} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea id="notes" name="notes" defaultValue={values?.notes ?? ""} />
      </div>

      {customFields.length > 0 ? (
        <div className="grid gap-4 rounded-md border p-4 md:grid-cols-2">
          {customFields.map((field) => {
            const name = `custom_${field.key}`;

            if (field.fieldType === "boolean") {
              return (
                <div key={field.key} className="flex items-center gap-2">
                  <input
                    id={name}
                    name={name}
                    type="checkbox"
                    defaultChecked={getFieldValue(values, field.key) === "true"}
                    className="size-4 rounded border"
                  />
                  <Label htmlFor={name}>{field.label}</Label>
                </div>
              );
            }

            if (field.fieldType === "select") {
              return (
                <div key={field.key} className="grid gap-2">
                  <Label htmlFor={name}>{field.label}</Label>
                  <Select name={name} defaultValue={getFieldValue(values, field.key)}>
                    <SelectTrigger id={name} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getFieldOptions(field.options).map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }

            return (
              <div key={field.key} className="grid gap-2">
                <Label htmlFor={name}>{field.label}</Label>
                <Input
                  id={name}
                  name={name}
                  type={field.fieldType === "number" ? "number" : field.fieldType === "date" ? "date" : "text"}
                  defaultValue={getFieldValue(values, field.key)}
                  required={field.isRequired}
                />
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" asChild>
          <Link href="/app/customers">Cancelar</Link>
        </Button>
        <Button type="submit">
          <Save className="size-4" />
          Salvar
        </Button>
      </div>
    </form>
  );
}
