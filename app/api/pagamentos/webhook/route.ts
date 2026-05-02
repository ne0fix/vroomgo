import { NextRequest, NextResponse } from "next/server";
import { pagamentoService } from "@/services/PagamentoService";
import { mpPayment, getOrder } from "@/lib/mercadopago";

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

    if (bodyType && !["payment", "merchant_order", "order"].includes(bodyType)) {
      return NextResponse.json({ recebido: true });
    }

    // Orders API — ORD... IDs
    if (rawId.startsWith("ORD")) {
      const order = await getOrder(rawId);
      const reservaId = order?.external_reference;
      const payStatus = order?.transactions?.payments?.[0]?.status ?? order?.status;
      const paymentId = order?.transactions?.payments?.[0]?.id ?? rawId;

      if (reservaId && (payStatus === "processed" || payStatus === "approved")) {
        await pagamentoService.processarPagamentoAprovadoOrders(paymentId, reservaId);
      }
      return NextResponse.json({ recebido: true });
    }

    // Orders API — PAY... IDs: buscar transação no banco pelo mpPaymentId
    if (rawId.startsWith("PAY")) {
      await pagamentoService.processarPagamentoAprovadoOrders(rawId, rawId);
      return NextResponse.json({ recebido: true });
    }

    // API legada (/v1/payments) — IDs numéricos
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
