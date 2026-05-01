export interface CarroCategoria {
  id: string;
  nome: string;
  descricao: string;
  precoDiaria: number;
  imagem: string;
  caracteristicas: string[];
  cor: string;
}

export const CATEGORIAS_CARROS: CarroCategoria[] = [
  {
    id: "economico",
    nome: "Econômico",
    descricao: "Carros compactos e econômicos, perfeitos para a cidade",
    precoDiaria: 89.90,
    imagem: "/images/carros/economico.svg",
    caracteristicas: ["5 Lugares", "Ar Condicionado", "Direção Hidráulica"],
    cor: "#3B82F6"
  },
  {
    id: "executivo",
    nome: "Executivo",
    descricao: "Conforto e elegância para viagens importantes",
    precoDiaria: 189.90,
    imagem: "/images/carros/executivo.svg",
    caracteristicas: ["5 Lugares", "Banco Couro", "Som Premium"],
    cor: "#8B5CF6"
  },
  {
    id: "suv",
    nome: "SUV Automático",
    descricao: "Espaço e segurança para toda família",
    precoDiaria: 249.90,
    imagem: "/images/carros/suv.svg",
    caracteristicas: ["7 Lugares", "Tração 4x4", "Teto Panorâmico"],
    cor: "#06B6D4"
  },
  {
    id: "confortavel",
    nome: "Confortável",
    descricao: "Máximo conforto em jornadas longas",
    precoDiaria: 149.90,
    imagem: "/images/carros/confortavel.svg",
    caracteristicas: ["5 Lugares", "Banco Couro", "Porta Malas Grande"],
    cor: "#EC4899"
  },
  {
    id: "premium",
    nome: "Premium",
    descricao: "Luxo e tecnologia de ponta",
    precoDiaria: 399.90,
    imagem: "/images/carros/premium.svg",
    caracteristicas: ["5 Lugares", "Teto Panorâmico", "Navegação GPS"],
    cor: "#F59E0B"
  },
  {
    id: "especial",
    nome: "Especial",
    descricao: "Modelos exclusivos e diferenciados",
    precoDiaria: 299.90,
    imagem: "/images/carros/especial.svg",
    caracteristicas: ["2 Lugares", "Motor Potente", "Design Esportivo"],
    cor: "#EF4444"
  }
];
