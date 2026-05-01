import { prisma } from "@/lib/prisma";
import { VeiculoCard } from "@/components/VeiculoCard";
import { FiltrosBusca } from "@/components/FiltrosBusca";
import { CategoriaVeiculo } from "@prisma/client";

interface SearchParams {
  categoria?: string;
  precoMin?: string;
  precoMax?: string;
  busca?: string;
  pagina?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

const POR_PAGINA = 9;

export default async function VeiculosPage({ searchParams }: Props) {
  const params = await searchParams;

  const pagina = Math.max(1, Number(params.pagina) || 1);
  const precoMin = Number(params.precoMin) || 0;
  const precoMax = Number(params.precoMax) || 99999;

  // Validar categoria para garantir que é um enum válido
  const categoriaValida = params.categoria &&
    Object.values(CategoriaVeiculo).includes(params.categoria as CategoriaVeiculo)
    ? (params.categoria as CategoriaVeiculo)
    : undefined;

  const where = {
    status: "DISPONIVEL" as const,
    ...(categoriaValida ? { categoria: categoriaValida } : {}),
    precoDiaria: {
      gte: precoMin,
      lte: precoMax,
    },
    ...(params.busca ? {
      OR: [
        { marca: { contains: params.busca, mode: "insensitive" as const } },
        { modelo: { contains: params.busca, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [veiculos, total] = await Promise.all([
    prisma.veiculo.findMany({
      where,
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
      orderBy: { precoDiaria: "asc" },
    }),
    prisma.veiculo.count({ where }),
  ]);

  const totalPaginas = Math.ceil(total / POR_PAGINA);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <nav className="text-sm text-gray-500 mb-2">
            <span>Início</span>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-medium">Veículos</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">Nossa Frota</h1>
          <p className="text-gray-600 mt-1">
            {total} veículo{total !== 1 ? "s" : ""} disponível{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de filtros — Client Component */}
          <aside className="lg:w-72 flex-shrink-0">
            <FiltrosBusca
              categoriaAtiva={params.categoria}
              precoMinAtivo={precoMin}
              precoMaxAtivo={precoMax > 99998 ? 400 : precoMax}
              buscaAtiva={params.busca || ""}
            />
          </aside>

          {/* Grade de veículos */}
          <main className="flex-1">
            {veiculos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">🚗</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Nenhum veículo encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os filtros para ver mais opções.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {veiculos.map((veiculo) => (
                    <VeiculoCard key={veiculo.id} veiculo={veiculo} />
                  ))}
                </div>

                {/* Paginação */}
                {totalPaginas > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                      <a
                        key={p}
                        href={`/veiculos?pagina=${p}${params.categoria ? `&categoria=${params.categoria}` : ""}${params.busca ? `&busca=${params.busca}` : ""}${params.precoMax ? `&precoMax=${params.precoMax}` : ""}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
                          p === pagina
                            ? "bg-[#00d084] text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </a>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
