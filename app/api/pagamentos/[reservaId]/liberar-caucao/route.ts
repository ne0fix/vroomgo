import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pagamentoService } from "@/services/PagamentoService";
import { z } from "zod";

const LiberarSchema = z.object({
  valorReembolso: z.number().positive().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reservaId: string }> }
) {
  try {
    const { reservaId } = await params;
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ erro: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { valorReembolso } = LiberarSchema.parse(body);
    const resultado = await pagamentoService.liberarCaucao(reservaId, valorReembolso);

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
}
