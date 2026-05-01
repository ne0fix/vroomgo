"use client";

import { useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiltroBusca } from "@/models/dtos/VeiculoDTO";

export function useVeiculosViewModel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filtrosAtuais: FiltroBusca = {
    categoria: (searchParams.get("categoria") as any) || undefined,
    precoMax: searchParams.get("precoMax") ? Number(searchParams.get("precoMax")) : undefined,
    precoMin: searchParams.get("precoMin") ? Number(searchParams.get("precoMin")) : undefined,
    dataInicio: searchParams.get("dataInicio") || undefined,
    dataFim: searchParams.get("dataFim") || undefined,
    busca: searchParams.get("busca") || undefined,
    pagina: Number(searchParams.get("pagina")) || 1,
    porPagina: 12,
  };

  const aplicarFiltros = useCallback((novosFiltros: Partial<FiltroBusca>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(novosFiltros).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    params.set("pagina", "1");
    startTransition(() => {
      router.push(`/veiculos?${params.toString()}`);
    });
  }, [router, searchParams]);

  const limparFiltros = useCallback(() => {
    startTransition(() => {
      router.push("/veiculos");
    });
  }, [router]);

  const irParaPagina = useCallback((pagina: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pagina", String(pagina));
    startTransition(() => {
      router.push(`/veiculos?${params.toString()}`);
    });
  }, [router, searchParams]);

  return { filtrosAtuais, aplicarFiltros, limparFiltros, irParaPagina, isPending };
}
