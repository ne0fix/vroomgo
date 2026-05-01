import { NextRequest, NextResponse } from "next/server";
import { veiculoService } from "@/services/VeiculoService";
import { FiltroBuscaSchema } from "@/models/dtos/VeiculoDTO";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    const filtros = FiltroBuscaSchema.parse({
      ...params,
      precoMax: params.precoMax ? Number(params.precoMax) : undefined,
      precoMin: params.precoMin ? Number(params.precoMin) : undefined,
      pagina: params.pagina ? Number(params.pagina) : 1,
      porPagina: params.porPagina ? Number(params.porPagina) : 12,
    });

    const resultado = await veiculoService.buscarVeiculos(filtros);
    return NextResponse.json(resultado, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 400 });
  }
}
