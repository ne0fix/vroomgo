# PRD — Migração de Pagamentos: Stripe → Mercado Pago
**Projeto:** VroomGo (aluguel de veículos)
**Data:** 2026-05-01
**Status:** Pronto para implementação
**Implementador:** Gemini

---

## 1. Contexto e Problema

O projeto VroomGo possui toda a infraestrutura de pagamento escrita com Stripe (PaymentIntents, capture manual de caução). O pacote `stripe` **não está instalado no `package.json`**, tornando pagamentos completamente inoperantes. A migração para Mercado Pago é necessária pois o produto opera no Brasil e o MP é o gateway dominante no mercado brasileiro.

### Estado atual (quebrado)
- `lib/stripe.ts` — importa `stripe` (pacote não instalado)
- `services/PagamentoService.ts` — usa 4 métodos Stripe que falharão em runtime
- `prisma/schema.prisma` — campos `stripePaymentIntentId` e `stripeChargeId` no model `Transacao`
- `app/api/pagamentos/checkout/route.ts` — único endpoint de pagamento, retorna `clientSecret` (inutilizável sem frontend Stripe)
- **Não existem**: página `/reserva/[id]`, webhook handler, página de sucesso/falha, UI de checkout

### O que NÃO muda
- Toda a lógica de reservas (`ReservaService`, `ReservaRepository`)
- Autenticação (`lib/auth.ts`, NextAuth)
- Models de `Reserva`, `Veiculo`, `Usuario`
- Middleware de rotas protegidas
- Layout, design system, componentes visuais
- `FormularioReserva.tsx` (fluxo até `POST /api/reservas` permanece igual)

---

## 2. Decisão de Arquitetura: Estratégia de Caução

O Stripe permitia `capture_method: "manual"` (pré-autoriza, captura depois). O Mercado Pago **não tem equivalente direto**.

**Estratégia adotada: Pagamento único + Reembolso parcial**

```
Usuário paga: valorAluguel + valorCaucao (total cobrado de uma vez)
              ↓
Ao devolver o carro sem danos:
  → Admin aciona "Liberar Caução" → MP refund API → devolve valorCaucao
              ↓
Se houver dano/multa:
  → Admin aciona "Reter Caução" → nenhuma ação no MP (mantém o dinheiro)
              ↓
Reter parcialmente:
  → Admin define valor a reter → MP refund API com valor = valorCaucao - retencao
```

**Por que esta estratégia:**
- É o padrão do mercado BR para depósitos caução em marketplace
- A API de refund do MP é simples e confiável
- Mantém a semântica atual do banco de dados (`PRE_AUTORIZADO` → `PAGO` ou `ESTORNADO`)
- O cliente vê a caução na fatura e recebe estorno claro

---

## 3. Fluxo Completo de Pagamento (novo)

```
[1] Usuário preenche FormularioReserva.tsx
         ↓
[2] POST /api/reservas → cria Reserva (status: PENDENTE) → retorna reserva.id
         ↓
[3] useReservaViewModel redireciona para /reserva/{reservaId}
         ↓
[4] Página /reserva/[id] exibe resumo + botão "Pagar com Mercado Pago"
         ↓
[5] Clique do botão → POST /api/pagamentos/checkout { reservaId }
         ↓
[6] API cria Preference no MP → salva Transacao (status: PENDENTE) → retorna { preferenceId, initPoint }
         ↓
[7] Frontend redireciona para initPoint (URL do MP Checkout Pro)
         ↓
[8] Usuário paga no ambiente seguro do Mercado Pago
         ↓
[9] MP redireciona para /checkout/sucesso?payment_id=...&status=...
         (ou /checkout/pendente ou /checkout/falhou)
         ↓
[10] SIMULTANEAMENTE: MP envia webhook POST /api/pagamentos/webhook
         ↓
[11] Webhook valida assinatura → atualiza Transacao + Reserva + Veiculo no banco
         ↓
[12] Página /checkout/sucesso exibe confirmação e link para /meus-alugueis
```

