import Link from "next/link";
import { Clock } from "lucide-react";

export default function CheckoutPendentePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Pagamento em Análise
        </h1>
        <p className="text-gray-600 mb-2">
          Seu pagamento está sendo processado.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Isso pode acontecer com Pix ou boleto. Você receberá uma notificação
          assim que o pagamento for confirmado.
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
