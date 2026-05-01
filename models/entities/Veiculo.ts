export interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  categoria: CategoriaVeiculo;
  status: StatusVeiculo;
  precoDiaria: any;
  caucaoValor: any;
  quilometragem: number;
  cor: string;
  transmissao: string;
  combustivel: string;
  lugares: number;
  descricao: string | null;
  fotos: string[];
  opcionais: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type CategoriaVeiculo = "HATCH" | "SEDA" | "SUV" | "PICKUP" | "ELETRICO" | "VAN";
export type StatusVeiculo = "DISPONIVEL" | "ALUGADO" | "MANUTENCAO";
