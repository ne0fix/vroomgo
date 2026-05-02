import { NextRequest, NextResponse } from "next/server";
import { pagamentoService } from "@/services/PagamentoService";
import { mpPayment, getOrder, getOrderByPaymentId } from "@/lib/mercadopago";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic") || searchParams.get("type");
    const idParam = searchParams.get("id") || searchParams.get("data.id");

    const body = await request.json().catch(() => ({}));
    const bodyId = body?.data?.id ? String(body.data.id) : null;
    const bodyType = body?.type ?? topic;

    const rawId = idParam || bodyId;

    if (!rawId) return NextResponse.json({ recebido: true });

    // Ignorar tópicos não relacionados a pagamentos
    if (bodyType && !["payment", "merchant_order", "order"].includes(bodyType)) {
      return NextResponse.json({ recebido: true });
    }

    // Novo formato Orders API: IDs começam com PAY ou ORD
    const isOrdersApi = rawId.startsWith("PAY") || rawId.startsWith("ORD");

    if (isOrdersApi) {
      let reservaId: string | null = null;
      let paymentStatus: string | null = null;

      if (rawId.startsWith("ORD")) {
        const order = await getOrder(rawId);
        reservaId = order?.external_reference ?? null;
        paymentStatus = order?.transactions?.payments?.[0]?.status ?? order?.status;
      } else {
        // PAY... → buscar order associada
        const order = await getOrderByPaymentId(rawId);
        reservaId = order?.external_reference ?? null;
        paymentStatus = order?.transactions?.payments?.[0]?.status ?? order?.status;
      }

      if (!reservaId) return NextResponse.json({ recebido: true });

      if (paymentStatus === "processed" || paymentStatus === "approved") {
        await pagamentoService.processarPagamentoAprovadoOrders(rawId, reservaId);
      }

      return NextResponse.json({ recebido: true });
    }

    // Formato antigo: IDs numéricos (/v1/payments)
    if (bodyType === "merchant_order") return NextResponse.json({ recebido: true });

    const pagamento = await mpPayment.get({ id: Number(rawId) });

    if (pagamento.status === "approved") {
      await pagamentoService.processarPagamentoAprovado(rawId);
    }

    return NextResponse.json({ recebido: true });
  } catch (error: any) {
    console.error("Erro no webhook MP:", error.message);
    return NextResponse.json({ recebido: true, erro: error.message });
  }
}
