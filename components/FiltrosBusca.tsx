"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";

const CATEGORIAS = [
  { label: "Todos", value: "" },
  { label: "Hatch", value: "HATCH" },
  { label: "Sedan", value: "SEDA" },
  { label: "SUV", value: "SUV" },
  { label: "Pickup", value: "PICKUP" },
  { label: "Elétrico", value: "ELETRICO" },
  { label: "Van", value: "VAN" },
];

interface FiltrosBuscaProps {
  categoriaAtiva?: string;
  precoMinAtivo?: number;
  precoMaxAtivo?: number;
  buscaAtiva?: string;
}

export function FiltrosBusca({
  categoriaAtiva = "",
  precoMinAtivo = 0,
  precoMaxAtivo = 400,
  buscaAtiva = "",
}: FiltrosBuscaProps) {
  const router = useRouter();
  const [busca, setBusca] = useState(buscaAtiva);
  const [precoMax, setPrecoMax] = useState(precoMaxAtivo);
  const [categoriaLocal, setCategoriaLocal] = useState(categoriaAtiva);
  const [aberto, setAberto] = useState(false);

  const aplicarFiltros = (overrides?: Partial<{ categoria: string; busca: string; precoMax: number }>) => {
    const categoria = overrides?.categoria !== undefined ? overrides.categoria : categoriaLocal;
    const buscaVal = overrides?.busca !== undefined ? overrides.busca : busca;
    const precoMaxVal = overrides?.precoMax !== undefined ? overrides.precoMax : precoMax;

    const params = new URLSearchParams();
    if (categoria) params.set("categoria", categoria);
    if (buscaVal) params.set("busca", buscaVal);
    if (precoMaxVal < 400) params.set("precoMax", String(precoMaxVal));
    params.set("pagina", "1");

    router.push(`/veiculos?${params.toString()}`);
  };

  const limparFiltros = () => {
    setBusca("");
    setPrecoMax(400);
    setCategoriaLocal("");
    router.push("/veiculos");
  };

  const temFiltros =
    (categoriaAtiva && categoriaAtiva !== "") ||
    (buscaAtiva && buscaAtiva !== "") ||
    precoMaxAtivo < 400;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      {/* Header — sempre visível, toggle no mobile */}
      <button
        className="w-full flex items-center justify-between p-4 md:p-5 lg:cursor-default"
        onClick={() => setAberto(!aberto)}
      >
        <span className="font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
          Filtros
          {temFiltros && (
            <span className="bg-[#00d084] text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
              !
            </span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {temFiltros && (
            <button
              onClick={(e) => { e.stopPropagation(); limparFiltros(); }}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 mr-1"
            >
              <X className="w-3 h-3" />
              Limpar
            </button>
          )}
          <span className="lg:hidden text-gray-500">
            {aberto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </button>

      {/* Conteúdo: visível sempre no desktop, toggle no mobile */}
      <div className={`px-4 pb-4 md:px-5 md:pb-5 space-y-5 ${aberto ? "block" : "hidden"} lg:block`}>

        {/* Busca */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Marca ou modelo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && aplicarFiltros({ busca })}
              className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00d084] focus:border-transparent"
            />
          </div>
        </div>

        {/* Categorias */}
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Categoria</label>
          <div className="grid grid-cols-3 md:grid-cols-2 gap-2">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setCategoriaLocal(cat.value);
                  aplicarFiltros({ categoria: cat.value });
                }}
                className={`py-2 px-2 rounded-xl text-xs md:text-sm font-medium border transition-all ${
                  categoriaLocal === cat.value
                    ? "bg-[#00d084] text-white border-[#00d084]"
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#00d084] hover:text-[#00d084]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preço máximo */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700">Preço máx. / dia</label>
            <span className="text-sm font-bold text-[#00d084]">
              R$ {precoMax === 400 ? "400+" : precoMax}
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={400}
            step={10}
            value={precoMax}
            onChange={(e) => setPrecoMax(Number(e.target.value))}
            onMouseUp={() => aplicarFiltros({ precoMax })}
            onTouchEnd={() => aplicarFiltros({ precoMax })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00d084]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>R$ 50</span>
            <span>R$ 400+</span>
          </div>
        </div>

        <button
          onClick={() => { aplicarFiltros(); setAberto(false); }}
          className="w-full bg-[#00d084] text-white py-3 rounded-xl font-semibold hover:bg-[#00c070] transition-colors text-sm"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
}
