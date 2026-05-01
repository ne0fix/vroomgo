import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarData(data: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(data));
}

export function calcularDiferencaDias(inicio: Date | string, fim: Date | string): number {
  const d1 = new Date(inicio);
  const d2 = new Date(fim);
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
}
