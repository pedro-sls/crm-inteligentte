import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  demandPriorityOptions,
  demandStatusOptions,
  type DemandPriority,
  type DemandStatus,
} from "@/lib/demands/demand-status";

type DemandStatusFormProps = {
  action: (formData: FormData) => Promise<void>;
  id: string;
  status: DemandStatus;
  priority: DemandPriority;
};

export function DemandStatusForm({ action, id, status, priority }: DemandStatusFormProps) {
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="id" value={id} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={status}>
            <SelectTrigger id="status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {demandStatusOptions
                .filter((option) => option.value !== "all")
                .map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select name="priority" defaultValue={priority}>
            <SelectTrigger id="priority" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {demandPriorityOptions
                .filter((option) => option.value !== "all")
                .map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-fit">
        <Save className="size-4" />
        Salvar status
      </Button>
    </form>
  );
}
