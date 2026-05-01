import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.transacao.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.veiculo.deleteMany();

  const veiculos = [
    {
      marca: "Fiat", modelo: "Argo", ano: 2024, placa: "AAA1A11",
      categoria: "HATCH" as const, precoDiaria: 79.90, caucaoValor: 400.00,
      quilometragem: 12000, cor: "Vermelho", transmissao: "MANUAL", combustivel: "FLEX", lugares: 5,
      descricao: "Compacto e econômico, perfeito para a cidade.",
      fotos: ["/images/carros/ARGO.png"], opcionais: ["Ar-condicionado", "Direção Hidráulica"],
    },
    {
      marca: "Fiat", modelo: "Mobi", ano: 2023, placa: "BBB2B22",
      categoria: "HATCH" as const, precoDiaria: 69.90, caucaoValor: 350.00,
      quilometragem: 20000, cor: "Branco", transmissao: "MANUAL", combustivel: "FLEX", lugares: 5,
      descricao: "Econômico e confiável para viagens diárias.",
      fotos: ["/images/carros/MOBI.png"], opcionais: ["Vidro Elétrico", "Porta Malas 210L"],
    },
    {
      marca: "Volkswagen", modelo: "Polo", ano: 2024, placa: "CCC3C33",
      categoria: "HATCH" as const, precoDiaria: 89.90, caucaoValor: 450.00,
      quilometragem: 8000, cor: "Prata", transmissao: "AUTOMATICO", combustivel: "FLEX", lugares: 5,
      descricao: "Qualidade alemã em um carro compacto.",
      fotos: ["/images/carros/POLO.png"], opcionais: ["Ar Automático", "Direção Hidráulica"],
    },
    {
      marca: "Volkswagen", modelo: "Golf", ano: 2023, placa: "DDD4D44",
      categoria: "HATCH" as const, precoDiaria: 99.90, caucaoValor: 500.00,
      quilometragem: 15000, cor: "Cinza", transmissao: "AUTOMATICO", combustivel: "FLEX", lugares: 5,
      descricao: "Clássico confortável e bem equipado.",
      fotos: ["/images/carros/GOLC.png"], opcionais: ["Teto Solar", "Som Premium"],
    },
    {
      marca: "Hyundai", modelo: "HB20", ano: 2024, placa: "EEE5E55",
      categoria: "HATCH" as const, precoDiaria: 79.90, caucaoValor: 400.00,
      quilometragem: 10000, cor: "Azul", transmissao: "MANUAL", combustivel: "FLEX", lugares: 5,
      descricao: "Confiável e econômico para o dia a dia.",
      fotos: ["/images/carros/HB20.png"], opcionais: ["Vidro Elétrico", "Ar-condicionado"],
    },
    {
      marca: "Hyundai", modelo: "HB20 1.0", ano: 2023, placa: "FFF6F66",
      categoria: "HATCH" as const, precoDiaria: 74.90, caucaoValor: 370.00,
      quilometragem: 18000, cor: "Branco", transmissao: "MANUAL", combustivel: "FLEX", lugares: 5,
      descricao: "Versão básica e econômica do HB20.",
      fotos: ["/images/carros/HB1X.png"], opcionais: ["Ar-condicionado", "Vidro Elétrico"],
    },
    {
      marca: "Hyundai", modelo: "HB20 Comfort", ano: 2023, placa: "GGG7G77",
      categoria: "HATCH" as const, precoDiaria: 99.90, caucaoValor: 500.00,
      quilometragem: 11000, cor: "Prata", transmissao: "AUTOMATICO", combustivel: "FLEX", lugares: 5,
      descricao: "Versão confortável com mais equipamentos.",
      fotos: ["/images/carros/HB2C.png"], opcionais: ["Ar Automático", "Direção Hidráulica"],
    },
    {
      marca: "Hyundai", modelo: "HB20 Premium", ano: 2024, placa: "HHH8H88",
      categoria: "HATCH" as const, precoDiaria: 119.90, caucaoValor: 600.00,
      quilometragem: 5000, cor: "Preto", transmissao: "AUTOMATICO", combustivel: "FLEX", lugares: 5,
      descricao: "Versão premium do HB20 com todos os acessórios.",
      fotos: ["/images/carros/HB2H.png"], opcionais: ["Teto Solar", "Som Premium"],
    },
    {
      marca: "Citroën", modelo: "C3", ano: 2023, placa: "III9I99",
      categoria: "HATCH" as const, precoDiaria: 119.90, caucaoValor: 600.00,
      quilometragem: 13000, cor: "Vermelho", transmissao: "AUTOMATICO", combustivel: "FLEX", lugares: 5,
      descricao: "Confortável e bem equipado.",
      fotos: ["/images/carros/CTC3.png"], opcionais: ["Ar Automático", "Bancos Conforto"],
    },
    {
      marca: "Chevrolet", modelo: "Onix", ano: 2023, placa: "JJJ1J10",
      categoria: "HATCH" as const, precoDiaria: 84.90, caucaoValor: 420.00,
      quilometragem: 22000, cor: "Branco", transmissao: "MANUAL", combustivel: "FLEX", lugares: 5,
      descricao: "SUV compacto e ágil.",
      fotos: ["/images/carros/ONIS.png"], opcionais: ["Vidro Elétrico", "Ar-condicionado"],
    },
    {
      marca: "Chevrolet", modelo: "Onix Turbo", ano: 2024, placa: "KKK2K20",
      categoria: "HATCH" as const, precoDiaria: 109.90, caucaoValor: 550.00,
      quilometragem: 7000, cor: "Cinza", transmissao: "AUTOMATICO", combustivel: "FLEX", lugares: 5,
      descricao: "Compacto com desempenho potente.",
      fotos: ["/images/carros/ONIT.png"], opcionais: ["Motor Turbo", "Ar Automático"],
    },
    {
      marca: "Volkswagen", modelo: "Polo Advantage", ano: 2023, placa: "LLL3L30",
      categoria: "HATCH" as const, precoDiaria: 109.90, caucaoValor: 550.00,
      quilometragem: 9000, cor: "Prata", transmissao: "AUTOMATICO", combustivel: "FLEX", lugares: 5,
      descricao: "Qualidade premium por um preço justo.",
      fotos: ["/images/carros/POLA.png"], opcionais: ["Ar Automático", "Bancos Conforto"],
    },
    {
      marca: "Chevrolet", modelo: "Onix Plus", ano: 2024, placa: "MMM4M40",
      categoria: "SEDA" as const, precoDiaria: 129.90, caucaoValor: 650.00,
      quilometragem: 6000, cor: "Preto", transmissao: "AUTOMATICO", combustivel: "FLEX", lugares: 5,
      descricao: "Sedan confortável e bem equipado.",
      fotos: ["/images/carros/ONIC.png"], opcionais: ["Banco Couro", "Teto Solar"],
    },
    {
      marca: "Chevrolet", modelo: "Onix Plus Turbo", ano: 2024, placa: "NNN5N50",
      categoria: "SEDA" as const, precoDiaria: 149.90, caucaoValor: 750.00,
      quilometragem: 4000, cor: "Vermelho", transmissao: "AUTOMATICO", combustivel: "FLEX", lugares: 5,
      descricao: "Sedan premium com motor potente.",
      fotos: ["/images/carros/ONIH.png"], opcionais: ["Motor Turbo", "Som Premium"],
    },
    {
      marca: "Hyundai", modelo: "Creta", ano: 2024, placa: "OOO6O60",
      categoria: "SUV" as const, precoDiaria: 199.90, caucaoValor: 1000.00,
      quilometragem: 8000, cor: "Preto", transmissao: "AUTOMATICO", combustivel: "FLEX", lugares: 5,
      descricao: "SUV moderno e potente.",
      fotos: ["/images/carros/CRON.png"], opcionais: ["Tração 4x4", "Teto Panorâmico"],
    },
    {
      marca: "Honda", modelo: "CR-V", ano: 2024, placa: "PPP7P70",
      categoria: "SUV" as const, precoDiaria: 229.90, caucaoValor: 1150.00,
      quilometragem: 5000, cor: "Prata", transmissao: "AUTOMATICO", combustivel: "FLEX", lugares: 5,
      descricao: "SUV premium com tecnologia avançada.",
      fotos: ["/images/carros/CROX.png"], opcionais: ["All Wheel Drive", "Navegação GPS"],
    },
    {
      marca: "Hyundai", modelo: "Santa Fe", ano: 2024, placa: "QQQ8Q80",
      categoria: "SUV" as const, precoDiaria: 249.90, caucaoValor: 1250.00,
      quilometragem: 6000, cor: "Branco", transmissao: "AUTOMATICO", combustivel: "GASOLINA", lugares: 7,
      descricao: "Executivo espaçoso e tecnológico.",
      fotos: ["/images/carros/SANX.png"], opcionais: ["7 Lugares", "Teto Panorâmico", "GPS Integrado"],
    },
    {
      marca: "Cygnus", modelo: "Hybrid", ano: 2024, placa: "RRR9R90",
      categoria: "HATCH" as const, precoDiaria: 159.90, caucaoValor: 800.00,
      quilometragem: 3000, cor: "Azul", transmissao: "AUTOMATICO", combustivel: "HIBRIDO", lugares: 5,
      descricao: "Executivo sustentável e econômico.",
      fotos: ["/images/carros/CYHB.png"], opcionais: ["Motor Híbrido", "Eficiência Energética"],
    },
    {
      marca: "Citroën", modelo: "C3 Picasso", ano: 2023, placa: "SSS1S01",
      categoria: "VAN" as const, precoDiaria: 179.90, caucaoValor: 900.00,
      quilometragem: 25000, cor: "Branco", transmissao: "AUTOMATICO", combustivel: "FLEX", lugares: 7,
      descricao: "Minivan familiar com conforto premium.",
      fotos: ["/images/carros/CROM.png"], opcionais: ["7 Lugares", "Teto Panorâmico", "Bancos Couro"],
    },
  ];

  for (const veiculo of veiculos) {
    await prisma.veiculo.create({ data: veiculo });
  }

  console.log(`Seed concluído: ${veiculos.length} veículos criados.`);
}

main()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
    pool.end();
  });
