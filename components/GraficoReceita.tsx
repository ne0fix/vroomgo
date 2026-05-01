"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { formatarMoeda } from "@/lib/utils";

interface GraficoReceitaProps {
  dados: { mes: string; receita: number }[];
}

export function GraficoReceita({ dados }: GraficoReceitaProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={dados} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: any) => [formatarMoeda(value), "Receita"]}
          labelStyle={{ fontWeight: 600 }}
        />
        <Bar dataKey="receita" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