**Fluxo Admin — Liberar/Reter Caução:**
```
Dashboard Admin → Reserva CONFIRMADA/CONCLUIDA
         ↓
Botão "Liberar Caução" → POST /api/pagamentos/{reservaId}/liberar-caucao
         → MP refund API (valor = valorCaucao)
         → Transacao.status = ESTORNADO (parcial)
         → Reserva.status = CONCLUIDA
         → Veiculo.status = DISPONIVEL

Botão "Reter Caução" (com motivo) → POST /api/pagamentos/{reservaId}/capturar-caucao
         → Nenhuma ação no MP (dinheiro já recebido)
         → Transacao.status = PAGO
         → Reserva.status = CONCLUIDA
         → Veiculo.status = DISPONIVEL

Botão "Reter Parcial" (com valor) → POST /api/pagamentos/{reservaId}/liberar-caucao { valorReembolso }
         → MP refund API (valor = valorCaucao - retencao)
         → Transacao.status = PAGO
```

---

## 4. Mudanças no Banco de Dados

### 4.1 Schema — Model `Transacao`

**Remover:**
```prisma
stripePaymentIntentId String? @unique @map("stripe_payment_intent_id")
stripeChargeId        String? @map("stripe_charge_id")
```

**Adicionar:**
```prisma
mpPreferenceId  String? @unique @map("mp_preference_id")
mpPaymentId     String? @unique @map("mp_payment_id")
mpStatus        String? @map("mp_status")        // status bruto do MP: approved, pending, rejected
mpStatusDetail  String? @map("mp_status_detail") // detalhe: accredited, cc_rejected_bad_filled_cvv, etc.
```

### 4.2 Schema completo do model `Transacao` após migração

```prisma
model Transacao {
  id              String          @id @default(cuid())
  reservaId       String          @map("reserva_id")
  mpPreferenceId  String?         @unique @map("mp_preference_id")
  mpPaymentId     String?         @unique @map("mp_payment_id")
  mpStatus        String?         @map("mp_status")
  mpStatusDetail  String?         @map("mp_status_detail")
  tipo            String
  valor           Decimal         @db.Decimal(10, 2)
  status          StatusPagamento @default(PENDENTE)
  metodoPagamento String?         @map("metodo_pagamento")
  descricao       String?
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  reserva Reserva @relation(fields: [reservaId], references: [id])

  @@map("transacoes")
}
```

### 4.3 Migration SQL

Gerar migration com Prisma:
```bash
npx prisma migrate dev --name migrar_stripe_para_mercadopago
```

O SQL gerado deve:
```sql
ALTER TABLE "transacoes"
  DROP COLUMN "stripe_payment_intent_id",
  DROP COLUMN "stripe_charge_id",
  ADD COLUMN "mp_preference_id" TEXT UNIQUE,
  ADD COLUMN "mp_payment_id" TEXT UNIQUE,
  ADD COLUMN "mp_status" TEXT,
  ADD COLUMN "mp_status_detail" TEXT;
```

---

## 5. Dependências

### 5.1 Instalar
```bash
npm install mercadopago
```

Versão alvo: `^2.0.0` (SDK oficial Node.js v2 do Mercado Pago)

### 5.2 Remover (opcional, mas recomendado)
O `stripe` não está no package.json (já foi removido). Confirmar que não está antes de prosseguir.

---

## 6. Variáveis de Ambiente

### 6.1 `.env` — atualizar
```env
# Remover:
# STRIPE_SECRET_KEY=...
# STRIPE_PUBLISHABLE_KEY=...

# Adicionar:
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxx   # ou APP_USR-... para produção
MERCADO_PAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_WEBHOOK_SECRET=sua_chave_secreta_webhook  # usada para validar assinatura

# URLs de callback (ajustar para produção)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6.2 `.env.example` — atualizar para refletir o novo setup
```env
DATABASE_URL=postgres://user:password@localhost:5432/vroomgo
NEXTAUTH_SECRET=sua_chave_secreta_aqui
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

MERCADO_PAGO_ACCESS_TOKEN=TEST-...
MERCADO_PAGO_PUBLIC_KEY=TEST-...
MERCADO_PAGO_WEBHOOK_SECRET=...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. Arquivos a Criar / Modificar

### 7.1 DELETAR
- `lib/stripe.ts` — deletar completamente

### 7.2 CRIAR: `lib/mercadopago.ts`

```typescript
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
if (!accessToken) {
  console.warn("MERCADO_PAGO_ACCESS_TOKEN não configurado. Pagamentos falharão.");
}

export const mpClient = new MercadoPagoConfig({
  accessToken: accessToken || 'TEST-placeholder',
});

export const mpPreference = new Preference(mpClient);
export const mpPayment = new Payment(mpClient);
```

