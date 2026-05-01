import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pagamentoService } from "@/services/PagamentoService";
import { z } from "zod";

const CheckoutSchema = z.object({ reservaId: z.string().cuid() });

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { reservaId } = CheckoutSchema.parse(body);
    const resultado = await pagamentoService.criarPreferencia(reservaId, session.user.id);

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
}
