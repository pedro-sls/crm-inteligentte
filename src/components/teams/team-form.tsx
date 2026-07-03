import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TeamFormProps = {
  action: (formData: FormData) => Promise<void>;
};

export function TeamForm({ action }: TeamFormProps) {
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required placeholder="Operacoes" />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descricao</Label>
        <Textarea id="description" name="description" placeholder="Responsabilidades da equipe" />
      </div>

      <Button type="submit">
        <Save className="size-4" />
        Salvar equipe
      </Button>
    </form>
  );
}
