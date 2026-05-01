"use client";

import { useVeiculosViewModel } from "@/viewmodels/useVeiculosViewModel";

interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
}

export function Paginacao({ paginaAtual, totalPaginas }: PaginacaoProps) {
  const { irParaPagina } = useVeiculosViewModel();

  return (
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => irParaPagina(paginaAtual - 1)}
        disabled={paginaAtual === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Anterior
      </button>
      <span className="text-sm">Página {paginaAtual} de {totalPaginas}</span>
      <button
        onClick={() => irParaPagina(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Próxima
      </button>
    </div>
  );
}
