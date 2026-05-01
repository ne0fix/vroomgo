import { mpPreference, mpPayment, mpRefund } from "@/lib/mercadopago";
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

    // Idempotência: ignorar se já foi processado
    if (transacao.status === "PRE_AUTORIZADO" || transacao.status === "PAGO") {
      return { sucesso: true };
    }

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
    await mpRefund.create({
      payment_id: Number(transacao.mpPaymentId),
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
