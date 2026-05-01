import Link from "next/link";
import Image from "next/image";
import { Users, Fuel, Settings } from "lucide-react";
import { formatarMoeda } from "@/lib/utils";
import { Veiculo } from "@prisma/client";

interface VeiculoCardProps {
  veiculo: Veiculo;
}

const CATEGORIA_LABEL: Record<string, string> = {
  HATCH: "Hatch",
  SEDA: "Sedan",
  SUV: "SUV",
  PICKUP: "Pickup",
  ELETRICO: "Elétrico",
  VAN: "Van",
};

const TRANSMISSAO_LABEL: Record<string, string> = {
  AUTOMATICO: "Auto",
  MANUAL: "Manual",
};

export function VeiculoCard({ veiculo }: VeiculoCardProps) {
  const imagemPrincipal =
    veiculo.fotos[0] ||
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Imagem */}
      <div className="relative h-36 md:h-48 overflow-hidden bg-gray-100">
        <Image
          src={imagemPrincipal}
          alt={`${veiculo.marca} ${veiculo.modelo}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-2 left-2 md:top-3 md:left-3">
          <span className="bg-[#00d084] text-white text-xs font-semibold px-2 py-0.5 md:px-2.5 md:py-1 rounded-full">
            {CATEGORIA_LABEL[veiculo.categoria] || veiculo.categoria}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-3 md:p-4">
        <div className="mb-2 md:mb-3">
          <h3 className="font-bold text-gray-900 text-sm md:text-lg leading-tight">
            {veiculo.marca} {veiculo.modelo}
          </h3>
          <p className="text-xs text-gray-500">{veiculo.ano} · {veiculo.cor}</p>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-1.5 md:gap-2 mb-3 md:mb-4">
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-1.5 md:p-2">
            <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
            <span className="text-xs text-gray-600">{veiculo.lugares} lug.</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-1.5 md:p-2">
            <Fuel className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
            <span className="text-xs text-gray-600 truncate w-full text-center">{veiculo.combustivel}</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-1.5 md:p-2">
            <Settings className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
            <span className="text-xs text-gray-600">
              {TRANSMISSAO_LABEL[veiculo.transmissao] || veiculo.transmissao}
            </span>
          </div>
        </div>

        {/* Preço + CTA */}
        <div className="flex items-center justify-between pt-2 md:pt-3 border-t border-gray-100">
          <div>
            <span className="text-lg md:text-2xl font-bold text-gray-900">
              {formatarMoeda(Number(veiculo.precoDiaria))}
            </span>
            <span className="text-xs text-gray-500">/dia</span>
          </div>
          <Link
            href={`/veiculos/${veiculo.id}`}
            className="bg-[#00d084] text-white px-3 py-2 md:px-4 md:py-2 rounded-xl font-semibold text-xs md:text-sm hover:bg-[#00c070] transition-colors"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}
