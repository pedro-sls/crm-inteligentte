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
import { demandPriorityOptions } from "@/lib/demands/demand-status";

type MemberOption = {
  id: string;
  name: string;
  email: string;
};

type TeamOption = {
  id: string;
  name: string;
};

type DistributionRuleFormProps = {
  action: (formData: FormData) => Promise<void>;
  members: MemberOption[];
  teams: TeamOption[];
};

const customerStatusOptions = [
  { value: "all", label: "Qualquer cliente" },
  { value: "prospect", label: "Prospect" },
  { value: "active", label: "Ativo" },
  { value: "at_risk", label: "Em risco" },
  { value: "inactive", label: "Inativo" },
] as const;

export function DistributionRuleForm({ action, members, teams }: DistributionRuleFormProps) {
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome da regra</Label>
        <Input id="name" name="name" required placeholder="Urgentes para Operacoes" />
      </div>

      <label className="flex items-center gap-2 rounded-md border p-3 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked
          className="size-4 accent-primary"
        />
        Regra ativa
      </label>

      <div className="grid gap-3 rounded-md border p-3">
        <p className="text-sm font-medium">Condicoes</p>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="conditionDemandType">Tipo</Label>
            <Select name="conditionDemandType" defaultValue="all">
              <SelectTrigger id="conditionDemandType" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer tipo</SelectItem>
                <SelectItem value="client">Cliente</SelectItem>
                <SelectItem value="internal">Interna</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="conditionPriority">Prioridade</Label>
            <Select name="conditionPriority" defaultValue="all">
              <SelectTrigger id="conditionPriority" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {demandPriorityOptions.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.value === "all" ? "Qualquer prioridade" : priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="conditionTeamId">Equipe atual</Label>
            <Select name="conditionTeamId" defaultValue="all">
              <SelectTrigger id="conditionTeamId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer equipe</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="conditionCustomerStatus">Status do cliente</Label>
            <Select name="conditionCustomerStatus" defaultValue="all">
              <SelectTrigger id="conditionCustomerStatus" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {customerStatusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-md border p-3">
        <p className="text-sm font-medium">Acoes</p>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="actionTeamId">Definir equipe</Label>
            <Select name="actionTeamId" defaultValue="none">
              <SelectTrigger id="actionTeamId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Manter equipe</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="actionAssigneeId">Definir responsavel</Label>
            <Select name="actionAssigneeId" defaultValue="none">
              <SelectTrigger id="actionAssigneeId" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Manter responsavel</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name || member.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="actionPriority">Definir prioridade</Label>
            <Select name="actionPriority" defaultValue="keep">
              <SelectTrigger id="actionPriority" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keep">Manter prioridade</SelectItem>
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
      </div>

      <Button type="submit">
        <Save className="size-4" />
        Salvar regra
      </Button>
    </form>
  );
}
