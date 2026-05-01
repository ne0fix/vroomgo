"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { signOut } from "next-auth/react";

interface NavbarMobileProps {
  session: any;
}

export function NavbarMobile({ session }: NavbarMobileProps) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setAberto(!aberto)}
        className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
        aria-label={aberto ? "Fechar menu" : "Abrir menu"}
      >
        {aberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {aberto && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setAberto(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ${
          aberto ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header do drawer */}
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-gray-900 text-lg">Menu</span>
          <button
            onClick={() => setAberto(false)}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <nav className="p-4 space-y-1">
          <Link
            href="/veiculos"
            onClick={() => setAberto(false)}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Veículos
          </Link>

          {session?.user && (
            <Link
              href="/meus-alugueis"
              onClick={() => setAberto(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Meus Aluguéis
            </Link>
          )}

          {session?.user?.role === "ADMIN" && (
            <Link
              href="/dashboard"
              onClick={() => setAberto(false)}
              className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Auth */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          {session?.user ? (
            <div className="space-y-3">
              <div className="px-4 py-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Logado como</p>
                <p className="font-semibold text-gray-900 truncate">{session.user.name}</p>
              </div>
              <button
                onClick={() => { setAberto(false); signOut({ callbackUrl: "/" }); }}
                className="w-full py-3 text-red-600 font-semibold border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
              >
                Sair da conta
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setAberto(false)}
                className="block w-full text-center py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/cadastro"
                onClick={() => setAberto(false)}
                className="block w-full text-center py-3 bg-[#00d084] text-white font-semibold rounded-xl hover:bg-[#00c070] transition-colors"
              >
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
