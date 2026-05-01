import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;

  // Rotas que precisam de autenticação
  const rotasProtegidas = ['/meus-alugueis', '/checkout', '/reserva'];
  const ehRotaProtegida = rotasProtegidas.some(rota => pathname.startsWith(rota));

  if (ehRotaProtegida && !session) {
    // Redirecionar para login com callbackUrl
    const callbackUrl = encodeURIComponent(pathname + request.nextUrl.search);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  // Rotas admin
  if (pathname.startsWith('/dashboard') && session?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/meus-alugueis/:path*',
    '/checkout/:path*',
    '/reserva/:path*',
    '/dashboard/:path*',
  ],
};
