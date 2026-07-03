# Politica de Seguranca do CRM INTELIGENTTE

Este repositorio e publico. Nenhum dado real da empresa, segredo, token, chave de API, URL real de banco ou arquivo `.env` deve ser commitado.

## Regras

- Use `.env` somente localmente.
- Versione apenas `.env.example` com placeholders.
- Nao inclua dados reais de clientes em seeds, testes, prints ou documentacao.
- Nao publique URLs reais do Neon, tokens do GitHub, chaves de API, certificados ou arquivos `.pem`.
- Revise `git diff` antes de cada commit.
- Rode `npm run security:secrets` antes de commits.
- Rode `npm run security:audit` antes de finalizar uma feature.

## Branches

- Use uma branch por funcionalidade.
- Padrao sugerido: `feature/<sprint>-<descricao-curta>`.
- Commits devem ser descritivos e pequenos o suficiente para revisao.

## Variaveis Esperadas

- `DATABASE_URL`: string de conexao do Neon, somente em `.env` local ou ambiente de deploy.
- `AUTH_SECRET`: segredo de autenticacao.
- `WEBHOOK_SIGNING_SECRET`: segredo para assinar payloads de webhooks.
- `API_KEY_PEPPER`: segredo usado para proteger chaves de API.

Gere segredos localmente e nunca cole os valores reais em commits, issues,
prints ou documentacao publica. Um formato seguro e usar pelo menos 32 bytes
aleatorios codificados em hexadecimal.
