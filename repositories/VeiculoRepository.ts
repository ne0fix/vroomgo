import { prisma } from "@/lib/prisma";
import { FiltroBusca } from "@/models/dtos/VeiculoDTO";
import { CriarVeiculoDTO } from "@/models/dtos/VeiculoDTO";
import { Prisma } from "@prisma/client";

export class VeiculoRepository {
  async findManyComFiltros(filtros: FiltroBusca) {
    const where: Prisma.VeiculoWhereInput = {
      status: "DISPONIVEL",
    };

    if (filtros.categoria) where.categoria = filtros.categoria as any;
    if (filtros.precoMax) where.precoDiaria = { lte: filtros.precoMax };
    if (filtros.precoMin) where.precoDiaria = { ...(where.precoDiaria as object), gte: filtros.precoMin };
    if (filtros.busca) {
      where.OR = [
        { marca: { contains: filtros.busca, mode: "insensitive" } },
        { modelo: { contains: filtros.busca, mode: "insensitive" } },
      ];
    }

    if (filtros.dataInicio && filtros.dataFim) {
      where.reservas = {
        none: {
          AND: [
            { status: { in: ["CONFIRMADA", "ATIVA"] } },
            { dataInicio: { lte: new Date(filtros.dataFim) } },
            { dataFim: { gte: new Date(filtros.dataInicio) } },
          ],
        },
      };
    }

    const [veiculos, total] = await Promise.all([
      prisma.veiculo.findMany({
        where,
        skip: (filtros.pagina - 1) * filtros.porPagina,
        take: filtros.porPagina,
        orderBy: { precoDiaria: "asc" },
      }),
      prisma.veiculo.count({ where }),
    ]);

    return { veiculos, total, paginas: Math.ceil(total / filtros.porPagina) };
  }

  async findById(id: string) {
    return prisma.veiculo.findUnique({ where: { id } });
  }

  async create(data: CriarVeiculoDTO) {
    return prisma.veiculo.create({
      data: {
        ...data,
        precoDiaria: data.precoDiaria,
        caucaoValor: data.caucaoValor,
      },
    });
  }

  async update(id: string, data: Partial<CriarVeiculoDTO>) {
    return prisma.veiculo.update({ where: { id }, data: data as any });
  }

  async updateStatus(id: string, status: "DISPONIVEL" | "ALUGADO" | "MANUTENCAO") {
    return prisma.veiculo.update({ where: { id }, data: { status } });
  }

  async delete(id: string) {
    return prisma.veiculo.delete({ where: { id } });
  }

  async getEstatisticas() {
    const [total, disponiveis, alugados, manutencao] = await Promise.all([
      prisma.veiculo.count(),
      prisma.veiculo.count({ where: { status: "DISPONIVEL" } }),
      prisma.veiculo.count({ where: { status: "ALUGADO" } }),
      prisma.veiculo.count({ where: { status: "MANUTENCAO" } }),
    ]);
    return { total, disponiveis, alugados, manutencao };
  }
}

export const veiculoRepository = new VeiculoRepository();
