export const demandStatusLabels = {
  open: "Aberta",
  in_progress: "Em andamento",
  waiting: "Aguardando",
  done: "Concluida",
  canceled: "Cancelada",
} as const;

export const demandStatusValues = ["open", "in_progress", "waiting", "done", "canceled"] as const;

export const demandPriorityLabels = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
} as const;

export type DemandStatus = keyof typeof demandStatusLabels;
export type DemandPriority = keyof typeof demandPriorityLabels;
export type DemandStatusFilter = DemandStatus | "all";
export type DemandPriorityFilter = DemandPriority | "all";

export const demandStatusOptions = [
  { value: "all", label: "Todos" },
  { value: "open", label: demandStatusLabels.open },
  { value: "in_progress", label: demandStatusLabels.in_progress },
  { value: "waiting", label: demandStatusLabels.waiting },
  { value: "done", label: demandStatusLabels.done },
  { value: "canceled", label: demandStatusLabels.canceled },
] as const;

export const demandPriorityOptions = [
  { value: "all", label: "Todas" },
  { value: "low", label: demandPriorityLabels.low },
  { value: "medium", label: demandPriorityLabels.medium },
  { value: "high", label: demandPriorityLabels.high },
  { value: "urgent", label: demandPriorityLabels.urgent },
] as const;

export function getDemandStatusFilter(value?: string): DemandStatusFilter {
  return demandStatusOptions.some((option) => option.value === value)
    ? (value as DemandStatusFilter)
    : "all";
}

export function getDemandPriorityFilter(value?: string): DemandPriorityFilter {
  return demandPriorityOptions.some((option) => option.value === value)
    ? (value as DemandPriorityFilter)
    : "all";
}
