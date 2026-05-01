import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pagamentoService } from "@/services/PagamentoService";
import { z } from "zod";

const ReterSchema = z.object({ motivo: z.string().min(3) });

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

    const body = await request.json();
    const { motivo } = ReterSchema.parse(body);
    const resultado = await pagamentoService.reterCaucao(reservaId, motivo);

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
}
