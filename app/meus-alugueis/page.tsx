import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Check, Clock, Download, Phone, FileText, CreditCard } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";

export default async function MeusAlugueisPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const reservas = await prisma.reserva.findMany({
    where: { usuarioId: session.user.id },
    include: { veiculo: true, transacoes: true },
    orderBy: { createdAt: "desc" },
  });

  const reservasFormatadas = reservas.map((r: (typeof reservas)[number]) => ({
    id: r.id,
    veiculo: {
      nome: `${r.veiculo.marca} ${r.veiculo.modelo}`,
      modelo: r.veiculo.categoria,
      imagem: r.veiculo.fotos[0] || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400",
      precoDiaria: Number(r.veiculo.precoDiaria),
    },
    dataInicio: r.dataInicio,
    dataFim: r.dataFim,
    dias: r.totalDias,
    precoDiaria: Number(r.valorDiaria),
    valorTotal: Number(r.valorTotal) + Number(r.valorCaucao),
    status: r.status.toLowerCase() as "confirmada" | "pendente" | "concluida" | "cancelada",
    temPagamentoPendente:
      r.transacoes.length === 0 || r.transacoes.every((t) => t.status === "PENDENTE"),
  }));

  const ativas = reservasFormatadas.filter((r) => ["confirmada", "pendente"].includes(r.status));
  const historico = reservasFormatadas.filter((r) => ["concluida", "cancelada"].includes(r.status));

  const STATUS_CONFIG = {
    confirmada: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", dot: "bg-green-500", label: "Confirmada" },
    pendente: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", dot: "bg-yellow-500", label: "Pendente" },
    cancelada: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500", label: "Cancelada" },
    concluida: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", dot: "bg-gray-400", label: "Concluída" },
  };

  const renderCard = (reserva: (typeof reservasFormatadas)[0]) => {
    const cfg = STATUS_CONFIG[reserva.status] || STATUS_CONFIG.concluida;

    return (
      <div key={reserva.id} className={`${cfg.bg} ${cfg.border} border-2 rounded-2xl overflow-hidden`}>

        {/* Mobile: layout vertical */}
        <div className="flex flex-col md:grid md:grid-cols-4 gap-0">

          {/* Imagem */}
          <div className="relative h-40 md:h-auto md:min-h-[180px] bg-white border-b md:border-b-0 md:border-r border-inherit">
            <Image
              src={reserva.veiculo.imagem}
              alt={reserva.veiculo.nome}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </div>

          {/* Detalhes */}
          <div className="md:col-span-2 p-4 md:p-5 space-y-3">
            {/* ID + Status badge (mobile) */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Reserva</p>
                <p className="font-mono text-xs text-gray-700 truncate max-w-[160px]">{reserva.id}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${cfg.bg} border ${cfg.border} flex-shrink-0`}>
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
              </div>
            </div>

            {/* Veículo */}
            <div>
              <h3 className="font-bold text-gray-900 text-base md:text-lg">{reserva.veiculo.nome}</h3>
              <p className="text-xs text-gray-500">{reserva.veiculo.modelo}</p>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Retirada
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(reserva.dataInicio).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Devolução
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(reserva.dataFim).toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>

            {/* Duração */}
            <p className="text-xs text-gray-500">
              {reserva.dias} dia{reserva.dias > 1 ? "s" : ""} ·{" "}
              {formatarMoeda(reserva.precoDiaria)}/dia
            </p>
          </div>

          {/* Preço + Ações */}
          <div className="p-4 md:p-5 border-t md:border-t-0 md:border-l border-inherit flex flex-row md:flex-col items-center md:items-stretch justify-between md:justify-start gap-3 md:gap-4">
            {/* Valor */}
            <div className="md:bg-white md:rounded-xl md:p-4 md:border md:border-gray-200">
              <p className="text-xs text-gray-500 mb-0.5">Total pago</p>
              <p className="text-xl md:text-2xl font-bold text-[#00d084]">
                {formatarMoeda(reserva.valorTotal)}
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-row md:flex-col gap-2 flex-wrap justify-end md:justify-start">
              {reserva.temPagamentoPendente && reserva.status === "pendente" && (
                <Link
                  href={`/reserva/${reserva.id}`}
                  className="flex items-center gap-1.5 bg-[#009ee3] text-white px-3 py-2.5 md:py-3 rounded-xl font-semibold text-xs md:text-sm hover:bg-[#0088cc] transition-colors"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Pagar
                </Link>
              )}
              {reserva.status === "confirmada" && (
                <>
                  <button className="flex items-center gap-1.5 bg-white text-[#00d084] border-2 border-[#00d084] px-3 py-2.5 md:py-3 rounded-xl font-semibold text-xs md:text-sm hover:bg-[#00d08410] transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    Voucher
                  </button>
                  <button className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-2.5 md:py-3 rounded-xl font-semibold text-xs md:text-sm hover:bg-red-100 transition-colors">
                    Cancelar
                  </button>
                </>
              )}
              {reserva.status === "concluida" && (
                <button className="flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-3 py-2.5 md:py-3 rounded-xl font-semibold text-xs md:text-sm hover:bg-blue-100 transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                  Recibo
                </button>
              )}
              <button className="flex items-center gap-1.5 border border-gray-300 text-gray-700 px-3 py-2.5 md:py-3 rounded-xl font-semibold text-xs md:text-sm hover:bg-gray-50 transition-colors">
                <Phone className="w-3.5 h-3.5" />
                Suporte
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-6 md:py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#00d084] hover:text-white transition-colors font-medium mb-4 group text-sm"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">Minhas Reservas</h1>
          <p className="text-gray-300 text-sm md:text-base">
            Acompanhe e gerencie seus aluguéis
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-6xl">

        {/* Reservas ativas */}
        {ativas.length > 0 && (
          <section className="mb-8 md:mb-12">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-1 h-6 md:h-8 bg-[#00d084] rounded" />
              <h2 className="text-lg md:text-2xl font-bold text-gray-900">Reservas Ativas</h2>
            </div>
            <div className="space-y-4">{ativas.map(renderCard)}</div>
          </section>
        )}

        {/* Histórico */}
        {historico.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-1 h-6 md:h-8 bg-gray-400 rounded" />
              <h2 className="text-lg md:text-2xl font-bold text-gray-900">Histórico</h2>
            </div>
            <div className="space-y-4">{historico.map(renderCard)}</div>
          </section>
        )}

        {/* Empty */}
        {reservasFormatadas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Nenhuma reserva</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">
              Você ainda não tem reservas. Explore nossa frota e reserve agora!
            </p>
            <Link
              href="/veiculos"
              className="bg-[#00d084] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#00c070] transition-colors"
            >
              Ver Veículos
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
