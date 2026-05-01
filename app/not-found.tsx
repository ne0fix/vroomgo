import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="bg-gradient-to-b from-gray-900 to-black min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="relative inline-block">
            <h1 className="text-9xl md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00d084] to-[#00ff41] leading-none">
              404
            </h1>
            <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-[#00d084]/20 to-[#00ff41]/20 rounded-full -z-10"></div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Oops! Página não encontrada</h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-4">
            Parece que o carro que você procura saiu da garagem. A página que você está tentando acessar não existe ou foi removida.
          </p>
          <p className="text-gray-500 text-base">
            Mas não se preocupe, você pode voltar à nossa frota e encontrar o veículo perfeito!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#00d084] to-[#00c070] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-[#00d084]/50 transition-all transform hover:scale-105 active:scale-95"
          >
            <Home className="w-5 h-5" />
            Voltar para Home
          </Link>

          <Link
            href="/veiculos"
            className="inline-flex items-center justify-center gap-2 bg-white/10 border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
          >
            Ver Veículos
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Help Text */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <p className="text-gray-300 mb-3">Precisa de ajuda?</p>
          <p className="text-gray-400">Entre em contato com nosso suporte: <span className="text-[#00d084] font-semibold">+55 (11) 3456-7890</span></p>
        </div>
      </div>
    </main>
  );
}
