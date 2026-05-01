import { z } from "zod";

const dataSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD");

export const CriarReservaSchema = z.object({
  veiculoId: z.string().cuid(),
  dataInicio: dataSchema,
  dataFim: dataSchema,
  opcionais: z.array(z.object({
    nome: z.string(),
    valor: z.number(),
  })),
  observacoes: z.string().optional(),
}).refine((data) => new Date(data.dataFim) > new Date(data.dataInicio), {
  message: "Data de devolução deve ser posterior à data de retirada",
  path: ["dataFim"],
});

export type CriarReservaDTO = z.infer<typeof CriarReservaSchema>;

export const OPCIONAIS_DISPONIVEIS = [
  { nome: "Seguro Completo", valor: 45.00 },
  { nome: "GPS Integrado", valor: 15.00 },
  { nome: "Cadeirinha Infantil", valor: 20.00 },
  { nome: "Motorista Adicional", valor: 30.00 },
  { nome: "Wi-Fi Portátil", valor: 12.00 },
];