---

### 7.3 REESCREVER: `services/PagamentoService.ts`

```typescript
import { mpPreference, mpPayment } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { reservaService } from "./ReservaService";
import { veiculoRepository } from "@/repositories/VeiculoRepository";

export class PagamentoService {

  // Cria uma Preference no MP e registra Transacao PENDENTE
  async criarPreferencia(reservaId: string, usuarioId: string) {
    const reserva = await reservaService.obterReserva(reservaId);
    if (reserva.usuarioId !== usuarioId) throw new Error("Acesso não autorizado");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const valorTotal = Number(reserva.valorTotal) + Number(reserva.valorCaucao);

    const preference = await mpPreference.create({
      body: {
        items: [
          {
            id: reservaId,
            title: `VroomGo — ${reserva.veiculo?.marca} ${reserva.veiculo?.modelo}`,
            description: `Aluguel (${reserva.totalDias} dias) + Caução reembolsável`,
            quantity: 1,
            unit_price: valorTotal,
            currency_id: 'BRL',
          },
        ],
        metadata: {
          reservaId,
          usuarioId,
          valorAluguel: reserva.valorTotal.toString(),
          valorCaucao: reserva.valorCaucao.toString(),
        },
        back_urls: {
          success: `${appUrl}/checkout/sucesso`,
          failure: `${appUrl}/checkout/falhou`,
          pending: `${appUrl}/checkout/pendente`,
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/pagamentos/webhook`,
        expires: false,
      },
    });

    await prisma.transacao.create({
      data: {
        reservaId,
        mpPreferenceId: preference.id!,
        tipo: "ALUGUEL",
        valor: valorTotal,
        status: "PENDENTE",
        metodoPagamento: "MERCADO_PAGO",
        descricao: `Aluguel + Caução — ${reserva.veiculo?.modelo}`,
      },
    });

    return {
      preferenceId: preference.id,
      initPoint: preference.init_point,      // URL produção
      sandboxInitPoint: preference.sandbox_init_point, // URL sandbox
    };
  }

  // Chamado pelo webhook quando pagamento é aprovado
  async processarPagamentoAprovado(mpPaymentId: string) {
    const pagamento = await mpPayment.get({ id: Number(mpPaymentId) });

    const reservaId = pagamento.metadata?.reservaId as string;
    if (!reservaId) throw new Error("reservaId não encontrado nos metadados do pagamento");

    const transacao = await prisma.transacao.findFirst({
      where: { reservaId },
    });
    if (!transacao) throw new Error("Transação não encontrada");

    await Promise.all([
      prisma.transacao.update({
        where: { id: transacao.id },
        data: {
          mpPaymentId: mpPaymentId,
          mpStatus: pagamento.status,
          mpStatusDetail: pagamento.status_detail,
          status: "PRE_AUTORIZADO",
          metodoPagamento: pagamento.payment_method_id || "MERCADO_PAGO",
        },
      }),
      prisma.reserva.update({
        where: { id: reservaId },
        data: { status: "CONFIRMADA" },
      }),
    ]);

    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
    });

    if (reserva?.veiculoId) {
      await veiculoRepository.updateStatus(reserva.veiculoId, "ALUGADO");
    }

    return { sucesso: true };
  }

  // Admin: devolve a caução ao cliente (fim do aluguel sem dano)
  async liberarCaucao(reservaId: string, valorReembolso?: number) {
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { transacoes: true, veiculo: true },
    });
    if (!reserva) throw new Error("Reserva não encontrada");

    const transacao = reserva.transacoes.find((t) => t.tipo === "ALUGUEL");
    if (!transacao?.mpPaymentId) throw new Error("Payment ID do Mercado Pago não encontrado");

    const valorCaucao = Number(reserva.valorCaucao);
    const valorAReembolsar = valorReembolso !== undefined ? valorReembolso : valorCaucao;

    // Emite o reembolso no MP
    await mpPayment.refund({
      id: Number(transacao.mpPaymentId),
      body: {
        amount: valorAReembolsar,
      },
    });

    await Promise.all([
      prisma.transacao.update({
        where: { id: transacao.id },
        data: {
          status: valorAReembolsar === valorCaucao ? "ESTORNADO" : "PAGO",
          descricao: `Caução reembolsada: R$ ${valorAReembolsar.toFixed(2)}`,
        },
      }),
      prisma.reserva.update({
        where: { id: reservaId },
        data: { status: "CONCLUIDA" },
      }),
      veiculoRepository.updateStatus(reserva.veiculoId, "DISPONIVEL"),
    ]);

    return { sucesso: true, valorReembolsado: valorAReembolsar };
  }

  // Admin: retém a caução (dano confirmado, sem reembolso)
  async reterCaucao(reservaId: string, motivo: string) {
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { transacoes: true },
    });
    if (!reserva) throw new Error("Reserva não encontrada");

    const transacao = reserva.transacoes.find((t) => t.tipo === "ALUGUEL");
    if (!transacao) throw new Error("Transação não encontrada");

    await Promise.all([
      prisma.transacao.update({
        where: { id: transacao.id },
        data: {
          status: "PAGO",
          descricao: `Caução retida — ${motivo}`,
        },
      }),
      prisma.reserva.update({
        where: { id: reservaId },
        data: { status: "CONCLUIDA" },
      }),
      veiculoRepository.updateStatus(reserva.veiculoId, "DISPONIVEL"),
    ]);

    return { sucesso: true };
  }

  // Busca status atual de um pagamento no MP (para sync manual)
  async consultarPagamento(mpPaymentId: string) {
    const pagamento = await mpPayment.get({ id: Number(mpPaymentId) });
    return {
      status: pagamento.status,
      statusDetail: pagamento.status_detail,
      valor: pagamento.transaction_amount,
      metodoPagamento: pagamento.payment_method_id,
      dataAprovacao: pagamento.date_approved,
    };
  }
}

