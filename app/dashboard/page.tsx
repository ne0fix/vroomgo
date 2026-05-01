import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { reservaRepository } from "@/repositories/ReservaRepository";
import { veiculoRepository } from "@/repositories/VeiculoRepository";
import { KPICard } from "@/components/KPICard";
import { GraficoReceita } from "@/components/GraficoReceita";
import { formatarMoeda } from "@/lib/utils";
import { Car, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/api/auth/signin");

  const [kpis, estatisticasFrota, receitaMensal] = await Promise.all([
    reservaRepository.getKPIs(),
    veiculoRepository.getEstatisticas(),
    reservaRepository.getReceitaMensal(new Date().getFullYear()),
  ]);

  const taxaOcupacao = estatisticasFrota.total > 0
    ? Math.round((estatisticasFrota.alugados / estatisticasFrota.total) * 100)
    : 0;

  return (
    <main className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          titulo="Taxa de Ocupação"
          valor={`${taxaOcupacao}%`}
          icone={<Car className="w-5 h-5" />}
          cor="blue"
          subtitulo={`${estatisticasFrota.alugados}/${estatisticasFrota.total} veículos`}
        />
        <KPICard
          titulo="MRR"
          valor={formatarMoeda(kpis.mrr)}
          icone={<DollarSign className="w-5 h-5" />}
          cor="green"
          subtitulo="Faturamento do mês"
        />
        <KPICard
          titulo="Ticket Médio"
          valor={formatarMoeda(kpis.ticketMedio)}
          icone={<TrendingUp className="w-5 h-5" />}
          cor="purple"
          subtitulo={`${kpis.totalReservasMes} reservas no mês`}
        />
        <KPICard
          titulo="Em Manutenção"
          valor={String(estatisticasFrota.manutencao)}
          icone={<AlertTriangle className="w-5 h-5" />}
          cor="yellow"
          subtitulo="Veículos fora de operação"
          alerta={estatisticasFrota.manutencao > 0}
        />
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Receita Mensal {new Date().getFullYear()}</h2>
        <GraficoReceita dados={receitaMensal} />
      </div>
    </main>
  );
}

export const revalidate = 300;
