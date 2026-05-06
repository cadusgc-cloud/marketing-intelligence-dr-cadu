"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = {
  period: string;
  investimento: number;
  oportunidades: number;
  alcance: number;
};

export function TrendChart({ data }: { data: Point[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorOps" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#1F8A70" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#1F8A70" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="period" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => new Intl.NumberFormat("pt-BR").format(Number(value))} />
          <Area type="monotone" dataKey="oportunidades" stroke="#1F8A70" fill="url(#colorOps)" strokeWidth={2} />
          <Area type="monotone" dataKey="alcance" stroke="#0E7490" fill="transparent" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
