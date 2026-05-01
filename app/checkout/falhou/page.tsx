import Link from "next/link";
import { X } from "lucide-react";

export default function CheckoutFalhouPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Pagamento Não Aprovado
        </h1>
        <p className="text-gray-600 mb-8">
          Não foi possível processar seu pagamento. Verifique os dados do cartão
          ou tente outro método de pagamento.
        </p>
        <div className="space-y-3">
          <Link
            href="/veiculos"
            className="block w-full bg-[#00d084] text-white py-3 rounded-xl font-semibold hover:bg-[#00c070] transition-colors"
          >
            Tentar Novamente
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
