import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Car } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="border-b border-gray-800 py-10 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">

            {/* Brand */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-2 lg:mb-0">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-[#00d084] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Car className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">VroomGo</h3>
              </Link>
              <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                A melhor solução para aluguel de veículos com qualidade e segurança.
              </p>
              <div className="flex gap-3">
                {[Facebook, Instagram, Twitter].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#00d084] hover:bg-gray-700 transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Empresa</h4>
              <ul className="space-y-2.5 text-sm">
                {["Sobre Nós", "Nossa Frota", "Carreiras", "Blog"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-[#00d084] transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Serviços */}
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Serviços</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/veiculos" className="text-gray-400 hover:text-[#00d084] transition-colors">
                    Aluguel de Carros
                  </Link>
                </li>
                {["Seguros", "Viagens", "Promoções"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-[#00d084] transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Legal</h4>
              <ul className="space-y-2.5 text-sm">
                {["Termos de Uso", "Privacidade", "Cookies", "Segurança"].map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-gray-400 hover:text-[#00d084] transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Contato</h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#00d084]" />
                  <span className="text-gray-400">+55 (11) 3456-7890</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#00d084]" />
                  <span className="text-gray-400 break-all">contato@vroomgo.com.br</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#00d084]" />
                  <span className="text-gray-400">São Paulo, SP</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="bg-black py-5 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="text-gray-400 text-xs md:text-sm">
              &copy; {currentYear} VroomGo. Todos os direitos reservados.
            </p>
            <p className="text-gray-400 text-xs md:text-sm">
              Desenvolvido com ❤️ pela <span className="text-[#00d084] font-semibold">VroomGo Team</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
