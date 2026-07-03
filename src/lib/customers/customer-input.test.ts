import { describe, expect, it } from "vitest";
import { parseCustomerFormData } from "@/lib/customers/customer-input";

function createFormData(values: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }

  return formData;
}

describe("US-0201 - Criar novo cliente", () => {
  it("Cenario: cadastro com nome e dados validos normaliza o cliente para salvamento", () => {
    const formData = createFormData({
      name: "  Cliente BDD  ",
      document: "  DOC-001  ",
      email: "cliente.bdd@example.com",
      phone: " 11999990000 ",
      website: "https://example.com",
      status: "active",
      notes: "  Primeira nota  ",
    });

    expect(parseCustomerFormData(formData)).toEqual({
      name: "Cliente BDD",
      document: "DOC-001",
      email: "cliente.bdd@example.com",
      phone: "11999990000",
      website: "https://example.com",
      status: "active",
      customFields: {
        notes: "Primeira nota",
      },
    });
  });

  it("Cenario: campos opcionais vazios viram null e nao criam notas vazias", () => {
    const formData = createFormData({
      name: "Cliente sem opcionais",
      document: "",
      email: "",
      phone: "",
      website: "",
      status: "prospect",
      notes: "",
    });

    expect(parseCustomerFormData(formData)).toEqual({
      name: "Cliente sem opcionais",
      document: null,
      email: null,
      phone: null,
      website: null,
      status: "prospect",
      customFields: {},
    });
  });

  it("Cenario: formulario nao pode definir organizationId vindo do cliente", () => {
    const formData = createFormData({
      name: "Cliente isolado",
      status: "prospect",
      organizationId: "00000000-0000-0000-0000-000000000000",
    });

    expect(parseCustomerFormData(formData)).not.toHaveProperty("organizationId");
  });

  it("Cenario: dados invalidos impedem o cadastro", () => {
    const formData = createFormData({
      name: "A",
      email: "email-invalido",
      website: "site-invalido",
      status: "active",
    });

    expect(() => parseCustomerFormData(formData)).toThrow();
  });
});
