import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FormularioReserva } from "@/components/FormularioReserva";
import { formatarMoeda } from "@/lib/utils";
import { Users, Fuel, Settings, MapPin, Shield, Calendar, Gauge } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

const CATEGORIA_LABEL: Record<string, string> = {
  HATCH: "Hatch",
  SEDA: "Sedan",
  SUV: "SUV",
  PICKUP: "Pickup",
  ELETRICO: "Elétrico",
  VAN: "Van",
};

export default async function VeiculoDetalhePage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const veiculo = await prisma.veiculo.findUnique({ where: { id } });
  if (!veiculo) notFound();

  const imagemPrincipal =
    veiculo.fotos[0] ||
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800";
  const imagensGaleria = veiculo.fotos.slice(1, 4);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-[#00d084] transition-colors flex-shrink-0">Início</Link>
            <span>›</span>
            <Link href="/veiculos" className="hover:text-[#00d084] transition-colors flex-shrink-0">Veículos</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium truncate">{veiculo.marca} {veiculo.modelo}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* COLUNA PRINCIPAL */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">

            {/* Cabeçalho */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-[#00d084] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {CATEGORIA_LABEL[veiculo.categoria] || veiculo.categoria}
                </span>
                {veiculo.status === "DISPONIVEL" && (
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    Disponível
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                {veiculo.marca} {veiculo.modelo}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {veiculo.ano} · {veiculo.cor} · {veiculo.quilometragem.toLocaleString("pt-BR")} km
              </p>
            </div>

            {/* Imagem Principal */}
            <div className="relative h-52 sm:h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden bg-gray-50">
              <Image
                src={imagemPrincipal}
                alt={`${veiculo.marca} ${veiculo.modelo}`}
                fill
                className="object-contain p-4"
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>

            {/* Galeria */}
            {imagensGaleria.length > 0 && (
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                {imagensGaleria.map((foto, i) => (
                  <div key={i} className="relative h-20 md:h-24 rounded-xl overflow-hidden bg-gray-50">
                    <Image src={foto} alt={`Foto ${i + 2}`} fill className="object-contain p-2" sizes="200px" />
                  </div>
                ))}
              </div>
            )}

            {/* Formulário no mobile — aparece aqui antes das specs */}
            <div className="lg:hidden">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="mb-5 pb-4 border-b">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatarMoeda(Number(veiculo.precoDiaria))}
                    </span>
                    <span className="text-gray-500 text-sm">/dia</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    + caução de {formatarMoeda(Number(veiculo.caucaoValor))} (reembolsável)
                  </p>
                </div>
                {session?.user ? (
                  <FormularioReserva
                    veiculoId={veiculo.id}
                    precoDiaria={Number(veiculo.precoDiaria)}
                    caucaoValor={Number(veiculo.caucaoValor)}
                  />
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 text-center">
                      Faça login para reservar este veículo
                    </p>
                    <Link
                      href={`/login?callbackUrl=/veiculos/${veiculo.id}`}
                      className="block w-full text-center bg-[#00d084] text-white py-3.5 rounded-xl font-semibold hover:bg-[#00c070] transition-colors"
                    >
                      Entrar para Reservar
                    </Link>
                    <Link
                      href={`/cadastro?callbackUrl=/veiculos/${veiculo.id}`}
                      className="block w-full text-center border border-gray-300 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Criar conta grátis
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Especificações */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <h2 className="text-base md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Especificações</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Users, label: "Lugares", value: String(veiculo.lugares) },
                  { icon: Fuel, label: "Combustível", value: veiculo.combustivel },
                  { icon: Settings, label: "Câmbio", value: veiculo.transmissao },
                  { icon: Gauge, label: "KM", value: veiculo.quilometragem.toLocaleString("pt-BR") },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-[#00d084]" />
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs md:text-sm font-semibold text-gray-900 text-center">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Opcionais do veículo */}
            {veiculo.opcionais && veiculo.opcionais.length > 0 && (
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                <h2 className="text-base md:text-xl font-bold text-gray-900 mb-3">Opcionais inclusos</h2>
                <div className="flex flex-wrap gap-2">
                  {veiculo.opcionais.map((op) => (
                    <span key={op} className="bg-green-50 text-green-700 border border-green-200 text-xs md:text-sm px-3 py-1 rounded-full">
                      {op}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Descrição */}
            {veiculo.descricao && (
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                <h2 className="text-base md:text-xl font-bold text-gray-900 mb-2 md:mb-3">Sobre o veículo</h2>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">{veiculo.descricao}</p>
              </div>
            )}

            {/* Políticas */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
              <h2 className="text-base md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Políticas</h2>
              <div className="space-y-3 text-sm text-gray-600">
                {[
                  {
                    icon: Shield,
                    titulo: "Caução reembolsável",
                    desc: `A caução de ${formatarMoeda(Number(veiculo.caucaoValor))} é devolvida após entrega do veículo em boas condições.`,
                  },
                  { icon: Calendar, titulo: "Período mínimo", desc: "Locação mínima de 1 dia." },
                  { icon: MapPin, titulo: "Retirada e devolução", desc: "Local confirmado após o pagamento." },
                ].map(({ icon: Icon, titulo, desc }) => (
                  <div key={titulo} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 md:w-5 md:h-5 text-[#00d084] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{titulo}</p>
                      <p className="text-xs md:text-sm">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR DESKTOP — hidden no mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <div className="mb-6 pb-4 border-b">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatarMoeda(Number(veiculo.precoDiaria))}
                    </span>
                    <span className="text-gray-500 text-sm">/dia</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    + caução reembolsável de {formatarMoeda(Number(veiculo.caucaoValor))}
                  </p>
                </div>

                {session?.user ? (
                  <FormularioReserva
                    veiculoId={veiculo.id}
                    precoDiaria={Number(veiculo.precoDiaria)}
                    caucaoValor={Number(veiculo.caucaoValor)}
                  />
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 text-center">
                      Faça login para reservar este veículo
                    </p>
                    <Link
                      href={`/login?callbackUrl=/veiculos/${veiculo.id}`}
                      className="block w-full text-center bg-[#00d084] text-white py-3 rounded-xl font-semibold hover:bg-[#00c070] transition-colors"
                    >
                      Entrar para Reservar
                    </Link>
                    <Link
                      href={`/cadastro?callbackUrl=/veiculos/${veiculo.id}`}
                      className="block w-full text-center border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Criar conta grátis
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-4 bg-gray-100 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Placa</p>
                <p className="font-bold text-gray-900 font-mono tracking-widest">{veiculo.placa}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
