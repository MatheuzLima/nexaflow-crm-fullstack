# NexaFlow CRM & Ops

Plataforma web de demonstração com **dashboard em tempo real**, **agente de IA que qualifica contatos**, **pipeline de vendas (kanban)** e **automações de atendimento**, para o nicho de logística e operações.

> Todos os dados são **fictícios e simulados no navegador**. Não há backend nem banco de dados nesta versão. A simulação foi feita para apresentar o conceito a clientes.

## O que a demo mostra

| Tela | O que acontece |
| --- | --- |
| **Visão geral** | KPIs, contatos por hora, funil, origem dos contatos, carga por vendedor e um **feed ao vivo**: contatos chegam sozinhos e passam pelas etapas webhook → extração → IA → roteamento. |
| **Pipeline** | Kanban com 5 etapas. Arraste cards entre colunas, filtre por vendedor ou "só quentes". Clique no card para ver a análise da IA. |
| **Leads** | Tabela com busca, filtros (temperatura, etapa, canal), ordenação e paginação. |
| **Automações** | 5 fluxos com liga/desliga **que mudam o comportamento de verdade** (ex.: pausar a qualificação faz os leads entrarem sem análise). Simulador de webhook e lista de integrações. |
| **Painel do lead** | Nota, "por que essa nota?" (cada ponto explicado), dados extraídos (volume, rota, prazo), resposta sugerida, linha do tempo. |

Dica para apresentar: clique em **Novo contato**, escreva uma mensagem como um cliente escreveria e veja o agente qualificar em segundos. Há exemplos prontos ("Alta intenção", "Urgente", "Só pesquisando").

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Para gerar a versão de produção: `npm run build` (saída em `dist/`).

## Deploy na Vercel

**Pelo GitHub (recomendado)**

1. Suba esta pasta em um repositório.
2. Na Vercel: **Add New → Project** e importe o repositório.
3. A Vercel detecta **Vite** sozinha (build `npm run build`, saída `dist`). Não precisa de variáveis de ambiente.
4. Clique em **Deploy**.

**Pela CLI**

```bash
npx vercel        # primeiro deploy (preview)
npx vercel --prod # produção
```

**Domínio:** em *Settings → Domains* do projeto, adicione o subdomínio que você usar no portfólio (por exemplo `app.nexaflow.io`, que é o endereço exibido no card do projeto) e aponte o DNS conforme a Vercel indicar.

## Estrutura

```
src/
  pages/            dashboard, pipeline, leads, automations, not-found
  components/
    crm/            painel do lead, formulário de contato, selos, avatar
    dashboard/      KPIs, gráficos, feed ao vivo, equipe, atividade
    layout/         sidebar, cabeçalho, busca (Ctrl K), tema claro/escuro
    ui/             componentes base
  lib/crm/
    ai.ts           motor de qualificação (nota, intenção, extração)
    store.ts        estado global (zustand) + simulação em tempo real
    generator.ts    gerador de contatos realistas em pt-BR
    seed.ts         dados iniciais (46 leads, determinísticos)
    reps.ts         vendedores e regra de roteamento
    flows.ts        definição das automações
  routes.tsx        rotas (carregamento sob demanda)
```

## Como funciona a "IA" desta demo

O arquivo [`src/lib/crm/ai.ts`](src/lib/crm/ai.ts) é um **motor de regras determinístico e explicável**: lê a mensagem, procura sinais (intenção de compra, urgência, volume, recorrência, poder de decisão, rota, prazo) e devolve nota, temperatura e a lista de pontos que formou a nota. Nota ≥ 60 vira "Qualificado".

Isso é intencional para a demonstração: funciona offline, é instantâneo e não gera custo. **Em um projeto real, a função `qualify()` é o ponto de troca por um modelo de linguagem.**

### Trocar por IA real (exemplo)

1. Crie `api/qualify.ts` (função serverless da Vercel) que recebe `{ name, company, role, channel, message }`, chama a API do modelo e devolve o mesmo formato `QualifyResult` (`score`, `temperature`, `value`, `ai`).
2. Guarde a chave em *Settings → Environment Variables* (ex.: `ANTHROPIC_API_KEY`). Nunca coloque a chave no código do navegador.
3. No `store.ts`, substitua a chamada a `qualify()` por `await fetch("/api/qualify", …)` e mantenha a regra de roteamento atual.
4. Mantenha o motor de regras como *fallback* caso a API esteja fora do ar.

Para o webhook real (WhatsApp Business API, formulários do site), crie `api/webhooks/leads.ts` e persista os leads em um banco (Supabase, Neon, Vercel Postgres). O payload de exemplo aparece na tela **Automações**.

## Personalizar para um cliente

- **Marca e cores:** tokens em [`src/index.css`](src/index.css) (`--primary`, `--chart-*`, claro e escuro). Logo em `src/components/crm/brand.tsx` e `public/favicon.svg`.
- **Serviços, canais e etapas:** [`src/lib/crm/types.ts`](src/lib/crm/types.ts).
- **Vendedores e roteamento:** [`src/lib/crm/reps.ts`](src/lib/crm/reps.ts).
- **Mensagens simuladas:** [`src/lib/crm/generator.ts`](src/lib/crm/generator.ts).
- **Automações:** [`src/lib/crm/flows.ts`](src/lib/crm/flows.ts).


## Licença

Distribuído sob a licença [**MIT**](./LICENSE) `LICENSE`