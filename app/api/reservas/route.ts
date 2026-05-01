import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { reservaService } from "@/services/ReservaService";
import { CriarReservaSchema } from "@/models/dtos/ReservaDTO";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const data = CriarReservaSchema.parse(body);
    const reserva = await reservaService.criarReserva(session.user.id, data);

    return NextResponse.json(reserva, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
    }

    const reservas = await reservaService.buscarReservasUsuario(session.user.id);
    return NextResponse.json(reservas);
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
}