export const pagamentoService = new PagamentoService();
```

---

### 7.4 REESCREVER: `app/api/pagamentos/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pagamentoService } from "@/services/PagamentoService";
import { z } from "zod";

const CheckoutSchema = z.object({ reservaId: z.string().cuid() });

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { reservaId } = CheckoutSchema.parse(body);
    const resultado = await pagamentoService.criarPreferencia(reservaId, session.user.id);

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
}
```

---

### 7.5 CRIAR: `app/api/pagamentos/webhook/route.ts`

Esta rota recebe notificações IPN (Instant Payment Notification) do Mercado Pago.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { pagamentoService } from "@/services/PagamentoService";
import { mpPayment } from "@/lib/mercadopago";

// O MP envia POST com query params: ?id=...&topic=payment
// e também envia POST com body JSON para webhooks configurados no painel
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic") || searchParams.get("type");
    const id = searchParams.get("id") || searchParams.get("data.id");

    // Suporte ao novo formato de webhook (topic = "payment")
    let paymentId = id;

    if (!paymentId) {
      const body = await request.json().catch(() => ({}));
      if (body?.data?.id) paymentId = String(body.data.id);
      if (body?.type === "payment") paymentId = String(body?.data?.id);
    }

    if (!paymentId || (topic && topic !== "payment" && topic !== "merchant_order")) {
      // Ignorar tópicos que não são de pagamento (ex: subscriptions)
      return NextResponse.json({ recebido: true });
    }

    if (topic === "merchant_order") {
      // Para merchant_order, buscar o payment_id dentro do pedido
      // O MP pode enviar este tópico — por segurança, apenas confirmar recebimento
      return NextResponse.json({ recebido: true });
    }

    // Buscar detalhes do pagamento na API do MP para confirmar status
    const pagamento = await mpPayment.get({ id: Number(paymentId) });

    if (pagamento.status === "approved") {
      await pagamentoService.processarPagamentoAprovado(paymentId);
    }
    // Outros status (pending, rejected, cancelled) podem ser tratados se necessário
    // Por ora, apenas "approved" dispara ações no banco

    return NextResponse.json({ recebido: true });
  } catch (error: any) {
    console.error("Erro no webhook MP:", error.message);
    // Retornar 200 para evitar que o MP reenvie indefinidamente
    return NextResponse.json({ recebido: true, erro: error.message });
  }
}
```

---

### 7.6 CRIAR: `app/api/pagamentos/[reservaId]/liberar-caucao/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pagamentoService } from "@/services/PagamentoService";
import { z } from "zod";

