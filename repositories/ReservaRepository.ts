import { prisma } from "@/lib/prisma";
import { CriarReservaDTO } from "@/models/dtos/ReservaDTO";

export class ReservaRepository {
  async create(data: CriarReservaDTO & {
    usuarioId: string;
    totalDias: number;
    valorDiaria: number;
    valorTotal: number;
    valorCaucao: number;
  }) {
    return prisma.reserva.create({
      data: {
        usuarioId: data.usuarioId,
        veiculoId: data.veiculoId,
        dataInicio: new Date(data.dataInicio),
        dataFim: new Date(data.dataFim),
        totalDias: data.totalDias,
        valorDiaria: data.valorDiaria,
        valorTotal: data.valorTotal,
        valorCaucao: data.valorCaucao,
        opcionais: data.opcionais as object, // Assuming Prisma Json
        observacoes: data.observacoes,
      },
      include: { veiculo: true, usuario: true },
    });
  }

  async findByUsuario(usuarioId: string) {
    return prisma.reserva.findMany({
      where: { usuarioId },
      include: { veiculo: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.reserva.findUnique({
      where: { id },
      include: { veiculo: true, usuario: true, transacoes: true },
    });
  }

  async findAll(pagina = 1, porPagina = 20) {
    const [reservas, total] = await Promise.all([
      prisma.reserva.findMany({
        skip: (pagina - 1) * porPagina,
        take: porPagina,
        include: { veiculo: true, usuario: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.reserva.count(),
    ]);
    return { reservas, total };
  }

  async updateStatus(id: string, status: string) {
    return prisma.reserva.update({ where: { id }, data: { status: status as any } });
  }

  async getKPIs() {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const [mrr, ticketMedio, totalReservasMes] = await Promise.all([
      prisma.transacao.aggregate({
        where: {
          status: "PAGO",
          tipo: "ALUGUEL",
          createdAt: { gte: inicioMes, lte: fimMes },
        },
        _sum: { valor: true },
      }),
      prisma.reserva.aggregate({
        where: {
          status: { in: ["CONFIRMADA", "ATIVA", "CONCLUIDA"] },
          createdAt: { gte: inicioMes, lte: fimMes },
        },
        _avg: { valorTotal: true },
      }),
      prisma.reserva.count({
        where: { createdAt: { gte: inicioMes, lte: fimMes } },
      }),
    ]);

    return {
      mrr: Number(mrr._sum.valor ?? 0),
      ticketMedio: Number(ticketMedio._avg.valorTotal ?? 0),
      totalReservasMes,
    };
  }

  async getReceitaMensal(ano: number) {
    const meses = Array.from({ length: 12 }, (_, i) => i);
    const dados = await Promise.all(
      meses.map(async (mes) => {
        const inicio = new Date(ano, mes, 1);
        const fim = new Date(ano, mes + 1, 0);
        const resultado = await prisma.transacao.aggregate({
          where: {
            status: "PAGO",
            tipo: "ALUGUEL",
            createdAt: { gte: inicio, lte: fim },
          },
          _sum: { valor: true },
        });
        return {
          mes: inicio.toLocaleString("pt-BR", { month: "short" }),
          receita: Number(resultado._sum.valor ?? 0),
        };
      })
    );
    return dados;
  }
}

export const reservaRepository = new ReservaRepository();
