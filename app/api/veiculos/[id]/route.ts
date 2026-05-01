import { NextRequest, NextResponse } from "next/server";
import { veiculoService } from "@/services/VeiculoService";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const veiculo = await veiculoService.obterVeiculo(id);
    return NextResponse.json(veiculo);
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 404 });
  }
}
