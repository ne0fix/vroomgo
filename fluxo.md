# PRD — Fluxo Completo: Cadastro → Login → Reserva → Pagamento
**Projeto:** VroomGo (aluguel de veículos)
**Data:** 2026-05-01
**Status:** Pronto para implementação
**Implementador:** Gemini CLI

---

## 1. Diagnóstico — Estado Real do Projeto

Antes de qualquer código, é obrigatório entender o que está quebrado:

| Área | Status | Problema |
|------|--------|----------|
| Cadastro (`/cadastro`) | Funciona | Sem problemas |
| Login (`/login`) | Funciona | Sem problemas |
| Homepage (`/`) | Dados mockados | Usa `VEICULOS_DESTAQUE` do arquivo local |
| Listagem de veículos (`/veiculos`) | Dados mockados | Usa `VEICULOS` do arquivo local, API real existe mas nunca é chamada |
| Detalhe do veículo (`/veiculos/[id]`) | Dados mockados | Busca no array mock, não no banco |
| Formulário de reserva | Quebrado | Usa form HTML puro com `action="/api/reservas"`, não usa o componente `FormularioReserva.tsx` que já existe pronto |
| Schema de datas | Quebrado | `z.string().datetime()` rejeita formato `YYYY-MM-DD` que vem do `<input type="date">` |
| Fluxo pós-reserva | Incompleto | Form HTML puro não redireciona para `/reserva/{id}` |
| Opcionais (GPS, Seguro etc.) | Inacessível | Componente e lógica existem mas nunca renderizados |
| Disponibilidade | Sem verificação | Dois usuários podem reservar o mesmo veículo no mesmo período |
| Navbar auth state | Não verificado | Precisa mostrar nome/logout quando logado |

---

## 2. Escopo desta Implementação

### Incluído (obrigatório):
1. **Listagem real** — `/veiculos` lê do banco, não do arquivo mock
2. **Detalhe real** — `/veiculos/[id]` lê do banco
3. **Formulário correto** — Usar `FormularioReserva` com opcionais e cálculo de custo
4. **Fix do schema de datas** — Aceitar formato `YYYY-MM-DD`
5. **Verificação de disponibilidade** — Impedir double-booking
6. **Fluxo completo** — Cadastro → Login → Veículo → Reserva → Pagamento MP → Confirmação
7. **Navbar autenticada** — Mostrar estado correto do usuário

### Fora do escopo (não implementar):
- Sistema de avaliações/reviews (requer schema migration adicional)
- Upload de documentos (CNH, comprovante)
- Google OAuth
- Voucher PDF / Recibo PDF
- Notificação por email

---

## 3. Decisões de Arquitetura

### 3.1 Server Components vs Client Components

```
app/veiculos/page.tsx          → Server Component (recebe searchParams da URL)
app/veiculos/[id]/page.tsx     → Server Component (query Prisma direto)
components/FiltrosBusca.tsx    → Client Component (interatividade, atualiza URL via router.push)
components/FormularioReserva.tsx → Client Component (já existe, usar como está)
components/Navbar.tsx          → Server Component (lê sessão server-side)
```

### 3.2 Estratégia de Filtragem de Veículos

Ao invés de filtro client-side com estado, usar **URL search params**:
- `FiltrosBusca` faz `router.push('/veiculos?categoria=SUV&precoMax=200')`
- `app/veiculos/page.tsx` lê `searchParams` e query Prisma direto
- Sem estado global, sem useEffect, sem loading states desnecessários

### 3.3 Formato de Datas

- `<input type="date">` retorna `"2026-05-10"` (YYYY-MM-DD)
- Prisma aceita `new Date("2026-05-10")` normalmente
- Fix: mudar schema Zod para aceitar `YYYY-MM-DD` e converter para ISO antes de salvar

### 3.4 Disponibilidade de Veículos

Verificar no `ReservaService` se existe alguma reserva `CONFIRMADA` ou `ATIVA` para o veículo no período solicitado. Usar query Prisma com `dataInicio < solicitadoFim AND dataFim > solicitadoInicio`.

---

## 4. Mudanças no Banco de Dados

**Nenhuma migration necessária.** O schema atual já suporta tudo. Apenas o código precisa ser corrigido.

---

## 5. Implementação — Arquivo por Arquivo

A ordem abaixo é a ordem de implementação. **Respeitar a sequência.**

---

### ETAPA 1 — Correções de Foundation

---

#### 5.1 MODIFICAR: `models/dtos/ReservaDTO.ts`

**Problema:** `z.string().datetime()` rejeita `"2026-05-10"` (formato de `<input type="date">`).
**Solução:** Usar regex que aceita `YYYY-MM-DD`.

```typescript
import { z } from "zod";

const dataSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD");

export const CriarReservaSchema = z.object({
  veiculoId: z.string().cuid(),
  dataInicio: dataSchema,
  dataFim: dataSchema,
  opcionais: z.array(z.object({
    nome: z.string(),
    valor: z.number(),
  })).default([]),
  observacoes: z.string().optional(),
}).refine((data) => new Date(data.dataFim) > new Date(data.dataInicio), {
  message: "Data de devolução deve ser posterior à data de retirada",
  path: ["dataFim"],
});

export type CriarReservaDTO = z.infer<typeof CriarReservaSchema>;

export const OPCIONAIS_DISPONIVEIS = [
  { nome: "Seguro Completo", valor: 45.00 },
  { nome: "GPS Integrado", valor: 15.00 },
  { nome: "Cadeirinha Infantil", valor: 20.00 },
  { nome: "Motorista Adicional", valor: 30.00 },
  { nome: "Wi-Fi Portátil", valor: 12.00 },
];
```

