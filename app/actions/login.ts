'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

export async function autenticar(
  email: string,
  senha: string
): Promise<{ erro?: string }> {
  try {
    await signIn('credentials', { email, senha, redirect: false })
    return {}
  } catch (error) {
    if (error instanceof AuthError) {
      return { erro: 'Email ou senha inválidos.' }
    }
    return { erro: 'Ocorreu um erro. Tente novamente.' }
  }
}
