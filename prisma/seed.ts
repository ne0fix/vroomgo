import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Limpar dados existentes
  await prisma.transacao.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.veiculo.deleteMany();

  // Criar veículos de exemplo
  const veiculos = [
    {
      marca: "Volkswagen", modelo: "Gol", ano: 2023, placa: "ABC1234",
      categoria: "HATCH" as const, status: "DISPONIVEL" as const,
      precoDiaria: 89.90, caucaoValor: 500.00,
      quilometragem: 15000, cor: "Branco",
      transmissao: "MANUAL" as const, combustivel: "FLEX", lugares: 5,
      descricao: "Econômico e confiável, ideal para cidade.",
      fotos: ["https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800"],
      opcionais: ["Ar-condicionado"],
    },
    {
      marca: "Toyota", modelo: "Corolla", ano: 2024, placa: "DEF5678",
      categoria: "SEDA" as const, status: "DISPONIVEL" as const,
      precoDiaria: 159.90, caucaoValor: 800.00,
      quilometragem: 8000, cor: "Prata",
      transmissao: "AUTOMATICO" as const, combustivel: "FLEX", lugares: 5,
      descricao: "Sedan executivo com acabamento premium.",
      fotos: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800"],
      opcionais: ["Ar-condicionado", "Câmera de ré", "Sensor de estacionamento"],
    },
    {
      marca: "Jeep", modelo: "Renegade", ano: 2023, placa: "GHI9012",
      categoria: "SUV" as const, status: "DISPONIVEL" as const,
      precoDiaria: 199.90, caucaoValor: 1000.00,
      quilometragem: 22000, cor: "Preto",
      transmissao: "AUTOMATICO" as const, combustivel: "FLEX", lugares: 5,
      descricao: "SUV aventureiro e espaçoso.",
      fotos: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"],
      opcionais: ["Ar-condicionado", "4x4", "Teto solar"],
    },
    {
      marca: "Ford", modelo: "Ranger", ano: 2024, placa: "JKL3456",
      categoria: "PICKUP" as const, status: "DISPONIVEL" as const,
      precoDiaria: 249.90, caucaoValor: 1200.00,
      quilometragem: 5000, cor: "Cinza",
      transmissao: "AUTOMATICO" as const, combustivel: "DIESEL", lugares: 5,
      descricao: "Pickup robusta para trabalho e lazer.",
      fotos: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
      opcionais: ["Ar-condicionado", "Câmera de ré", "Capota marítima"],
    },
    {
      marca: "BYD", modelo: "Dolphin", ano: 2024, placa: "MNO7890",
      categoria: "ELETRICO" as const, status: "DISPONIVEL" as const,
      precoDiaria: 299.90, caucaoValor: 1500.00,
      quilometragem: 3000, cor: "Azul",
      transmissao: "AUTOMATICO" as const, combustivel: "ELETRICO", lugares: 5,
      descricao: "100% elétrico com autonomia de 400km.",
      fotos: ["https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800"],
      opcionais: ["Ar-condicionado", "Carregador rápido", "Piloto automático"],
    },
    {
      marca: "Fiat", modelo: "Doblo", ano: 2023, placa: "PQR1234",
      categoria: "VAN" as const, status: "DISPONIVEL" as const,
      precoDiaria: 179.90, caucaoValor: 900.00,
      quilometragem: 30000, cor: "Branco",
      transmissao: "MANUAL" as const, combustivel: "FLEX", lugares: 7,
      descricao: "Ideal para grupos e famílias numerosas.",
      fotos: ["https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800"],
      opcionais: ["Ar-condicionado", "Bagageiro no teto"],
    },
  ];

  for (const veiculo of veiculos) {
    await prisma.veiculo.create({ data: veiculo });
  }

  console.log("Seed concluído com sucesso!");
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
    pool.end();
  });