const LiberarSchema = z.object({
  valorReembolso: z.number().positive().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { reservaId: string } }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { valorReembolso } = LiberarSchema.parse(body);
    const resultado = await pagamentoService.liberarCaucao(params.reservaId, valorReembolso);

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
}
```

---

### 7.7 CRIAR: `app/api/pagamentos/[reservaId]/reter-caucao/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pagamentoService } from "@/services/PagamentoService";
import { z } from "zod";

const ReterSchema = z.object({ motivo: z.string().min(3) });

export async function POST(
  request: NextRequest,
  { params }: { params: { reservaId: string } }
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const { motivo } = ReterSchema.parse(body);
    const resultado = await pagamentoService.reterCaucao(params.reservaId, motivo);

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
}
```

---

### 7.8 CRIAR: `app/reserva/[id]/page.tsx`

Página onde o cliente vê o resumo da reserva antes de pagar. Rota já está protegida no middleware.

```typescript
// Server Component
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BotaoPagarMP } from "@/components/BotaoPagarMP"; // client component
import { formatarMoeda } from "@/lib/utils";

interface Props {
  params: { id: string };
}

export default async function ReservaPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const reserva = await prisma.reserva.findUnique({
    where: { id: params.id },
    include: { veiculo: true, transacoes: true },
  });

  if (!reserva || reserva.usuarioId !== session.user.id) notFound();

  const jaPago = reserva.transacoes.some((t) =>
    ["PRE_AUTORIZADO", "PAGO"].includes(t.status)
  );

  const valorTotal = Number(reserva.valorTotal) + Number(reserva.valorCaucao);

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="text-3xl font-bold mb-8">Confirmar Reserva</h1>

        {/* Dados do veículo */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {reserva.veiculo?.marca} {reserva.veiculo?.modelo} ({reserva.veiculo?.ano})
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
            <div>
              <span className="font-medium">Retirada:</span>{" "}
              {new Date(reserva.dataInicio).toLocaleDateString("pt-BR")}
            </div>
            <div>
              <span className="font-medium">Devolução:</span>{" "}
              {new Date(reserva.dataFim).toLocaleDateString("pt-BR")}
            </div>
            <div>
              <span className="font-medium">Dias:</span> {reserva.totalDias}
            </div>
            <div>
              <span className="font-medium">Diária:</span>{" "}
              {formatarMoeda(Number(reserva.valorDiaria))}
            </div>
          </div>
        </div>

        {/* Resumo financeiro */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6 space-y-3">
          <h2 className="text-lg font-semibold mb-4">Resumo do Pagamento</h2>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Aluguel ({reserva.totalDias} dias)</span>
            <span>{formatarMoeda(Number(reserva.valorTotal))}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Caução (reembolsável)</span>
            <span>{formatarMoeda(Number(reserva.valorCaucao))}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-3">
            <span>Total a pagar</span>
            <span className="text-[#00d084]">{formatarMoeda(valorTotal)}</span>
          </div>
          <p className="text-xs text-gray-500">
            A caução de {formatarMoeda(Number(reserva.valorCaucao))} será reembolsada
            após a devolução do veículo em boas condições.
          </p>
        </div>

        {/* Status ou botão de pagamento */}
        {jaPago ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <p className="text-green-700 font-semibold text-lg">Pagamento confirmado!</p>
            <p className="text-green-600 text-sm mt-1">
              Sua reserva está ativa. Acompanhe em Meus Aluguéis.
            </p>
            <a
              href="/meus-alugueis"
              className="inline-block mt-4 bg-[#00d084] text-white px-6 py-2 rounded-xl font-semibold"
            >
              Ver Meus Aluguéis
            </a>
          </div>
        ) : (
          <BotaoPagarMP reservaId={params.id} valorTotal={valorTotal} />
        )}
      </div>
    </main>
  );
}
```

---

### 7.9 CRIAR: `components/BotaoPagarMP.tsx` (Client Component)

```typescript
"use client";

import { useState } from "react";
import { formatarMoeda } from "@/lib/utils";

interface Props {
  reservaId: string;
  valorTotal: number;
}

