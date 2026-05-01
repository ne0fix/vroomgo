import { prisma } from "@/lib/prisma";
import { CriarReservaDTO } from "@/models/dtos/ReservaDTO";
import { differenceInDays } from "date-fns";

export class ReservaService {

  async criarReserva(usuarioId: string, data: CriarReservaDTO) {
    const dataInicio = new Date(data.dataInicio);
    const dataFim = new Date(data.dataFim);

    // Buscar veículo
    const veiculo = await prisma.veiculo.findUnique({
      where: { id: data.veiculoId },
    });
    if (!veiculo) throw new Error("Veículo não encontrado");
    if (veiculo.status === "MANUTENCAO") throw new Error("Veículo em manutenção");

    // Verificar disponibilidade no período solicitado
    // Conflito: reserva existente começa antes do fim solicitado E termina depois do início solicitado
    const conflito = await prisma.reserva.findFirst({
      where: {
        veiculoId: data.veiculoId,
        status: { in: ["CONFIRMADA", "ATIVA"] },
        dataInicio: { lt: dataFim },
        dataFim: { gt: dataInicio },
      },
    });
    if (conflito) throw new Error("Veículo indisponível para o período selecionado");

    const totalDias = differenceInDays(dataFim, dataInicio);
    if (totalDias < 1) throw new Error("Período mínimo é de 1 dia");

    const valorOpcionais = (data.opcionais || []).reduce((acc, op) => acc + op.valor, 0);
    const valorDiaria = Number(veiculo.precoDiaria);
    const valorTotal = (valorDiaria + valorOpcionais) * totalDias;
    const valorCaucao = Number(veiculo.caucaoValor);

    const reserva = await prisma.reserva.create({
      data: {
        usuarioId,
        veiculoId: data.veiculoId,
        dataInicio,
        dataFim,
        totalDias,
        valorDiaria,
        valorTotal,
        valorCaucao,
        opcionais: data.opcionais || [],
        status: "PENDENTE",
        observacoes: data.observacoes,
      },
      include: { veiculo: true },
    });

    return reserva;
  }

  async obterReserva(reservaId: string) {
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
      include: { veiculo: true, usuario: true },
    });
    if (!reserva) throw new Error("Reserva não encontrada");
    return reserva;
  }

  async buscarReservasUsuario(usuarioId: string) {
    return prisma.reserva.findMany({
      where: { usuarioId },
      include: { veiculo: true, transacoes: true },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const reservaService = new ReservaService();
