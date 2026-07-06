import { UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MemberOption = {
  id: string;
  name: string;
  email: string;
};

type TeamOption = {
  id: string;
  name: string;
};

type DemandAssignmentFormProps = {
  action: (formData: FormData) => Promise<void>;
  demandId: string;
  demandType: "client" | "internal";
  currentAssigneeId: string | null;
  currentTeamId: string | null;
  members: MemberOption[];
  teams: TeamOption[];
};

export function DemandAssignmentForm({
  action,
  demandId,
  demandType,
  currentAssigneeId,
  currentTeamId,
  members,
  teams,
}: DemandAssignmentFormProps) {
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="id" value={demandId} />
      <input type="hidden" name="demandType" value={demandType} />

      <div className="grid gap-2">
        <Label htmlFor="assigneeId">Responsavel</Label>
        <Select name="assigneeId" defaultValue={currentAssigneeId ?? "none"}>
          <SelectTrigger id="assigneeId" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem responsavel</SelectItem>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.name || member.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="teamId">Equipe</Label>
        <Select name="teamId" defaultValue={currentTeamId ?? "none"}>
          <SelectTrigger id="teamId" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem equipe</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit">
        <UserCheck className="size-4" />
        Salvar atribuicao
      </Button>
    </form>
  );
}
