export interface Veiculo {
  id: string;
  nome: string;
  modelo: string;
  categoria: string;
  imagem: string;
  precoDiaria: number;
  assentos: number;
  cambio: string;
  combustivel: string;
  avaliacao: number;
  avaliacoes: number;
  caracteristicas: string[];
  descricao: string;
}

export const VEICULOS: Veiculo[] = [
  // Econômico
  {
    id: "argo",
    nome: "FIAT Argo",
    modelo: "2024",
    categoria: "Econômico",
    imagem: "/images/carros/ARGO.png",
    precoDiaria: 79.90,
    assentos: 5,
    cambio: "Manual",
    combustivel: "Gasolina",
    avaliacao: 4.5,
    avaliacoes: 128,
    caracteristicas: ["5 Lugares", "Ar Condicionado", "Direção Hidráulica"],
    descricao: "Carro compacto e econômico, perfeito para a cidade"
  },
  {
    id: "mobi",
    nome: "Chevrolet Mobi",
    modelo: "2023",
    categoria: "Econômico",
    imagem: "/images/carros/MOBI.png",
    precoDiaria: 69.90,
    assentos: 5,
    cambio: "Manual",
    combustivel: "Gasolina",
    avaliacao: 4.3,
    avaliacoes: 95,
    caracteristicas: ["5 Lugares", "Vidro Elétrico", "Porta Malas 210L"],
    descricao: "Econômico e confiável para viagens diárias"
  },
  {
    id: "polo",
    nome: "Volkswagen Polo",
    modelo: "2024",
    categoria: "Econômico",
    imagem: "/images/carros/POLO.png",
    precoDiaria: 89.90,
    assentos: 5,
    cambio: "Automático",
    combustivel: "Gasolina",
    avaliacao: 4.7,
    avaliacoes: 156,
    caracteristicas: ["5 Lugares", "Ar Automático", "Direção Hidráulica"],
    descricao: "Qualidade alemã em um carro compacto"
  },
  {
    id: "golc",
    nome: "Volkswagen Golf",
    modelo: "2023",
    categoria: "Econômico",
    imagem: "/images/carros/GOLC.png",
    precoDiaria: 99.90,
    assentos: 5,
    cambio: "Automático",
    combustivel: "Gasolina",
    avaliacao: 4.8,
    avaliacoes: 203,
    caracteristicas: ["5 Lugares", "Teto Solar", "Som Premium"],
    descricao: "Clássico confortável e bem equipado"
  },
  {
    id: "cysd",
    nome: "Cygnus Sedan",
    modelo: "2023",
    categoria: "Econômico",
    imagem: "/images/carros/CYSD.png",
    precoDiaria: 85.90,
    assentos: 5,
    cambio: "Manual",
    combustivel: "Gasolina",
    avaliacao: 4.4,
    avaliacoes: 112,
    caracteristicas: ["5 Lugares", "Ar Condicionado", "Porta Malas Grande"],
    descricao: "Sedan confortável por um preço acessível"
  },
  {
    id: "hb20",
    nome: "Hyundai HB20",
    modelo: "2024",
    categoria: "Econômico",
    imagem: "/images/carros/HB20.png",
    precoDiaria: 79.90,
    assentos: 5,
    cambio: "Manual",
    combustivel: "Gasolina",
    avaliacao: 4.5,
    avaliacoes: 134,
    caracteristicas: ["5 Lugares", "Vidro Elétrico", "Ar Condicionado"],
    descricao: "Confiável e econômico para o dia a dia"
  },
  // Executivo
  {
    id: "ctc3",
    nome: "Citroën C3",
    modelo: "2023",
    categoria: "Executivo",
    imagem: "/images/carros/CTC3.png",
    precoDiaria: 119.90,
    assentos: 5,
    cambio: "Automático",
    combustivel: "Gasolina",
    avaliacao: 4.6,
    avaliacoes: 87,
    caracteristicas: ["5 Lugares", "Ar Automático", "Bancos Conforto"],
    descricao: "Execução perfeita em um carro confortável"
  },
  {
    id: "sanx",
    nome: "Hyundai Santafe",
    modelo: "2024",
    categoria: "Executivo",
    imagem: "/images/carros/SANX.png",
    precoDiaria: 189.90,
    assentos: 7,
    cambio: "Automático",
    combustivel: "Gasolina",
    avaliacao: 4.7,
    avaliacoes: 176,
    caracteristicas: ["7 Lugares", "Teto Panorâmico", "GPS Integrado"],
    descricao: "Executivo espaçoso e tecnológico"
  },
  {
    id: "cyhb",
    nome: "Cygnus Hybrid",
    modelo: "2024",
    categoria: "Executivo",
    imagem: "/images/carros/CYHB.png",
    precoDiaria: 159.90,
    assentos: 5,
    cambio: "Automático",
    combustivel: "Híbrido",
    avaliacao: 4.8,
    avaliacoes: 203,
    caracteristicas: ["5 Lugares", "Motor Híbrido", "Eficiência Energética"],
    descricao: "Executivo sustentável e econômico"
  },
  // SUV/Premium
  {
    id: "cron",
    nome: "Hyundai Creta",
    modelo: "2024",
    categoria: "SUV",
    imagem: "/images/carros/CRON.png",
    precoDiaria: 249.90,
    assentos: 5,
    cambio: "Automático",
    combustivel: "Gasolina",
    avaliacao: 4.9,
    avaliacoes: 287,
    caracteristicas: ["5 Lugares", "Tração 4x4", "Teto Panorâmico"],
    descricao: "SUV moderno e potente"
  },
  {
    id: "crox",
    nome: "Honda CR-V",
    modelo: "2024",
    categoria: "SUV",
    imagem: "/images/carros/CROX.png",
    precoDiaria: 279.90,
    assentos: 5,
    cambio: "Automático",
    combustivel: "Gasolina",
    avaliacao: 4.9,
    avaliacoes: 312,
    caracteristicas: ["5 Lugares", "All Wheel Drive", "Navegação GPS"],
    descricao: "SUV premium com tecnologia avançada"
  },
  {
    id: "onis",
    nome: "Chevrolet Onix S",
    modelo: "2023",
    categoria: "SUV",
    imagem: "/images/carros/ONIS.png",
    precoDiaria: 159.90,
    assentos: 5,
    cambio: "Manual",
    combustivel: "Gasolina",
    avaliacao: 4.4,
    avaliacoes: 145,
    caracteristicas: ["5 Lugares", "Vidro Elétrico", "Ar Condicionado"],
    descricao: "SUV compacto e ágil"
  },
  {
    id: "onit",
    nome: "Chevrolet Onix Turbo",
    modelo: "2024",
    categoria: "SUV",
    imagem: "/images/carros/ONIT.png",
    precoDiaria: 179.90,
    assentos: 5,
    cambio: "Automático",
    combustivel: "Gasolina",
    avaliacao: 4.6,
    avaliacoes: 178,
    caracteristicas: ["5 Lugares", "Motor Turbo", "Ar Automático"],
    descricao: "SUV compacto com desempenho potente"
  },
  // Confortável/Premium
  {
    id: "onic",
    nome: "Chevrolet Onix Plus",
    modelo: "2024",
    categoria: "Confortável",
    imagem: "/images/carros/ONIC.png",
    precoDiaria: 199.90,
    assentos: 5,
    cambio: "Automático",
    combustivel: "Gasolina",
    avaliacao: 4.7,
    avaliacoes: 221,
    caracteristicas: ["5 Lugares", "Banco Couro", "Teto Solar"],
    descricao: "Sedan confortável e bem equipado"
  },
  {
    id: "onih",
    nome: "Chevrolet Onix Plus Turbo",
    modelo: "2024",
    categoria: "Confortável",
    imagem: "/images/carros/ONIH.png",
    precoDiaria: 219.90,
    assentos: 5,
    cambio: "Automático",
    combustivel: "Gasolina",
    avaliacao: 4.7,
    avaliacoes: 189,
    caracteristicas: ["5 Lugares", "Motor Turbo", "Som Premium"],
    descricao: "Sedan premium com motor potente"
  },
  // Especial/Premium
  {
    id: "crom",
    nome: "Citroën C3 Picasso",
    modelo: "2023",
    categoria: "Premium",
    imagem: "/images/carros/CROM.png",
    precoDiaria: 229.90,
    assentos: 7,
    cambio: "Automático",
    combustivel: "Gasolina",
    avaliacao: 4.6,
    avaliacoes: 134,
    caracteristicas: ["7 Lugares", "Teto Panorâmico", "Bancos Couro"],
    descricao: "Minivan familiar com conforto premium"
  },
  {
    id: "hb1x",
    nome: "Hyundai HB20 1.0",
    modelo: "2023",
    categoria: "Premium",
    imagem: "/images/carros/HB1X.png",
    precoDiaria: 89.90,
    assentos: 5,
    cambio: "Manual",
    combustivel: "Gasolina",
    avaliacao: 4.3,
    avaliacoes: 98,
    caracteristicas: ["5 Lugares", "Ar Condicionado", "Vidro Elétrico"],
    descricao: "Versão básica econômica do HB20"
  },
  {
    id: "hb2c",
    nome: "Hyundai HB20 Comfort",
    modelo: "2023",
    categoria: "Premium",
    imagem: "/images/carros/HB2C.png",
    precoDiaria: 99.90,
    assentos: 5,
    cambio: "Automático",
    combustivel: "Gasolina",
    avaliacao: 4.5,
    avaliacoes: 156,
    caracteristicas: ["5 Lugares", "Ar Automático", "Direção Hidráulica"],
    descricao: "Versão confortável com mais equipamentos"
  },
  {
    id: "hb2h",
    nome: "Hyundai HB20 Premium",
    modelo: "2024",
    categoria: "Premium",
    imagem: "/images/carros/HB2H.png",
    precoDiaria: 119.90,
    assentos: 5,
    cambio: "Automático",
    combustivel: "Gasolina",
    avaliacao: 4.7,
    avaliacoes: 203,
    caracteristicas: ["5 Lugares", "Teto Solar", "Som Premium"],
    descricao: "Versão premium do HB20 com todos os acessórios"
  },
  {
    id: "pola",
    nome: "Volkswagen Polo Advantage",
    modelo: "2023",
    categoria: "Premium",
    imagem: "/images/carros/POLA.png",
    precoDiaria: 109.90,
    assentos: 5,
    cambio: "Automático",
    combustivel: "Gasolina",
    avaliacao: 4.6,
    avaliacoes: 167,
    caracteristicas: ["5 Lugares", "Ar Automático", "Bancos Conforto"],
    descricao: "Qualidade premium por um preço justo"
  }
];

// Seleciona os 6 melhores carros para destaque na homepage
export const VEICULOS_DESTAQUE = VEICULOS.slice(0, 6);
