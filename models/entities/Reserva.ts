import { Veiculo } from "./Veiculo";
import { Usuario } from "./Usuario";

export interface Reserva {
  id: string;
  usuarioId: string;
  veiculoId: string;
  dataInicio: Date;
  dataFim: Date;
  totalDias: number;
  valorDiaria: any;
  valorTotal: any;
  valorCaucao: any;
  opcionais: any;
  status: StatusReserva;
  observacoes: string | null;
  createdAt: Date;
  updatedAt: Date;
  usuario?: Usuario;
  veiculo?: Veiculo;
}

export interface OpcionalReserva {
  nome: string;
  valor: number;
}

export type StatusReserva = "PENDENTE" | "CONFIRMADA" | "ATIVA" | "CONCLUIDA" | "CANCELADA";
