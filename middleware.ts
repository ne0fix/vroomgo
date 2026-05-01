import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth(function middleware(request) {
  const session = request.auth;
  const pathname = request.nextUrl.pathname;

  const rotasProtegidas = ["/meus-alugueis", "/checkout", "/reserva"];
  const ehRotaProtegida = rotasProtegidas.some((rota) =>
    pathname.startsWith(rota)
  );

  if (ehRotaProtegida && !session) {
    const callbackUrl = encodeURIComponent(
      pathname + request.nextUrl.search
    );
    return Response.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  if (
    pathname.startsWith("/dashboard") &&
    session?.user?.role !== "ADMIN"
  ) {
    return Response.redirect(new URL("/", request.url));
  }
});

export const config = {
  matcher: [
    "/meus-alugueis/:path*",
    "/checkout/:path*",
    "/reserva/:path*",
    "/dashboard/:path*",
  ],
};
