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
import { demandPriorityOptions } from "@/lib/demands/demand-status";

type DemandCustomerOption = {
  id: string;
  name: string;
};

type DemandFormProps = {
  action: (formData: FormData) => Promise<void>;
  customers: DemandCustomerOption[];
};

export function DemandForm({ action, customers }: DemandFormProps) {
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="customerId">Cliente</Label>
        <Select name="customerId" required>
          <SelectTrigger id="customerId" className="w-full">
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <div className="grid gap-2">
          <Label htmlFor="title">Titulo</Label>
          <Input id="title" name="title" required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select name="priority" defaultValue="medium">
            <SelectTrigger id="priority" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {demandPriorityOptions
                .filter((priority) => priority.value !== "all")
                .map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="dueAt">Prazo</Label>
        <Input id="dueAt" name="dueAt" type="date" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descricao</Label>
        <Textarea id="description" name="description" />
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" asChild>
          <Link href="/app/demands">Cancelar</Link>
        </Button>
        <Button type="submit">
          <Save className="size-4" />
          Salvar
        </Button>
      </div>
    </form>
  );
}
