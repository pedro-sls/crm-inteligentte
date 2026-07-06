import { describe, expect, it } from "vitest";
import { getDemandPriorityFilter, getDemandStatusFilter } from "@/lib/demands/demand-status";

describe("US-0302 - Filtros de demandas", () => {
  it("Cenario: filtros validos de status e prioridade sao preservados", () => {
    expect(getDemandStatusFilter("waiting")).toBe("waiting");
    expect(getDemandPriorityFilter("urgent")).toBe("urgent");
  });

  it("Cenario: filtro ausente volta para todos e status customizado e preservado", () => {
    expect(getDemandStatusFilter()).toBe("all");
    expect(getDemandStatusFilter("em_revisao")).toBe("em_revisao");
    expect(getDemandPriorityFilter()).toBe("all");
    expect(getDemandPriorityFilter("maxima")).toBe("all");
  });
});
