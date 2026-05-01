import { ReactNode } from "react";
import { cn } from "@/lib/utils";

const CORES = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  purple: "bg-purple-50 text-purple-700",
  yellow: "bg-yellow-50 text-yellow-700",
};

interface KPICardProps {
  titulo: string;
  valor: string;
  icone: ReactNode;
  cor: keyof typeof CORES;
  subtitulo?: string;
  alerta?: boolean;
}

export function KPICard({ titulo, valor, icone, cor, subtitulo, alerta }: KPICardProps) {
  return (
    <div className={cn("rounded-xl p-4 border", alerta ? "border-yellow-300 bg-yellow-50" : "bg-white")}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">{titulo}</span>
        <span className={cn("p-1.5 rounded-lg", CORES[cor])}>
          {icone}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{valor}</p>
      {subtitulo && <p className="text-xs text-gray-500 mt-1">{subtitulo}</p>}
    </div>
  );
}