export function BotaoPagarMP({ reservaId, valorTotal }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const iniciarPagamento = async () => {
    setIsLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/pagamentos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao iniciar pagamento");

      // Em desenvolvimento usa sandbox, em produção usa initPoint
      const url = process.env.NODE_ENV === "production"
        ? data.initPoint
        : data.sandboxInitPoint;

      window.location.href = url;
    } catch (err: any) {
      setErro(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {erro}
        </div>
      )}
      <button
        onClick={iniciarPagamento}
        disabled={isLoading}
        className="w-full bg-[#009ee3] hover:bg-[#0088cc] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          "Redirecionando..."
        ) : (
          <>
            {/* Logo MP inline SVG ou texto */}
            <span>Pagar com Mercado Pago</span>
            <span className="text-sm font-normal opacity-80">
              {formatarMoeda(valorTotal)}
            </span>
          </>
        )}
      </button>
      <p className="text-xs text-center text-gray-500">
        Você será redirecionado para o ambiente seguro do Mercado Pago.
        Aceitamos cartão de crédito, débito, Pix e boleto.
      </p>
    </div>
  );
}
```

---

### 7.10 CRIAR: `app/checkout/sucesso/page.tsx`

```typescript
// Server Component — recebe query params do MP após pagamento aprovado
import Link from "next/link";
import { Check } from "lucide-react";

interface Props {
  searchParams: {
    collection_id?: string;         // payment_id
    collection_status?: string;     // approved
    payment_id?: string;
    status?: string;
    external_reference?: string;
    payment_type?: string;
    merchant_order_id?: string;
    preference_id?: string;
  };
}

export default function CheckoutSucessoPage({ searchParams }: Props) {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Pagamento Confirmado!
        </h1>
        <p className="text-gray-600 mb-2">
          Seu pagamento foi aprovado com sucesso.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Você receberá a confirmação da reserva em breve.
          {searchParams.payment_id && (
            <> ID do pagamento: <code className="font-mono">{searchParams.payment_id}</code></>
          )}
        </p>
        <div className="space-y-3">
          <Link
            href="/meus-alugueis"
            className="block w-full bg-[#00d084] text-white py-3 rounded-xl font-semibold hover:bg-[#00c070] transition-colors"
          >
            Ver Meus Aluguéis
          </Link>
          <Link
            href="/"
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </main>
  );
}
```

---

### 7.11 CRIAR: `app/checkout/falhou/page.tsx`

```typescript
import Link from "next/link";
import { X } from "lucide-react";

export default function CheckoutFalhouPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Pagamento Não Aprovado
        </h1>
        <p className="text-gray-600 mb-8">
          Não foi possível processar seu pagamento. Verifique os dados do cartão
          ou tente outro método de pagamento.
        </p>
        <div className="space-y-3">
          <Link
            href="/veiculos"
            className="block w-full bg-[#00d084] text-white py-3 rounded-xl font-semibold hover:bg-[#00c070] transition-colors"
          >
            Tentar Novamente
          </Link>
          <Link
            href="/"
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </main>
  );
}
```

---

### 7.12 CRIAR: `app/checkout/pendente/page.tsx`

```typescript
import Link from "next/link";
import { Clock } from "lucide-react";

export default function CheckoutPendentePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Pagamento em Análise
        </h1>
        <p className="text-gray-600 mb-2">
          Seu pagamento está sendo processado.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Isso pode acontecer com Pix ou boleto. Você receberá uma notificação
          assim que o pagamento for confirmado.
        </p>
        <div className="space-y-3">
          <Link
            href="/meus-alugueis"
            className="block w-full bg-[#00d084] text-white py-3 rounded-xl font-semibold hover:bg-[#00c070] transition-colors"
          >
            Ver Meus Aluguéis
          </Link>
          <Link
            href="/"
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </main>
  );
}
```

---

### 7.13 ATUALIZAR: `app/meus-alugueis/page.tsx`

A página atual usa dados mockados (`MOCK_RESERVAS`). Precisa ser conectada ao banco real.

**Mudanças necessárias:**
1. Converter para Server Component (remover `'use client'`)
2. Buscar reservas reais via `auth()` + `prisma.reserva.findMany()`
3. Incluir `transacoes` na query para exibir status de pagamento correto
4. Manter o mesmo design/UI, apenas substituir a fonte de dados

```typescript
// Remover: 'use client', import de MOCK_RESERVAS, VEICULOS
// Adicionar: auth, prisma, redirect

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
// ... manter todos os imports de ícones e Link/Image

