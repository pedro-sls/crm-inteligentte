import { describe, expect, it } from "vitest";
import { getCustomerStatusFilter } from "@/lib/customers/customer-status";

describe("US-0201 - Listar e buscar clientes", () => {
  it("Cenario: filtro por status valido e preservado", () => {
    expect(getCustomerStatusFilter("active")).toBe("active");
    expect(getCustomerStatusFilter("at_risk")).toBe("at_risk");
  });

  it("Cenario: filtro ausente ou invalido volta para todos", () => {
    expect(getCustomerStatusFilter()).toBe("all");
    expect(getCustomerStatusFilter("fora-do-fluxo")).toBe("all");
  });
});
