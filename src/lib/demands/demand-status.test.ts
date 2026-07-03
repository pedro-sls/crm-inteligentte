import { describe, expect, it } from "vitest";
import { getDemandPriorityFilter, getDemandStatusFilter } from "@/lib/demands/demand-status";

describe("US-0302 - Filtros de demandas", () => {
  it("Cenario: filtros validos de status e prioridade sao preservados", () => {
    expect(getDemandStatusFilter("waiting")).toBe("waiting");
    expect(getDemandPriorityFilter("urgent")).toBe("urgent");
  });

  it("Cenario: filtros ausentes ou invalidos voltam para todos", () => {
    expect(getDemandStatusFilter()).toBe("all");
    expect(getDemandStatusFilter("travada")).toBe("all");
    expect(getDemandPriorityFilter()).toBe("all");
    expect(getDemandPriorityFilter("maxima")).toBe("all");
  });
});