---

#### 5.2 MODIFICAR: `services/ReservaService.ts`

Ler o arquivo atual e reescrevê-lo com:
1. Conversão de datas `YYYY-MM-DD` para `Date` object
2. **Verificação de disponibilidade** (previne double-booking)
3. Mínimo de 1 dia validado

```typescript
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
```

---

#### 5.3 MODIFICAR: `viewmodels/useReservaViewModel.ts`

Garantir que as datas são enviadas no formato correto (`YYYY-MM-DD`) e que o redirect funciona.

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CriarReservaSchema, CriarReservaDTO, OPCIONAIS_DISPONIVEIS } from "@/models/dtos/ReservaDTO";
import { differenceInDays } from "date-fns";

interface UseReservaViewModelProps {
  veiculoId: string;
  precoDiaria: number;
  caucaoValor: number;
}

export function useReservaViewModel({ veiculoId, precoDiaria, caucaoValor }: UseReservaViewModelProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [opcionaisSelecionados, setOpcionaisSelecionados] = useState<typeof OPCIONAIS_DISPONIVEIS>([]);

  const form = useForm<CriarReservaDTO>({
    resolver: zodResolver(CriarReservaSchema),
    defaultValues: { veiculoId, opcionais: [], dataInicio: "", dataFim: "" },
  });

  const dataInicio = form.watch("dataInicio");
  const dataFim = form.watch("dataFim");

  const totalDias =
    dataInicio && dataFim
      ? Math.max(0, differenceInDays(new Date(dataFim), new Date(dataInicio)))
      : 0;

  const valorOpcionais = opcionaisSelecionados.reduce((acc, op) => acc + op.valor, 0);
  const valorAluguel = (precoDiaria + valorOpcionais) * totalDias;
  const valorTotal = valorAluguel + caucaoValor;

  const toggleOpcional = (opcionalNome: string) => {
    const opcional = OPCIONAIS_DISPONIVEIS.find((o) => o.nome === opcionalNome);
    if (!opcional) return;

    const novaLista = opcionaisSelecionados.some((o) => o.nome === opcionalNome)
      ? opcionaisSelecionados.filter((o) => o.nome !== opcionalNome)
      : [...opcionaisSelecionados, opcional];

    setOpcionaisSelecionados(novaLista);
    form.setValue("opcionais", novaLista.map((o) => ({ nome: o.nome, valor: o.valor })));
  };

  const onSubmit = async (data: CriarReservaDTO) => {
    setIsLoading(true);
    setErro(null);
    try {
      const payload = {
        ...data,
        opcionais: opcionaisSelecionados.map((o) => ({ nome: o.nome, valor: o.valor })),
      };
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.erro || "Erro ao criar reserva");
      router.push(`/reserva/${result.id}`);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    erro,
    opcionaisSelecionados,
    toggleOpcional,
    totalDias,
    valorAluguel,
    valorTotal,
    caucaoValor,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
```

---

### ETAPA 2 — Listagem de Veículos com Dados Reais

---

#### 5.4 MODIFICAR: `app/veiculos/page.tsx`

**Problema:** Client Component que usa dados do arquivo mock local.
**Solução:** Converter para Server Component que lê `searchParams` e query Prisma direto. Os filtros interativos ficam em `FiltrosBusca` (já é client component) e atualizam a URL via `router.push`.

```typescript
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
```

---

#### 5.5 MODIFICAR: `components/FiltrosBusca.tsx`

Reescrever para que ao invés de gerenciar estado local e filtrar dados mockados, **atualize a URL via `router.push`** para que o Server Component refaça a query.

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";

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
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const aplicarFiltros = (overrides?: Partial<{
    categoria: string;
    busca: string;
    precoMax: number;
  }>) => {
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

  const temFiltros = categoriaAtiva || buscaAtiva || precoMaxAtivo < 400;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          Filtros
        </h3>
        {temFiltros && (
          <button
            onClick={limparFiltros}
            className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>

      {/* Busca */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Buscar</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Marca ou modelo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && aplicarFiltros({ busca })}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00d084] focus:border-transparent"
          />
        </div>
      </div>

      {/* Categorias */}
      <div className="mb-5">
        <label className="text-sm font-semibold text-gray-700 mb-2 block">Categoria</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setCategoriaLocal(cat.value);
                aplicarFiltros({ categoria: cat.value });
              }}
              className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
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
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold text-gray-700">Preço máximo / dia</label>
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
          className="w-full accent-[#00d084]"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>R$ 50</span>
          <span>R$ 400+</span>
        </div>
      </div>

      {/* Botão aplicar */}
      <button
        onClick={() => aplicarFiltros()}
        className="w-full bg-[#00d084] text-white py-2.5 rounded-xl font-semibold hover:bg-[#00c070] transition-colors"
      >
        Aplicar Filtros
      </button>
    </div>
  );
}
```

---

#### 5.6 MODIFICAR: `components/VeiculoCard.tsx`

Atualizar para usar os campos reais do Prisma (`lugares`, `transmissao`, `combustivel`) ao invés dos campos do mock (`assentos`, `cambio`).

```typescript
import Link from "next/link";
import Image from "next/image";
import { Users, Fuel, Settings, Tag } from "lucide-react";
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
  AUTOMATICO: "Automático",
  MANUAL: "Manual",
};

export function VeiculoCard({ veiculo }: VeiculoCardProps) {
  const imagemPrincipal = veiculo.fotos[0] || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Imagem */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <Image
          src={imagemPrincipal}
          alt={`${veiculo.marca} ${veiculo.modelo}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-[#00d084] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {CATEGORIA_LABEL[veiculo.categoria] || veiculo.categoria}
          </span>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-lg leading-tight">
            {veiculo.marca} {veiculo.modelo}
          </h3>
          <p className="text-sm text-gray-500">{veiculo.ano} · {veiculo.cor}</p>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600">{veiculo.lugares} lug.</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-2">
            <Fuel className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600">{veiculo.combustivel}</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-gray-50 rounded-xl p-2">
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-600">
              {TRANSMISSAO_LABEL[veiculo.transmissao] || veiculo.transmissao}
            </span>
          </div>
        </div>

        {/* Preço + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-gray-900">
              {formatarMoeda(Number(veiculo.precoDiaria))}
            </span>
            <span className="text-sm text-gray-500">/dia</span>
          </div>
          <Link
            href={`/veiculos/${veiculo.id}`}
            className="bg-[#00d084] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-[#00c070] transition-colors"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

### ETAPA 3 — Detalhe do Veículo com Dados Reais e Formulário Correto

---

#### 5.7 REESCREVER: `app/veiculos/[id]/page.tsx`

**Problemas atuais:**
- Busca no array mock em vez do banco
- Tem form HTML puro sem validação (deveria usar `FormularioReserva`)
- Não usa os campos corretos do schema Prisma

**Solução:** Server Component que query Prisma + renderiza `FormularioReserva` (client component).

```typescript
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FormularioReserva } from "@/components/FormularioReserva";
import { formatarMoeda } from "@/lib/utils";
import {
  Users, Fuel, Settings, MapPin, Shield, Calendar,
  ArrowLeft, Star, Tag, Gauge
} from "lucide-react";

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

  // Buscar veículo real do banco de dados
  const veiculo = await prisma.veiculo.findUnique({
    where: { id },
  });

  if (!veiculo) notFound();

  const imagemPrincipal = veiculo.fotos[0] || "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800";
  const imagensGaleria = veiculo.fotos.slice(1, 4);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#00d084] transition-colors">Início</Link>
            <span>›</span>
            <Link href="/veiculos" className="hover:text-[#00d084] transition-colors">Veículos</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">{veiculo.marca} {veiculo.modelo}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUNA PRINCIPAL */}
          <div className="lg:col-span-2 space-y-6">

            {/* Cabeçalho */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="bg-[#00d084] text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {CATEGORIA_LABEL[veiculo.categoria] || veiculo.categoria}
                </span>
                {veiculo.status === "DISPONIVEL" && (
                  <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                    Disponível
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {veiculo.marca} {veiculo.modelo}
              </h1>
              <p className="text-gray-500 mt-1">{veiculo.ano} · {veiculo.cor} · {veiculo.quilometragem.toLocaleString("pt-BR")} km</p>
            </div>

            {/* Imagem Principal */}
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-gray-200">
              <Image
                src={imagemPrincipal}
                alt={`${veiculo.marca} ${veiculo.modelo}`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 66vw"
              />
            </div>

            {/* Galeria de miniaturas */}
            {imagensGaleria.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {imagensGaleria.map((foto, i) => (
                  <div key={i} className="relative h-24 rounded-xl overflow-hidden bg-gray-200">
                    <Image src={foto} alt={`Foto ${i + 2}`} fill className="object-cover" sizes="200px" />
                  </div>
                ))}
              </div>
            )}

            {/* Especificações */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Especificações</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <Users className="w-6 h-6 text-[#00d084]" />
                  <span className="text-sm text-gray-500">Lugares</span>
                  <span className="font-semibold text-gray-900">{veiculo.lugares}</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <Fuel className="w-6 h-6 text-[#00d084]" />
                  <span className="text-sm text-gray-500">Combustível</span>
                  <span className="font-semibold text-gray-900">{veiculo.combustivel}</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <Settings className="w-6 h-6 text-[#00d084]" />
                  <span className="text-sm text-gray-500">Câmbio</span>
                  <span className="font-semibold text-gray-900">{veiculo.transmissao}</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  <Gauge className="w-6 h-6 text-[#00d084]" />
                  <span className="text-sm text-gray-500">KM</span>
                  <span className="font-semibold text-gray-900">{veiculo.quilometragem.toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </div>

            {/* Opcionais do veículo */}
            {veiculo.opcionais && veiculo.opcionais.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Opcionais inclusos</h2>
                <div className="flex flex-wrap gap-2">
                  {veiculo.opcionais.map((op) => (
                    <span key={op} className="bg-green-50 text-green-700 border border-green-200 text-sm px-3 py-1 rounded-full">
                      {op}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Descrição */}
            {veiculo.descricao && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Sobre o veículo</h2>
                <p className="text-gray-600 leading-relaxed">{veiculo.descricao}</p>
              </div>
            )}

            {/* Políticas */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Políticas e informações</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#00d084] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Caução reembolsável</p>
                    <p>A caução de {formatarMoeda(Number(veiculo.caucaoValor))} é debitada no pagamento e devolvida integralmente após a entrega do veículo em boas condições.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#00d084] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Período mínimo</p>
                    <p>Locação mínima de 1 dia.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#00d084] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Retirada e devolução</p>
                    <p>Detalhes do local serão confirmados após o pagamento.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA LATERAL — FORMULÁRIO DE RESERVA */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                {/* Preço */}
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

                {/* Formulário condicional: logado ou não */}
                {session?.user ? (
                  <FormularioReserva
                    veiculoId={veiculo.id}
                    precoDiaria={Number(veiculo.precoDiaria)}
                    caucaoValor={Number(veiculo.caucaoValor)}
                  />
                ) : (
                  <div className="space-y-4">
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

              {/* Placa */}
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
```

---

### ETAPA 4 — Autenticação Completa

---

#### 5.8 VERIFICAR/MODIFICAR: `app/login/page.tsx`

O login já funciona corretamente. Verificar apenas se o `callbackUrl` é lido dos searchParams e aplicado após login. Se não estiver tratando o `callbackUrl` do query param, adicionar:

```typescript
// No início do componente, ler o callbackUrl:
const searchParams = useSearchParams();
const callbackUrl = searchParams.get("callbackUrl") || "/";

// No signIn:
const resultado = await signIn("credentials", {
  email,
  senha,
  redirect: false,
});

if (resultado?.ok) {
  router.push(callbackUrl); // usa o callbackUrl real
}
```

---

#### 5.9 VERIFICAR/MODIFICAR: `app/cadastro/page.tsx`

Após o cadastro bem-sucedido, o sistema faz auto-login e redireciona. Garantir que o `callbackUrl` é preservado para que o usuário volte à página do veículo que estava tentando reservar:

```typescript
// Ler callbackUrl dos searchParams
const searchParams = useSearchParams();
const callbackUrl = searchParams.get("callbackUrl") || "/";

// Após cadastro + auto-login bem-sucedido:
// 1. POST /api/auth/register → cria conta
// 2. signIn("credentials", { email, senha, redirect: false }) → autentica
// 3. router.push(callbackUrl) → volta para onde estava

// Sequência no onSubmit:
const resRegistro = await fetch("/api/auth/register", { ... });
if (resRegistro.ok) {
  const loginResult = await signIn("credentials", {
    email: data.email,
    senha: data.senha,
    redirect: false,
  });
  if (loginResult?.ok) {
    router.push(callbackUrl); // vai para /veiculos/{id} se veio de lá
  }
}
```

---

#### 5.10 MODIFICAR: `components/Navbar.tsx`

Converter para Server Component que lê a sessão server-side e mostra estado de autenticação correto.

```typescript
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Car, User, LogOut, Menu } from "lucide-react";
import { NavbarMobile } from "./NavbarMobile"; // client component para menu mobile

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <div className="w-8 h-8 bg-[#00d084] rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            VroomGo
          </Link>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/veiculos" className="text-gray-600 hover:text-[#00d084] font-medium transition-colors">
              Veículos
            </Link>
            {session?.user && (
              <Link href="/meus-alugueis" className="text-gray-600 hover:text-[#00d084] font-medium transition-colors">
                Meus Aluguéis
              </Link>
            )}
            {session?.user?.role === "ADMIN" && (
              <Link href="/dashboard" className="text-gray-600 hover:text-[#00d084] font-medium transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth buttons desktop */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 bg-[#00d084] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">
                    {session.user.name?.split(" ")[0]}
                  </span>
                </div>
                <form action="/api/auth/signout" method="POST">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </form>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-[#00d084] font-medium text-sm transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="bg-[#00d084] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-[#00c070] transition-colors"
                >
                  Criar Conta
                </Link>
              </>
            )}
          </div>

          {/* Menu mobile — client component */}
          <NavbarMobile session={session} />
        </div>
      </div>
    </nav>
  );
}
```

---

#### 5.11 CRIAR: `components/NavbarMobile.tsx`

Client component separado só para o menu mobile (necessário pois usa useState):

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Car, User } from "lucide-react";
import { signOut } from "next-auth/react";

interface NavbarMobileProps {
  session: any;
}

export function NavbarMobile({ session }: NavbarMobileProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setAberto(!aberto)}
        className="p-2 text-gray-600 hover:text-gray-900"
        aria-label="Menu"
      >
        {aberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {aberto && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-50 p-4 space-y-3">
          <Link href="/veiculos" onClick={() => setAberto(false)} className="block py-2 text-gray-700 font-medium">
            Veículos
          </Link>
          {session?.user && (
            <Link href="/meus-alugueis" onClick={() => setAberto(false)} className="block py-2 text-gray-700 font-medium">
              Meus Aluguéis
            </Link>
          )}
          {session?.user?.role === "ADMIN" && (
            <Link href="/dashboard" onClick={() => setAberto(false)} className="block py-2 text-gray-700 font-medium">
              Dashboard
            </Link>
          )}
          <div className="border-t pt-3">
            {session?.user ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Logado como <strong>{session.user.name?.split(" ")[0]}</strong>
                </p>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full text-left py-2 text-red-500 font-medium"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/login" onClick={() => setAberto(false)} className="block py-2 text-gray-700 font-medium">
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  onClick={() => setAberto(false)}
                  className="block w-full text-center bg-[#00d084] text-white py-2.5 rounded-xl font-semibold"
                >
                  Criar Conta
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### ETAPA 5 — Fluxo Completo de Pagamento (já implementado, verificar integrações)

Os arquivos de pagamento já estão corretos. Apenas garantir as integrações:

---

#### 5.12 VERIFICAR: `app/reserva/[id]/page.tsx`

Já implementado e corrigido. Confirmar que:
- Importa `BotaoPagarMP` corretamente
- Exibe `formatarMoeda(valorTotal)` no resumo
- Mensagem "Pagamento confirmado!" está em português ✓ (já corrigido)

---

#### 5.13 VERIFICAR: `components/BotaoPagarMP.tsx`

Já implementado e corrigido. Confirmar que:
- Fallback de URL está presente ✓ (já corrigido)
- Botão azul MP com texto em português ✓

---

#### 5.14 VERIFICAR: `app/api/pagamentos/webhook/route.ts`

Já implementado. Sem mudanças necessárias.

---

### ETAPA 6 — Homepage com Dados Reais

---

#### 5.15 MODIFICAR: `app/page.tsx`

Substituir os veículos em destaque mockados por uma query real dos 6 veículos mais baratos disponíveis.

**Encontrar no arquivo atual** o trecho que usa `VEICULOS_DESTAQUE` ou similar e substituir por:

```typescript
// No início da função (Server Component):
const veiculosDestaque = await prisma.veiculo.findMany({
  where: { status: "DISPONIVEL" },
  orderBy: { precoDiaria: "asc" },
  take: 6,
});
```

Usar `veiculosDestaque` onde antes estava o array mockado. Os cards existentes devem continuar funcionando — apenas trocar a fonte dos dados.

**Nota:** Manter toda a estrutura visual da homepage (hero, carousel de categorias, benefícios, CTA). Apenas a seção de "veículos em destaque" deve usar dados reais.

---

### ETAPA 7 — API de Veículos (verificação)

---

#### 5.16 VERIFICAR: `app/api/veiculos/route.ts`

Ler o arquivo atual. Se já faz query Prisma com filtros corretos (categoria, precoMax, busca), **não modificar**. A página de listagem agora usa Prisma direto (sem passar pela API), então este endpoint é mantido para uso futuro ou mobile.

#### 5.17 VERIFICAR: `app/api/veiculos/[id]/route.ts`

Mesmo caso — verificar se já faz `prisma.veiculo.findUnique`. Se sim, não modificar.

---

## 6. Fluxo Completo — Sequência de Telas

```
[FLUXO NOVO USUÁRIO]

1. Homepage (/) — dados reais do banco
   ↓ clica "Ver Veículos"
   
2. /veiculos — query Prisma com filtros por URL
   ↓ escolhe um veículo, clica "Ver detalhes"
   
3. /veiculos/{id} — Server Component com dados reais
   ↓ clica "Entrar para Reservar" (não logado)
   
4. /login?callbackUrl=/veiculos/{id}
   ↓ sem conta, clica "Criar conta grátis"
   
5. /cadastro?callbackUrl=/veiculos/{id}
   → preenche nome, email, senha
   → POST /api/auth/register → cria usuário no banco
   → auto-login via signIn('credentials')
   → router.push(callbackUrl) → volta para /veiculos/{id}
   
6. /veiculos/{id} — agora logado, vê FormularioReserva
   → escolhe datas de retirada e devolução
   → seleciona opcionais (GPS, Seguro, etc.)
   → vê cálculo em tempo real: dias × diária + opcionais + caução
   → clica "Reservar Agora"
   
7. useReservaViewModel.onSubmit()
   → POST /api/reservas {veiculoId, dataInicio, dataFim, opcionais}
   → ReservaService.criarReserva():
     ✓ valida veículo existe
     ✓ verifica se não está em manutenção
     ✓ verifica conflito de reservas no período
     ✓ calcula valorTotal = (diária + opcionais) × dias
     ✓ cria Reserva com status PENDENTE
   → retorna { id: "cuid-da-reserva" }
   → router.push('/reserva/cuid-da-reserva')
   
8. /reserva/{id} — resumo antes de pagar
   → exibe: veículo, datas, dias, valor aluguel, caução, TOTAL
   → botão "Pagar com Mercado Pago"
   
9. BotaoPagarMP.iniciarPagamento()
   → POST /api/pagamentos/checkout {reservaId}
   → PagamentoService.criarPreferencia():
     ✓ valida autorização
     ✓ cria Preference no MP
     ✓ cria Transacao no banco (status: PENDENTE)
   → retorna { sandboxInitPoint, initPoint }
   → window.location.href = url do MP
   
10. [Ambiente do Mercado Pago]
    → usuário paga com cartão de teste
    → MP processa pagamento
    
11. SIMULTÂNEO: MP envia webhook
    → POST /api/pagamentos/webhook
    → valida topic === "payment"
    → mpPayment.get({id}) → confirma approved
    → PagamentoService.processarPagamentoAprovado():
      ✓ guarda de idempotência
      ✓ Transacao.status → PRE_AUTORIZADO + salva mpPaymentId
      ✓ Reserva.status → CONFIRMADA
      ✓ Veiculo.status → ALUGADO
    
12. MP redireciona para /checkout/sucesso?payment_id=...
    → exibe "Pagamento Confirmado!"
    → botão "Ver Meus Aluguéis"
    
13. /meus-alugueis
    → mostra reserva com status CONFIRMADA (verde)
    → botões: Voucher, Cancelar, Suporte
    
[FIM DO FLUXO PRINCIPAL]
```

---

## 7. Fluxo de Usuário Existente (Login)

```
1. /veiculos/{id} — clica na página
   ↓ clica "Entrar para Reservar"
   
2. /login?callbackUrl=/veiculos/{id}
   → preenche email + senha
   → signIn('credentials', { email, senha, redirect: false })
   → resultado.ok → router.push(callbackUrl)
   
3. /veiculos/{id} — logado, vê FormularioReserva
   ↓ continua fluxo a partir do passo 6 acima
```

---

## 8. Resumo de Todos os Arquivos e Ações

### Modificar (código existente precisa ser reescrito):

| # | Arquivo | Tipo de mudança | Motivo |
|---|---------|-----------------|--------|
| 1 | `models/dtos/ReservaDTO.ts` | Corrigir schema de datas | `z.string().datetime()` → regex YYYY-MM-DD |
| 2 | `services/ReservaService.ts` | Adicionar verificação disponibilidade | Prevenir double-booking |
| 3 | `viewmodels/useReservaViewModel.ts` | Corrigir toggleOpcional + payload | Bug de state stale closure |
| 4 | `app/veiculos/page.tsx` | Server Component + Prisma | Trocar mock por dados reais |
| 5 | `components/FiltrosBusca.tsx` | URL params em vez de state local | Integrar com Server Component |
| 6 | `components/VeiculoCard.tsx` | Props tipadas com Prisma | Campos corretos do schema |
| 7 | `app/veiculos/[id]/page.tsx` | Server Component + Prisma + FormularioReserva | Substituir mock e form HTML |
| 8 | `app/login/page.tsx` | Ler callbackUrl dos searchParams | Redirecionar corretamente pós-login |
| 9 | `app/cadastro/page.tsx` | Ler callbackUrl + auto-login redirect | Redirecionar pós-cadastro |
| 10 | `components/Navbar.tsx` | Server Component com sessão | Mostrar estado auth real |
| 11 | `app/page.tsx` | Substituir mock por query Prisma | Veículos em destaque reais |

### Criar (novos arquivos):

| # | Arquivo | Motivo |
|---|---------|--------|
| 12 | `components/NavbarMobile.tsx` | Separar menu mobile (Client Component) da Navbar (Server) |

### Não modificar (já funcionando):

| Arquivo | Status |
|---------|--------|
| `lib/mercadopago.ts` | Correto |
| `lib/auth.ts` | Correto |
| `lib/prisma.ts` | Correto |
| `services/PagamentoService.ts` | Correto (com correções anteriores) |
| `app/api/pagamentos/checkout/route.ts` | Correto |
| `app/api/pagamentos/webhook/route.ts` | Correto |
| `app/api/pagamentos/[reservaId]/liberar-caucao/route.ts` | Correto |
| `app/api/pagamentos/[reservaId]/reter-caucao/route.ts` | Correto |
| `app/api/reservas/route.ts` | Correto |
| `app/api/auth/register/route.ts` | Correto |
| `app/reserva/[id]/page.tsx` | Correto |
| `components/BotaoPagarMP.tsx` | Correto |
| `components/FormularioReserva.tsx` | Correto (usá-lo, não modificar) |
| `app/meus-alugueis/page.tsx` | Correto |
| `app/checkout/sucesso/page.tsx` | Correto |
| `app/checkout/falhou/page.tsx` | Correto |
| `app/checkout/pendente/page.tsx` | Correto |
| `app/dashboard/page.tsx` | Correto |
| `app/api/admin/dashboard/route.ts` | Correto |
| `prisma/schema.prisma` | Sem mudanças |
| `middleware.ts` | Correto |

---

## 9. Ordem de Implementação (seguir exatamente)

```
Etapa 1 — Foundation (sem estas nada funciona):
  1. models/dtos/ReservaDTO.ts          (fix schema datas)
  2. services/ReservaService.ts         (disponibilidade)
  3. viewmodels/useReservaViewModel.ts  (fix bug closure)

Etapa 2 — Listagem real:
  4. components/VeiculoCard.tsx         (campos Prisma)
  5. components/FiltrosBusca.tsx        (URL params)
  6. app/veiculos/page.tsx              (Server Component + Prisma)

Etapa 3 — Detalhe real + formulário:
  7. app/veiculos/[id]/page.tsx         (Server Component + Prisma + FormularioReserva)

Etapa 4 — Auth completo:
  8. app/login/page.tsx                 (callbackUrl)
  9. app/cadastro/page.tsx              (callbackUrl + redirect)
  10. components/NavbarMobile.tsx       (criar novo)
  11. components/Navbar.tsx             (Server Component)

Etapa 5 — Homepage:
  12. app/page.tsx                      (dados reais na seção destaque)

Etapa 6 — Verificar build:
  13. npm run build                     (verificar erros de tipo)
```

---

## 10. Dados de Teste — Seed do Banco

Para testar, o banco precisa ter veículos. Criar `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Limpar dados existentes
  await prisma.transacao.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.veiculo.deleteMany();

  // Criar veículos de exemplo
  const veiculos = [
    {
      marca: "Volkswagen", modelo: "Gol", ano: 2023, placa: "ABC1234",
      categoria: "HATCH" as const, status: "DISPONIVEL" as const,
      precoDiaria: 89.90, caucaoValor: 500.00,
      quilometragem: 15000, cor: "Branco",
      transmissao: "MANUAL", combustivel: "FLEX", lugares: 5,
      descricao: "Econômico e confiável, ideal para cidade.",
      fotos: ["https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800"],
      opcionais: ["Ar-condicionado"],
    },
    {
      marca: "Toyota", modelo: "Corolla", ano: 2024, placa: "DEF5678",
      categoria: "SEDA" as const, status: "DISPONIVEL" as const,
      precoDiaria: 159.90, caucaoValor: 800.00,
      quilometragem: 8000, cor: "Prata",
      transmissao: "AUTOMATICO", combustivel: "FLEX", lugares: 5,
      descricao: "Sedan executivo com acabamento premium.",
      fotos: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800"],
      opcionais: ["Ar-condicionado", "Câmera de ré", "Sensor de estacionamento"],
    },
    {
      marca: "Jeep", modelo: "Renegade", ano: 2023, placa: "GHI9012",
      categoria: "SUV" as const, status: "DISPONIVEL" as const,
      precoDiaria: 199.90, caucaoValor: 1000.00,
      quilometragem: 22000, cor: "Preto",
      transmissao: "AUTOMATICO", combustivel: "FLEX", lugares: 5,
      descricao: "SUV aventureiro e espaçoso.",
      fotos: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"],
      opcionais: ["Ar-condicionado", "4x4", "Teto solar"],
    },
    {
      marca: "Ford", modelo: "Ranger", ano: 2024, placa: "JKL3456",
      categoria: "PICKUP" as const, status: "DISPONIVEL" as const,
      precoDiaria: 249.90, caucaoValor: 1200.00,
      quilometragem: 5000, cor: "Cinza",
      transmissao: "AUTOMATICO", combustivel: "DIESEL", lugares: 5,
      descricao: "Pickup robusta para trabalho e lazer.",
      fotos: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
      opcionais: ["Ar-condicionado", "Câmera de ré", "Capota marítima"],
    },
    {
      marca: "BYD", modelo: "Dolphin", ano: 2024, placa: "MNO7890",
      categoria: "ELETRICO" as const, status: "DISPONIVEL" as const,
      precoDiaria: 299.90, caucaoValor: 1500.00,
      quilometragem: 3000, cor: "Azul",
      transmissao: "AUTOMATICO", combustivel: "ELETRICO", lugares: 5,
      descricao: "100% elétrico com autonomia de 400km.",
      fotos: ["https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800"],
      opcionais: ["Ar-condicionado", "Carregador rápido", "Piloto automático"],
    },
    {
      marca: "Fiat", modelo: "Doblo", ano: 2023, placa: "PQR1234",
      categoria: "VAN" as const, status: "DISPONIVEL" as const,
      precoDiaria: 179.90, caucaoValor: 900.00,
      quilometragem: 30000, cor: "Branco",
      transmissao: "MANUAL", combustivel: "FLEX", lugares: 7,
      descricao: "Ideal para grupos e famílias numerosas.",
      fotos: ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800"],
      opcionais: ["Ar-condicionado", "Bagageiro no teto"],
    },
  ];

  for (const veiculo of veiculos) {
    await prisma.veiculo.create({ data: veiculo });
  }

  console.log("Seed concluído com sucesso!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Adicionar ao `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Executar: `npx prisma db seed`

---

## 11. Checklist de Teste do Fluxo Completo

### Pré-requisitos
```bash
npm install
npx prisma migrate dev    # aplica schema ao banco
npx prisma db seed        # popula com veículos de teste
npm run dev
```

### Teste Passo a Passo

#### Cadastro + Login
- [ ] Acessar `/cadastro`
- [ ] Preencher nome, email, senha (mínimo 6 chars)
- [ ] Clicar "Criar Conta" → spinner aparece
- [ ] Tela de sucesso com checkmark aparece
- [ ] Redirecionamento automático para `/` em ~1.5s
- [ ] Navbar mostra nome do usuário logado
- [ ] Link "Meus Aluguéis" aparece na navbar

#### Logout + Login
- [ ] Clicar "Sair" na navbar → deslogado
- [ ] Acessar `/login`
- [ ] Preencher credenciais cadastradas
- [ ] Clicar "Entrar" → redireciona para `/`

#### Callback após login
- [ ] Deslogado, acessar `/veiculos/{id}`
- [ ] Clicar "Entrar para Reservar" → vai para `/login?callbackUrl=/veiculos/{id}`
- [ ] Fazer login → volta para `/veiculos/{id}` (não para a homepage)

#### Listagem de Veículos
- [ ] Acessar `/veiculos` → carrega veículos do banco (não mock)
- [ ] Filtrar por categoria "SUV" → URL muda para `?categoria=SUV`
- [ ] Mover slider de preço → filtro aplicado após soltar
- [ ] Buscar por "Toyota" → mostra Corolla
- [ ] Limpar filtros → volta todos os veículos

#### Detalhe do Veículo
- [ ] Clicar em "Ver detalhes" → abre `/veiculos/{id}`
- [ ] Dados reais do banco aparecem (marca, modelo, ano, km, cor, lugares)
- [ ] Logado: FormularioReserva aparece com datas e opcionais
- [ ] Deslogado: botões "Entrar" e "Criar conta"

#### Formulário de Reserva
- [ ] Selecionar data de retirada → data de devolução fica disponível
- [ ] Selecionar data anterior à retirada → erro de validação
- [ ] Selecionar opcionais → custo recalculado em tempo real
- [ ] Cálculo correto: `(diária + opcionais) × dias + caução`
- [ ] Clicar "Reservar Agora" com datas válidas → loading
- [ ] Criada reserva no banco → redirecionamento para `/reserva/{id}`

#### Verificação de Disponibilidade
- [ ] Criar reserva e confirmar pagamento → Reserva = CONFIRMADA
- [ ] Tentar criar outra reserva para o mesmo veículo no mesmo período → erro "Veículo indisponível para o período selecionado"

#### Página de Confirmação + Pagamento
- [ ] `/reserva/{id}` mostra resumo correto (valor, datas, caução)
- [ ] Botão "Pagar com Mercado Pago" visível (se não pago)
- [ ] Clicar botão → redireciona para MP sandbox
- [ ] Pagar com cartão teste: `5031 4332 1540 6351` CVV `123` Validade `11/25`
- [ ] Redirecionamento para `/checkout/sucesso?payment_id=...`

#### Webhook + Status
- [ ] Aguardar webhook do MP (ou verificar logs)
- [ ] Transacao.status = PRE_AUTORIZADO
- [ ] Reserva.status = CONFIRMADA
- [ ] Veiculo.status = ALUGADO
- [ ] Acessar `/reserva/{id}` → mostra "Pagamento confirmado!"
- [ ] `/meus-alugueis` → reserva aparece como "Confirmada" (verde)
- [ ] Botão "Pagar Agora" não aparece mais (pois já está pago)

#### Cartões de Teste Mercado Pago (Sandbox)
| Situação     | Número              | CVV | Validade |
|--------------|---------------------|-----|----------|
| Aprovado     | 5031 4332 1540 6351 | 123 | 11/25    |
| Recusado     | 4000 0000 0000 0002 | 123 | 11/25    |
| Pendente     | 4235 6477 2802 5682 | 123 | 11/25    |

---

## 12. Notas Críticas para o Implementador

1. **Importar Veiculo do Prisma** — Em `VeiculoCard.tsx`, usar `import { Veiculo } from "@prisma/client"` para ter tipagem correta. Não criar interface manual.

2. **CategoriaVeiculo enum** — O valor no banco é `"HATCH"`, `"SEDA"`, `"SUV"` etc. (maiúsculas). Os filtros na URL devem usar exatamente estes valores.

3. **Prisma no Server Component** — `import { prisma } from "@/lib/prisma"` funciona em Server Components. NUNCA importar Prisma em Client Components (erro de build).

4. **FormularioReserva já existe** — NÃO recriar este componente. Apenas importar e usar em `app/veiculos/[id]/page.tsx`. Já tem todos os opcionais, cálculo de custo e submit correto.

5. **Navbar como Server Component** — O logout precisa de `<form action="/api/auth/signout" method="POST">` para funcionar em Server Components. Não usar `signOut()` do next-auth/react diretamente na Navbar.

6. **next.config.ts** — Já tem `images.remotePatterns` para Unsplash configurado. As URLs de imagem do seed devem usar `images.unsplash.com`. Se usar outras fontes de imagem, adicionar o domínio em `remotePatterns`.

7. **searchParams é Promise no Next.js 15** — Em TODOS os Server Components que recebem `searchParams`, usar `const params = await searchParams`. Não acessar diretamente.

8. **Date format** — O `<input type="date">` envia `"2026-05-10"`. O `new Date("2026-05-10")` funciona corretamente no Node.js. O Prisma aceita `Date` objects normalmente.

9. **Veiculo.fotos é array** — Sempre verificar `veiculo.fotos[0]` com fallback: `veiculo.fotos[0] || "https://..."`.

10. **Placa única** — O campo `placa` tem `@unique` no schema. O seed acima usa placas únicas fictícias. Em produção, usar placas reais.
