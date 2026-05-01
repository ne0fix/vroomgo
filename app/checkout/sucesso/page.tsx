// Server Component — recebe query params do MP após pagamento aprovado
import Link from "next/link";
import { Check } from "lucide-react";

interface Props {
  searchParams: Promise<{
    collection_id?: string;         // payment_id
    collection_status?: string;     // approved
    payment_id?: string;
    status?: string;
    external_reference?: string;
    payment_type?: string;
    merchant_order_id?: string;
    preference_id?: string;
  }>;
}

export default async function CheckoutSucessoPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Pagamento Confirmado!
        </h1>
        <p className="text-gray-600 mb-2">
          Seu pagamento foi aprovado com sucesso.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Você receberá a confirmação da reserva em breve.
          {params.payment_id && (
            <> ID do pagamento: <code className="font-mono">{params.payment_id}</code></>
          )}
        </p>
        <div className="space-y-3">
          <Link
            href="/meus-alugueis"
            className="block w-full bg-[#00d084] text-white py-3 rounded-xl font-semibold hover:bg-[#00c070] transition-colors"
          >
            Ver Meus Aluguéis
          </Link>
          <Link
            href="/"
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </main>
  );
}