export default async function MeusAlugueisPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const reservas = await prisma.reserva.findMany({
    where: { usuarioId: session.user.id },
    include: {
      veiculo: true,
      transacoes: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Adaptar a estrutura para o formato esperado pelo template existente
  const reservasFormatadas = reservas.map((r) => ({
    id: r.id,
    veiculo: {
      nome: `${r.veiculo.marca} ${r.veiculo.modelo}`,
      modelo: r.veiculo.categoria,
      imagem: r.veiculo.fotos[0] || "/placeholder.jpg",
      precoDiaria: Number(r.veiculo.precoDiaria),
    },
    dataInicio: r.dataInicio,
    dataFim: r.dataFim,
    dias: r.totalDias,
    precoDiaria: Number(r.valorDiaria),
    status: r.status.toLowerCase() as "confirmada" | "pendente" | "concluida" | "cancelada",
    localizacao: "A confirmar",
    temPagamentoPendente: r.transacoes.length === 0 || r.transacoes.every(t => t.status === "PENDENTE"),
  }));

  // Continuar com o template de UI existente usando reservasFormatadas
  // ...
}
```

**Adicionar no card de reserva com status "pendente":** botão "Concluir Pagamento" linkando para `/reserva/{id}`.

---

### 7.14 ATUALIZAR: `app/api/admin/dashboard/route.ts`

Verificar se há alguma referência a `stripePaymentIntentId` ou `stripeChargeId` nas queries. Se sim, atualizar para `mpPreferenceId` / `mpPaymentId`.

---

## 8. Estrutura de Arquivos Após a Migração

```
vroomgo/
├── lib/
│   ├── mercadopago.ts          ← NOVO (substitui stripe.ts)
│   ├── auth.ts                 ← sem mudanças
│   ├── prisma.ts               ← sem mudanças
│   └── utils.ts                ← sem mudanças
│
├── services/
│   └── PagamentoService.ts     ← REESCRITO
│
├── app/
│   ├── reserva/
│   │   └── [id]/
│   │       └── page.tsx        ← NOVO
│   ├── checkout/
│   │   ├── sucesso/
│   │   │   └── page.tsx        ← NOVO
│   │   ├── falhou/
│   │   │   └── page.tsx        ← NOVO
│   │   └── pendente/
│   │       └── page.tsx        ← NOVO
│   ├── meus-alugueis/
│   │   └── page.tsx            ← ATUALIZADO (dados reais)
│   └── api/
│       └── pagamentos/
│           ├── checkout/
│           │   └── route.ts    ← ATUALIZADO
│           ├── webhook/
│           │   └── route.ts    ← NOVO
│           └── [reservaId]/
│               ├── liberar-caucao/
│               │   └── route.ts ← NOVO
│               └── reter-caucao/
│                   └── route.ts ← NOVO
│
├── components/
│   └── BotaoPagarMP.tsx        ← NOVO
│
└── prisma/
    ├── schema.prisma           ← ATUALIZADO
    └── migrations/
        └── ..._migrar_stripe_para_mercadopago/ ← NOVA MIGRATION
```

---

## 9. Configuração do Webhook no Painel MP

Após deploy, configurar no [painel do Mercado Pago](https://www.mercadopago.com.br/developers/panel):

1. Acessar: Developers → Webhooks
2. URL: `https://seudominio.com/api/pagamentos/webhook`
3. Eventos a ativar: `payment` (pagamentos)
4. Copiar a `chave secreta` gerada e salvar em `MERCADO_PAGO_WEBHOOK_SECRET`

**Para desenvolvimento local:** usar [ngrok](https://ngrok.com/) ou [MP Test Mode](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/test-integration).

---

## 10. Mapeamento de Status: MP → VroomGo

| MP `status`   | MP `status_detail`         | `StatusPagamento` (banco) | `StatusReserva`  |
|---------------|----------------------------|---------------------------|------------------|
| `approved`    | `accredited`               | `PRE_AUTORIZADO`          | `CONFIRMADA`     |
| `pending`     | `pending_waiting_payment`  | `PENDENTE`                | `PENDENTE`       |
| `in_process`  | `pending_review_manual`    | `PENDENTE`                | `PENDENTE`       |
| `rejected`    | `cc_rejected_*`            | `FALHOU`                  | `CANCELADA`      |
| `cancelled`   | `by_collector`             | `FALHOU`                  | `CANCELADA`      |
| refund emitido| —                          | `ESTORNADO`               | `CONCLUIDA`      |

---

## 11. Ordem de Implementação Recomendada

Execute nesta ordem para evitar regressões:

```
1. npm install mercadopago
2. Criar lib/mercadopago.ts
3. Atualizar prisma/schema.prisma (remover campos Stripe, adicionar MP)
4. npx prisma migrate dev --name migrar_stripe_para_mercadopago
5. Reescrever services/PagamentoService.ts
6. Atualizar app/api/pagamentos/checkout/route.ts
7. Criar app/api/pagamentos/webhook/route.ts
8. Criar app/api/pagamentos/[reservaId]/liberar-caucao/route.ts
9. Criar app/api/pagamentos/[reservaId]/reter-caucao/route.ts
10. Criar app/reserva/[id]/page.tsx
11. Criar components/BotaoPagarMP.tsx
12. Criar app/checkout/sucesso/page.tsx
13. Criar app/checkout/falhou/page.tsx
14. Criar app/checkout/pendente/page.tsx
15. Atualizar app/meus-alugueis/page.tsx (dados reais)
16. Deletar lib/stripe.ts
17. Atualizar .env e .env.example
18. npm run build (verificar erros de tipo)
```

---

## 12. Checklist de Testes

### Fluxo Happy Path (sandbox)
- [ ] Criar reserva → redirecionar para `/reserva/{id}`
- [ ] Clicar "Pagar com Mercado Pago" → redirecionar para sandbox MP
- [ ] Pagar com cartão de teste MP → redirecionar para `/checkout/sucesso`
- [ ] Webhook recebido → Transacao status = `PRE_AUTORIZADO`, Reserva = `CONFIRMADA`
- [ ] Veiculo status = `ALUGADO`
- [ ] Página `/meus-alugueis` exibe reserva com status correto

### Fluxo Caução
- [ ] Admin acessa reserva CONFIRMADA
- [ ] Clicar "Liberar Caução" → reembolso emitido no MP → status `ESTORNADO`
- [ ] Clicar "Reter Caução" → sem ação no MP → status `PAGO`
- [ ] Veiculo status = `DISPONIVEL`

### Fluxo de Erro
- [ ] Cartão recusado → redirecionar para `/checkout/falhou`
- [ ] Reserva inválida → API retorna 400
- [ ] Usuário não autenticado → redirecionar para `/login`

### Cartões de Teste do Mercado Pago (sandbox)
| Situação     | Número              | CVV | Validade |
|--------------|---------------------|-----|----------|
| Aprovado     | 5031 4332 1540 6351 | 123 | 11/25    |
| Recusado     | 4000 0000 0000 0002 | 123 | 11/25    |
| Pendente     | 4235 6477 2802 5682 | 123 | 11/25    |

---

## 13. Notas Importantes para o Implementador

1. **`mpPayment.refund()`** — a API de reembolso do MP exige que o pagamento esteja com status `approved`. Validar antes de chamar.

2. **Idempotência** — Se o webhook for enviado mais de uma vez para o mesmo `payment_id`, o `prisma.transacao.update` deve verificar se o status já mudou para evitar operações duplicadas. Adicionar `if (transacao.status !== "PRE_AUTORIZADO")` antes de atualizar.

3. **`init_point` vs `sandbox_init_point`** — Em sandbox, o MP retorna `sandbox_init_point`. Em produção, usar `init_point`. O componente `BotaoPagarMP.tsx` já trata isso via `NODE_ENV`.

4. **Tipos TypeScript do SDK MP** — O SDK `mercadopago` v2 tem tipos bem definidos. Importar `PreferenceCreateData`, `PaymentResponse` conforme necessário para tipagem correta.

5. **`notification_url` no Preference** — Deve ser uma URL pública acessível pelo MP. Em desenvolvimento local, usar ngrok e atualizar `NEXT_PUBLIC_APP_URL`.

6. **Segurança do webhook** — A implementação atual valida o status buscando diretamente na API do MP (não apenas confiando no payload do webhook). Isso é a prática recomendada pelo MP para evitar fraudes.

7. **`auto_return: 'approved'`** — O MP só redireciona automaticamente quando o pagamento é aprovado. Para pendente/falhou o usuário precisa clicar em "Voltar" no site do MP.
