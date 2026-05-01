import Link from "next/link";
import { auth } from "@/lib/auth";
import { Car, User, Menu } from "lucide-react";
import { NavbarMobile } from "./NavbarMobile";
import { LogoutButton } from "./LogoutButton";

export async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
            <div className="w-8 h-8 bg-[#00d084] rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            VroomGo
          </Link>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/veiculos" className="text-gray-600 hover:text-[#00d084] font-medium transition-colors">
              Veículos
            </Link>
            {session?.user && (
              <Link href="/meus-alugueis" className="text-gray-600 hover:text-[#00d084] font-medium transition-colors">
                Meus Aluguéis
              </Link>
            )}
            {session?.user?.role === "ADMIN" && (
              <Link href="/dashboard" className="text-gray-600 hover:text-[#00d084] font-medium transition-colors">
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth buttons desktop */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-8 bg-[#00d084] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-900">
                    {session.user.name?.split(" ")[0]}
                  </span>
                </div>
                <LogoutButton />
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-[#00d084] font-medium text-sm transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="bg-[#00d084] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-[#00c070] transition-colors"
                >
                  Criar Conta
                </Link>
              </>
            )}
          </div>

          {/* Menu mobile — client component */}
          <NavbarMobile session={session} />
        </div>
      </div>
    </nav>
  );
}
