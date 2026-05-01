# VroomGo

Plataforma de aluguel de veículos desenvolvida com Next.js 15, com fluxo completo de reservas e pagamento integrado via Mercado Pago.

## Funcionalidades

- Catálogo de veículos com filtros por categoria, preço e disponibilidade
- Reserva online com seleção de período e cálculo automático de valor total
- Pagamento com pré-autorização de caução via Mercado Pago
- Histórico de aluguéis para o cliente
- Autenticação por e-mail/senha e Google OAuth
- Painel administrativo com KPIs, gráfico de receita e gestão de frota
- Design responsivo para mobile e desktop

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Banco de dados | PostgreSQL |
| ORM | Prisma 7 |
| Autenticação | NextAuth v5 |
| Pagamentos | Mercado Pago SDK |
| UI | Tailwind CSS 4, Lucide React |
| Gráficos | Recharts |
| Formulários | React Hook Form + Zod |
| Animações | Motion (Framer Motion) |

## Pré-requisitos

- Node.js 20+
- PostgreSQL

## Instalação

1. Clone o repositório e instale as dependências:
   ```bash
   git clone https://github.com/ne0fix/vroomgo.git
   cd vroomgo
   npm install
   ```

2. Copie o arquivo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```

3. Preencha as variáveis no `.env`:

   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/vroomgo"

   AUTH_SECRET="seu_secret_aleatorio"
   GOOGLE_CLIENT_ID="seu_google_client_id"
   GOOGLE_CLIENT_SECRET="seu_google_client_secret"

   MERCADO_PAGO_ACCESS_TOKEN="TEST-..."
   MERCADO_PAGO_PUBLIC_KEY="TEST-..."
   MERCADO_PAGO_WEBHOOK_SECRET="seu_webhook_secret"

   NEXT_PUBLIC_APP_URL="http://localhost:3001"
   ```

4. Execute as migrations e popule o banco com dados iniciais:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

   A aplicação estará disponível em `http://localhost:3001`.

## Estrutura do projeto

```
vroomgo/
├── app/                    # Rotas e páginas (App Router)
│   ├── api/               # API routes (auth, veículos, reservas, pagamentos)
│   ├── dashboard/         # Painel administrativo
│   ├── veiculos/          # Catálogo e detalhe de veículos
│   ├── reserva/           # Fluxo de reserva
│   └── checkout/          # Retorno de pagamento
├── components/            # Componentes reutilizáveis
├── lib/                   # Prisma client, NextAuth, utilitários
├── models/                # DTOs, entidades e schemas de validação
├── repositories/          # Camada de acesso ao banco
├── services/              # Regras de negócio
├── viewmodels/            # Hooks de estado para as páginas
└── prisma/                # Schema e migrations
```

## Fluxo de pagamento

O pagamento usa pré-autorização (reserva de valor) para a caução:

1. Cliente confirma a reserva e é redirecionado ao Mercado Pago
2. O valor da diária + caução é pré-autorizado no cartão
3. Ao término do aluguel, a caução é liberada ou retida conforme avaliação do admin
4. Webhooks do Mercado Pago atualizam o status da transação em tempo real

## Scripts disponíveis

```bash
npm run dev      # Desenvolvimento (porta 3001)
npm run build    # Build de produção
npm run start    # Inicia o build de produção
npm run lint     # Verifica o código com ESLint
```
