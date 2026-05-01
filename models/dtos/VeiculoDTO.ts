import { z } from "zod";
import { CategoriaVeiculo } from "../entities/Veiculo";

export const FiltroBuscaSchema = z.object({
  categoria: z.enum(["HATCH", "SEDA", "SUV", "PICKUP", "ELETRICO", "VAN"]).optional(),
  precoMax: z.number().positive().optional(),
  precoMin: z.number().positive().optional(),
  dataInicio: z.string().datetime().optional(),
  dataFim: z.string().datetime().optional(),
  busca: z.string().optional(),
  pagina: z.number().default(1),
  porPagina: z.number().default(12),
});

export type FiltroBusca = z.infer<typeof FiltroBuscaSchema>;

export const CriarVeiculoSchema = z.object({
  marca: z.string().min(2, "Marca obrigatória"),
  modelo: z.string().min(2, "Modelo obrigatório"),
  ano: z.number().min(2000).max(new Date().getFullYear() + 1),
  placa: z.string().regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, "Placa inválida (formato Mercosul)"),
  categoria: z.enum(["HATCH", "SEDA", "SUV", "PICKUP", "ELETRICO", "VAN"]),
  precoDiaria: z.number().positive("Preço deve ser positivo"),
  caucaoValor: z.number().positive("Caução deve ser positiva"),
  cor: z.string().min(2),
  transmissao: z.enum(["MANUAL", "AUTOMATICO"]).default("AUTOMATICO"),
  combustivel: z.enum(["FLEX", "GASOLINA", "DIESEL", "ELETRICO", "HIBRIDO"]).default("FLEX"),
  lugares: z.number().min(2).max(12).default(5),
  descricao: z.string().optional(),
  opcionais: z.array(z.string()).default([]),
});

export type CriarVeiculoDTO = z.infer<typeof CriarVeiculoSchema>;
