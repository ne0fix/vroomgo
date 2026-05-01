import { prisma } from '@/lib/prisma';
import { CadastroSchema } from '@/models/dtos/AuthDTO';
import bcryptjs from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar com Zod
    const validacao = CadastroSchema.safeParse(body);
    if (!validacao.success) {
      return NextResponse.json(
        { erro: 'Dados inválidos', detalhes: validacao.error.issues },
        { status: 400 }
      );
    }

    const { nome, email, senha } = validacao.data;

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return NextResponse.json(
        { erro: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    // Hash da senha
    const senhaHash = await bcryptjs.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        role: 'CLIENTE',
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        sucesso: true,
        mensagem: 'Cadastro realizado com sucesso',
        usuario,
      },
      { status: 201 }
    );
  } catch (erro) {
    console.error('Erro ao registrar:', erro);
    return NextResponse.json(
      { erro: 'Erro ao processar cadastro' },
      { status: 500 }
    );
  }
}
