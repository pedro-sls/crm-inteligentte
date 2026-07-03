# CRM INTELIGENTTE

CRM customizavel para gestao de clientes, demandas de clientes, demandas internas, distribuicao de trabalho, automacoes e integracoes com n8n/Make.

## Sprint Atual

Branch atual de trabalho:

```bash
feature/sprint-3-client-demands
```

## Documentacao Inicial

- Planejamento editavel: `docs/planejamento-crm-inteligentte.md`
- Planejamento em PDF: `docs/planejamento-crm-inteligentte.pdf`
- Politica de seguranca: `docs/security.md`

## Stack Planejada

- Next.js + React + TypeScript
- Tailwind CSS + shadcn/ui
- Neon/PostgreSQL
- Drizzle ORM
- Better Auth
- Webhooks e API para n8n/Make

## Preparacao

1. Copie `.env.example` para `.env`.
2. Crie um banco no Neon.
3. Cole a string de conexao do Neon em `DATABASE_URL`.
4. Gere segredos fortes para `AUTH_SECRET`, `WEBHOOK_SIGNING_SECRET` e `API_KEY_PEPPER`.
5. Instale dependencias com `npm install`.
6. Aplique as migrations no Neon:

```bash
npm run db:migrate
```

7. Rode o app localmente:

```bash
npm run dev
```

8. Gere novamente o PDF, se alterar a documentacao, com:

```bash
npm run docs:pdf
```

## Seguranca

Este repositorio e publico. Antes de cada commit:

```bash
npm run security:secrets
npm run lint
npm run typecheck
```

Nunca suba `.env`, tokens, URL real do Neon, chaves de API ou dados reais de clientes.

## Qualidade, CI e CD

Os testes unitarios ficam alinhados aos BDDs do planejamento sempre que uma
regra de negocio for implementada.

```bash
npm run test:unit
```

O CI roda em pull requests e branches de feature:

- `npm run security:secrets`
- `npm run lint`
- `npm run typecheck`
- `npm run test:ci`
- `npm run build`
- `npm run security:audit`

O CD esta preparado para Vercel em `main`, mas so executa deploy quando estes
secrets existirem no GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Proximo Marco

Executar a Sprint 3:

- Criar demandas vinculadas a clientes.
- Exibir demandas na listagem geral e no detalhe do cliente.
- Permitir alterar status e prioridade.
- Registrar eventos relevantes na auditoria.
