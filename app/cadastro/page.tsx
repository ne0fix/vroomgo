'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Check, Loader, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function CadastroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [mostraSenha, setMostraSenha] = useState(false);
  const [mostraConfirmar, setMostraConfirmar] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      setErro('Nome é obrigatório');
      return false;
    }
    if (!formData.email.includes('@')) {
      setErro('Email inválido');
      return false;
    }
    if (formData.senha.length < 6) {
      setErro('Senha deve ter no mínimo 6 caracteres');
      return false;
    }
    if (formData.senha !== formData.confirmarSenha) {
      setErro('Senhas não correspondem');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);

    if (!validarFormulario()) return;

    setCarregando(true);

    try {
      // Cadastrar usuário
      const resposta = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
        }),
      });

      if (!resposta.ok) {
        const dados = await resposta.json();
        setErro(dados.erro || 'Erro ao cadastrar');
        setCarregando(false);
        return;
      }

      setSucesso(true);

      // Aguardar um pouco antes de fazer login automático
      setTimeout(async () => {
        const resultado = await signIn('credentials', {
          email: formData.email,
          senha: formData.senha,
          redirect: false,
        });

        if (resultado?.ok) {
          router.push(callbackUrl);
        } else {
          router.push(`/login?callbackUrl=${callbackUrl}`);
        }
      }, 1500);
    } catch (erro) {
      console.error('Erro ao cadastrar:', erro);
      setErro('Ocorreu um erro. Tente novamente.');
      setCarregando(false);
    }
  };

  if (sucesso) {
    return (
      <main className="bg-gradient-to-b from-gray-900 to-black min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-[#00d084] flex items-center justify-center animate-pulse">
                <Check className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastro realizado!</h2>
              <p className="text-gray-600">Entrando na sua conta...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

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
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Criar conta</h1>
            <p className="text-green-50 text-sm">Cadastre-se para começar a alugar carros</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            {/* Error Alert */}
            {erro && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{erro}</p>
              </div>
            )}

            {/* Nome */}
            <div>
              <label htmlFor="nome" className="block text-sm font-semibold text-gray-900 mb-2">
                Nome completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="João Silva"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#00d084] focus:ring-2 focus:ring-[#00d08420] transition-all"
                  disabled={carregando}
                />
              </div>
            </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#00d084] focus:ring-2 focus:ring-[#00d08420] transition-all"
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
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
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

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmarSenha" className="block text-sm font-semibold text-gray-900 mb-2">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={mostraConfirmar ? 'text' : 'password'}
                  id="confirmarSenha"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#00d084] focus:ring-2 focus:ring-[#00d08420] transition-all"
                  disabled={carregando}
                />
                <button
                  type="button"
                  onClick={() => setMostraConfirmar(!mostraConfirmar)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={carregando}
                >
                  {mostraConfirmar ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-[#00d084] text-white py-3 rounded-xl font-bold text-lg hover:bg-[#00c070] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {carregando ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                'Criar conta'
              )}
            </button>

            {/* Link para login */}
            <p className="text-center text-gray-600 text-sm">
              Já tem conta?{' '}
              <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-[#00d084] font-semibold hover:underline">
                Faça login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
