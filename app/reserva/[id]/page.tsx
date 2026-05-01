// Server Component
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BotaoPagarMP } from "@/components/BotaoPagarMP"; // client component
import { formatarMoeda } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReservaPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const reserva = await prisma.reserva.findUnique({
    where: { id },
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
          <BotaoPagarMP reservaId={id} valorTotal={valorTotal} />
        )}
      </div>
    </main>
  );
}
