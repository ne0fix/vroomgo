import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { reservaRepository } from "@/repositories/ReservaRepository";
import { veiculoRepository } from "@/repositories/VeiculoRepository";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
    }

    const [kpis, estatisticasFrota, receitaMensal] = await Promise.all([
      reservaRepository.getKPIs(),
      veiculoRepository.getEstatisticas(),
      reservaRepository.getReceitaMensal(new Date().getFullYear()),
    ]);

    const taxaOcupacao = estatisticasFrota.total > 0
      ? Math.round((estatisticasFrota.alugados / estatisticasFrota.total) * 100)
      : 0;

    return NextResponse.json({
      taxaOcupacao,
      mrr: kpis.mrr,
      ticketMedio: kpis.ticketMedio,
      veiculosEmManutencao: estatisticasFrota.manutencao,
      totalReservasMes: kpis.totalReservasMes,
      receitaMensal,
      estatisticasFrota,
    });
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
}
