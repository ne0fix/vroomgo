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
