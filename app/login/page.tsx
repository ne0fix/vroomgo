'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Loader, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { autenticar } from '@/app/actions/login';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostraSenha, setMostraSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!email.trim()) {
      setErro('Informe o e-mail.');
      return;
    }
    if (!senha) {
      setErro('Informe a senha.');
      return;
    }

    setCarregando(true);

    const resultado = await autenticar(email, senha);

    if (resultado.erro) {
      setErro(resultado.erro);
      setCarregando(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <main className="bg-gradient-to-b from-gray-900 to-black min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Vroom<span className="text-[#00d084]">Go</span>
            </h2>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00d084] to-[#00c070] px-8 py-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Bem-vindo de volta!</h1>
            <p className="text-green-50 text-sm">Faça login para acessar sua conta e reservar um veículo</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            {/* Error Alert */}
            {erro && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{erro}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#00d084] focus:ring-2 focus:ring-[#00d08420] transition-all"
                  required
                  disabled={carregando}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-semibold text-gray-900 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={mostraSenha ? 'text' : 'password'}
                  id="senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#00d084] focus:ring-2 focus:ring-[#00d08420] transition-all"
                  required
                  disabled={carregando}
                />
                <button
                  type="button"
                  onClick={() => setMostraSenha(!mostraSenha)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={carregando}
                >
                  {mostraSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-[#00d084] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#00c070] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {carregando ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>

            {/* Links */}
            <div className="text-center space-y-2">
              <p className="text-gray-600 text-sm">
                Não tem conta?{' '}
                <Link href={`/cadastro?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-[#00d084] font-semibold hover:underline">
                  Cadastre-se aqui
                </Link>
              </p>
              <Link href="/" className="block text-gray-500 text-sm hover:text-gray-700">
                Voltar para home
              </Link>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-white/10 border border-white/20 rounded-2xl p-6 text-center backdrop-blur-sm">
          <p className="text-gray-300 text-sm">
            Credenciais de teste: use qualquer email e senha para se registrar
          </p>
        </div>
      </div>
    </main>
  );
}
