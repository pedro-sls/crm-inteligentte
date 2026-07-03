export const customerStatusLabels = {
  prospect: "Prospect",
  active: "Ativo",
  at_risk: "Em risco",
  inactive: "Inativo",
} as const;

export type CustomerStatus = keyof typeof customerStatusLabels;
export type CustomerStatusFilter = CustomerStatus | "all";

export const customerStatusOptions = [
  { value: "all", label: "Todos" },
  { value: "prospect", label: customerStatusLabels.prospect },
  { value: "active", label: customerStatusLabels.active },
  { value: "at_risk", label: customerStatusLabels.at_risk },
  { value: "inactive", label: customerStatusLabels.inactive },
] as const;

export function getCustomerStatusFilter(value?: string): CustomerStatusFilter {
  return customerStatusOptions.some((option) => option.value === value)
    ? (value as CustomerStatusFilter)
    : "all";
}
