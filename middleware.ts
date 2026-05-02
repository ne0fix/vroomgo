import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;

  const rotasProtegidas = ["/meus-alugueis", "/checkout", "/reserva"];
  const ehRotaProtegida = rotasProtegidas.some((rota) =>
    pathname.startsWith(rota)
  );

  if (ehRotaProtegida && !token) {
    const callbackUrl = encodeURIComponent(
      pathname + request.nextUrl.search
    );
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  if (pathname.startsWith("/dashboard") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/meus-alugueis/:path*",
    "/checkout/:path*",
    "/reserva/:path*",
    "/dashboard/:path*",
  ],
};
