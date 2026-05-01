import Link from "next/link";
import Image from "next/image";
import { Search, Heart, Zap, Clock, Star, Users, Fuel, Cog } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatarMoeda } from "@/lib/utils";

const TRANSMISSAO_LABEL: Record<string, string> = {
  AUTOMATICO: "Automático",
  MANUAL: "Manual",
};

export default async function HomePage() {
  const veiculosDestaque = await prisma.veiculo.findMany({
    where: { status: "DISPONIVEL" },
    orderBy: { precoDiaria: "asc" },
    take: 6,
  });

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 py-10 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-3 md:mb-4">
              Alugue seu carro ideal
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Encontre o carro perfeito para sua próxima jornada. Frota moderna, preços transparentes e sem taxas ocultas.
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-gray-50 rounded-2xl p-4 md:p-8 max-w-3xl mx-auto mb-8 md:mb-10">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Buscar marca ou modelo..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#00d084] focus:border-transparent"
              />
              <Link
                href="/veiculos"
                className="flex items-center justify-center gap-2 bg-[#00d084] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#00c070] transition-colors whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                Buscar
              </Link>
            </div>
          </div>

          {/* Category quick links */}
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "Hatch", value: "HATCH" },
              { label: "Sedan", value: "SEDA" },
              { label: "SUV", value: "SUV" },
              { label: "Pickup", value: "PICKUP" },
              { label: "Elétrico", value: "ELETRICO" },
              { label: "Van", value: "VAN" },
            ].map((cat) => (
              <Link
                key={cat.value}
                href={`/veiculos?categoria=${cat.value}`}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:border-[#00d084] hover:text-[#00d084] transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Veículos em Destaque */}
      <section className="bg-gray-50 py-10 md:py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4">Veículos em Destaque</h2>
            <p className="text-gray-600 text-sm md:text-lg">
              Os melhores carros da nossa frota
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {veiculosDestaque.map((veiculo) => (
              <Link
                key={veiculo.id}
                href={`/veiculos/${veiculo.id}`}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Imagem */}
                <div className="relative w-full h-36 md:h-44 bg-gray-200 overflow-hidden">
                  <Image
                    src={veiculo.fotos[0] || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400"}
                    alt={`${veiculo.marca} ${veiculo.modelo}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 right-3 bg-[#00d084] text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                    {veiculo.categoria}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4 md:p-6">
                  <div className="mb-3">
                    <h3 className="text-base md:text-xl font-bold text-black mb-1">{veiculo.marca} {veiculo.modelo}</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 md:w-4 md:h-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">4.5 (42)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Users className="w-3 h-3 text-[#00d084]" />
                      <span>{veiculo.lugares}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Fuel className="w-3 h-3 text-[#00d084]" />
                      <span className="truncate">{veiculo.combustivel}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Cog className="w-3 h-3 text-[#00d084]" />
                      <span>{TRANSMISSAO_LABEL[veiculo.transmissao] || veiculo.transmissao}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl md:text-2xl font-bold text-[#00d084]">
                        {formatarMoeda(Number(veiculo.precoDiaria))}
                      </p>
                      <p className="text-gray-500 text-xs">por dia</p>
                    </div>
                    <span className="bg-[#00d084] text-white px-3 py-2 rounded-lg font-semibold text-sm hover:bg-[#00c070] transition-colors">
                      Ver detalhes
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/veiculos" className="inline-block border-2 border-[#00d084] text-[#00d084] px-8 py-3 rounded-xl font-semibold hover:bg-[#00d084] hover:text-white transition-colors">
              Ver toda a frota
            </Link>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="bg-white py-10 md:py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4">Por que escolher VroomGo?</h2>
            <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
              Somos a melhor escolha para aluguel de veículos com qualidade e preço justo
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
            {[
              { icon: <Zap className="w-7 h-7 md:w-8 md:h-8 text-[#00d084]" />, titulo: "Melhor Preço", desc: "Preços transparentes sem taxas ocultas" },
              { icon: <Heart className="w-7 h-7 md:w-8 md:h-8 text-[#00d084]" />, titulo: "Frota Moderna", desc: "Veículos novos, revisados e bem mantidos" },
              { icon: <Clock className="w-7 h-7 md:w-8 md:h-8 text-[#00d084]" />, titulo: "Rápido e Fácil", desc: "Reserve em poucos cliques e retire em minutos" },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-5 md:p-8 text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-3 md:mb-4">{item.icon}</div>
                <h3 className="font-bold text-base md:text-xl text-black mb-2">{item.titulo}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-gray-50 py-10 md:py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-black mb-2 md:mb-4">Como funciona</h2>
            <p className="text-gray-600 text-sm md:text-base">Três passos simples para alugar seu carro</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {[
              { numero: "1", titulo: "Escolha", desc: "Selecione o carro que melhor se adequa às suas necessidades" },
              { numero: "2", titulo: "Reserve", desc: "Confirme as datas e proceda com o pagamento seguro" },
              { numero: "3", titulo: "Dirija", desc: "Retire seu carro e aproveite sua jornada" },
            ].map((step, i) => (
              <div key={i} className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-0 sm:text-center">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#00d084] text-white flex items-center justify-center flex-shrink-0 sm:mx-auto sm:mb-4 text-xl md:text-2xl font-bold">
                  {step.numero}
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-xl text-black mb-1 md:mb-2">{step.titulo}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#00d084] py-10 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-6">Pronto para começar?</h2>
          <p className="text-white text-sm md:text-lg mb-6 md:mb-8 opacity-90 max-w-2xl mx-auto">
            Junte-se a milhares de clientes satisfeitos e reserve seu carro agora
          </p>
          <Link
            href="/veiculos"
            className="inline-block bg-white text-[#00d084] px-8 md:px-10 py-3 md:py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors text-base md:text-lg"
          >
            Explorar Veículos
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gray-900 py-10 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 md:mb-4">Receba Ofertas Exclusivas</h3>
            <p className="text-gray-400 text-sm mb-4 md:mb-6">Inscreva-se e ganhe 10% de desconto na primeira reserva</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Seu email"
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00d084]"
              />
              <button className="bg-[#00d084] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#00c070] transition-colors">
                Inscrever
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
