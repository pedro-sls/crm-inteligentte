# CRM INTELIGENTTE - Integracoes, API e Webhooks

Este documento descreve os contratos iniciais para n8n, Make e outras automacoes.

## Autenticacao da API

As requisicoes inbound usam chave de API por organizacao:

```http
Authorization: Bearer crm_live_EXEMPLO
Content-Type: application/json
```

A chave completa aparece somente no momento da criacao em `Integracoes > Chaves de API`.
O banco armazena apenas hash da chave.

## Criar cliente

```http
POST /api/v1/customers
```

```json
{
  "name": "Cliente Exemplo",
  "email": "contato@example.com",
  "phone": "+55 11 99999-9999",
  "status": "active",
  "customFields": {
    "origem": "n8n"
  }
}
```

## Criar demanda

```http
POST /api/v1/demands
```

```json
{
  "type": "client",
  "customerId": "00000000-0000-4000-8000-000000000000",
  "title": "Solicitacao recebida pelo Make",
  "description": "Descricao opcional",
  "priority": "urgent",
  "customFields": {
    "origem": "make"
  }
}
```

Para demanda interna, use `"type": "internal"` e omita `customerId`.

## Webhooks de saida

Webhooks sao cadastrados em `Integracoes > Novo webhook`.

Eventos iniciais:

- `customer.created`
- `customer.updated`
- `demand.created`
- `demand.updated`
- `demand.status_changed`
- `demand.assigned`

Headers enviados:

```http
Content-Type: application/json
X-CRM-Event: demand.created
X-CRM-Signature: assinatura-hmac-sha256
```

Payload:

```json
{
  "event": "demand.created",
  "organizationId": "00000000-0000-4000-8000-000000000000",
  "entityId": "00000000-0000-4000-8000-000000000001",
  "data": {
    "id": "00000000-0000-4000-8000-000000000001",
    "title": "Solicitacao urgente",
    "status": "open"
  },
  "occurredAt": "2026-07-06T13:00:00.000Z"
}
```

## Boas praticas

- Use uma chave diferente para cada automacao critica.
- Revogue chaves suspeitas imediatamente.
- Valide `X-CRM-Signature` antes de processar webhooks.
- Registre os IDs externos no `customFields` para facilitar rastreabilidade.
