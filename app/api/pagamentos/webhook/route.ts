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
