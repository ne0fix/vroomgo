"use client";

import { useState } from "react";
import { formatarMoeda } from "@/lib/utils";

interface Props {
  reservaId: string;
  valorTotal: number;
}

export function BotaoPagarMP({ reservaId, valorTotal }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const iniciarPagamento = async () => {
    setIsLoading(true);
    setErro(null);
    try {
      const res = await fetch("/api/pagamentos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.erro || "Erro ao iniciar pagamento");

      // Em desenvolvimento usa sandbox, em produção usa initPoint
      const url = (process.env.NODE_ENV === "production"
        ? data.initPoint
        : data.sandboxInitPoint) || data.initPoint;

      if (!url) throw new Error("URL de pagamento não disponível. Tente novamente.");
      window.location.href = url;
    } catch (err: any) {
      setErro(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {erro && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {erro}
        </div>
      )}
      <button
        onClick={iniciarPagamento}
        disabled={isLoading}
        className="w-full bg-[#009ee3] hover:bg-[#0088cc] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          "Redirecionando..."
        ) : (
          "Pagar Agora"
        )}
      </button>
      <p className="text-xs text-center text-gray-500">
        Você será redirecionado para o ambiente seguro do Mercado Pago.
        Aceitamos cartão de crédito, débito, Pix e boleto.
      </p>
    </div>
  );
}
