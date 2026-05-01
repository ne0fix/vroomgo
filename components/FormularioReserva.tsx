"use client";

import { useReservaViewModel } from "@/viewmodels/useReservaViewModel";
import { OPCIONAIS_DISPONIVEIS } from "@/models/dtos/ReservaDTO";
import { formatarMoeda } from "@/lib/utils";

interface FormularioReservaProps {
  veiculoId: string;
  precoDiaria: number;
  caucaoValor: number;
}

export function FormularioReserva({ veiculoId, precoDiaria, caucaoValor }: FormularioReservaProps) {
  const {
    form,
    isLoading,
    erro,
    opcionaisSelecionados,
    toggleOpcional,
    totalDias,
    valorAluguel,
    valorTotal,
    onSubmit,
  } = useReservaViewModel({ veiculoId, precoDiaria, caucaoValor });

  const { register, formState: { errors } } = form;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Datas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">Retirada</label>
          <input
            type="date"
            {...register("dataInicio")}
            className="w-full px-3 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00d084] focus:border-transparent"
            min={new Date().toISOString().split("T")[0]}
          />
          {errors.dataInicio && (
            <p className="text-xs text-red-500 mt-1">{errors.dataInicio.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">Devolução</label>
          <input
            type="date"
            {...register("dataFim")}
            className="w-full px-3 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00d084] focus:border-transparent"
          />
          {errors.dataFim && (
            <p className="text-xs text-red-500 mt-1">{errors.dataFim.message}</p>
          )}
        </div>
      </div>

      {/* Opcionais */}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-2">Opcionais</label>
        <div className="space-y-2">
          {OPCIONAIS_DISPONIVEIS.map((op) => {
            const selecionado = opcionaisSelecionados.some((o) => o.nome === op.nome);
            return (
              <label
                key={op.nome}
                className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selecionado}
                    onChange={() => toggleOpcional(op.nome)}
                    className="w-4 h-4 rounded accent-[#00d084]"
                  />
                  <span className="text-sm font-medium text-gray-700">{op.nome}</span>
                </div>
                <span className="text-sm text-gray-500 flex-shrink-0">+{formatarMoeda(op.valor)}/dia</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Resumo de custo */}
      {totalDias > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>{totalDias} dia{totalDias > 1 ? "s" : ""}</span>
            <span>{formatarMoeda(valorAluguel)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Caução (reembolsável)</span>
            <span>{formatarMoeda(caucaoValor)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-blue-100">
            <span>Total</span>
            <span className="text-[#00d084]">{formatarMoeda(valorTotal)}</span>
          </div>
        </div>
      )}

      {/* Erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
          {erro}
        </div>
      )}

      {/* Botão */}
      <button
        type="submit"
        disabled={isLoading || totalDias === 0}
        className="w-full bg-[#00d084] text-white py-4 rounded-xl font-bold text-base hover:bg-[#00c070] disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
      >
        {isLoading ? "Processando..." : "Reservar Agora"}
      </button>
    </form>
  );
}
