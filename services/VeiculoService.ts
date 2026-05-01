import { veiculoRepository } from "@/repositories/VeiculoRepository";
import { FiltroBusca, CriarVeiculoDTO } from "@/models/dtos/VeiculoDTO";

export class VeiculoService {
  async buscarVeiculos(filtros: FiltroBusca) {
    return veiculoRepository.findManyComFiltros(filtros);
  }

  async obterVeiculo(id: string) {
    const veiculo = await veiculoRepository.findById(id);
    if (!veiculo) throw new Error("Veículo não encontrado");
    return veiculo;
  }

  async criarVeiculo(data: CriarVeiculoDTO) {
    return veiculoRepository.create(data);
  }

  async atualizarVeiculo(id: string, data: Partial<CriarVeiculoDTO>) {
    await this.obterVeiculo(id);
    return veiculoRepository.update(id, data);
  }

  async removerVeiculo(id: string) {
    await this.obterVeiculo(id);
    return veiculoRepository.delete(id);
  }

  async getEstatisticas() {
    return veiculoRepository.getEstatisticas();
  }
}

export const veiculoService = new VeiculoService();
