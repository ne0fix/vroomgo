"use client";

import { Reserva } from "@/models/entities/Reserva";
import { formatarData, formatarMoeda } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface Props {
  reserva: Reserva;
}

export function CartaoReserva({ reserva }: Props) {
  const { veiculo } = reserva;

  return (
    <div className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
      {veiculo && (
        <div className="flex items-center gap-4 mb-4">
          <div className="relative h-16 w-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {veiculo.fotos[0] ? (
              <Image src={veiculo.fotos[0]} alt="" fill className="object-cover" />
            ) : (
              <span className="flex items-center justify-center h-full">🚗</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{veiculo.marca} {veiculo.modelo}</h3>
            <p className="text-sm text-gray-500">Ref: {reserva.id.slice(-6).toUpperCase()}</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
        <div>
          <span className="text-gray-500 block text-xs">Retirada</span>
          {formatarData(reserva.dataInicio)}
        </div>
        <div>
          <span className="text-gray-500 block text-xs">Devolução</span>
          {formatarData(reserva.dataFim)}
        </div>
        <div>
          <span className="text-gray-500 block text-xs">Status</span>
          <span className="font-medium">{reserva.status}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs">Total</span>
          <span className="font-bold text-blue-600">{formatarMoeda(Number(reserva.valorTotal))}</span>
        </div>
      </div>
      <div className="border-t pt-4 text-right">
        <Link href={`/reserva/${reserva.id}`} className="text-sm text-blue-600 font-medium hover:underline">
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}
