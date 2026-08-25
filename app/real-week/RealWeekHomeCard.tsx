"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  buildRealWeekBaseline,
  buildRealWeekPanel,
  formatBrDate,
  formatBrNumber,
  type RealWeekStoredData
} from "@/lib/real-week";
import { loadRealWeekFromLocalStorage } from "@/lib/real-week/client/realWeekStorage";

export function RealWeekHomeCard() {
  const [stored, setStored] = useState<RealWeekStoredData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const result = loadRealWeekFromLocalStorage();
    setStored(result.data);
    setLoaded(true);
  }, []);

  const baseline = useMemo(() => {
    if (!stored) return null;
    return buildRealWeekBaseline(buildRealWeekPanel(stored.posts, stored.days));
  }, [stored]);

  if (!loaded) {
    return (
      <section className="panel border-2 border-emerald-200">
        <p className="text-sm text-slate-500">Carregando semana real...</p>
      </section>
    );
  }

  if (!stored || !baseline) {
    return (
      <section className="panel border-2 border-dashed border-emerald-300">
        <p className="text-sm font-semibold text-emerald-700">Semana real</p>
        <h3 className="mt-1 text-lg font-semibold">Nenhum dado real importado ainda</h3>
        <p className="mt-2 text-sm text-slate-600">
          Todos os numeros deste produto sao de demonstracao ate voce importar os CSVs reais do Meta Business Suite.
        </p>
        <Link
          href="/real-week"
          className="mt-4 inline-block rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Importar semana real
        </Link>
      </section>
    );
  }

  return (
    <section className="panel border-2 border-emerald-300 bg-emerald-50/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">Dados reais</span>
          Semana real importada
        </p>
        <Link href="/real-week" className="text-sm font-semibold text-emerald-700 hover:underline">
          Abrir painel completo
        </Link>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Periodo {baseline.periodStart ? formatBrDate(baseline.periodStart) : "-"} a {baseline.periodEnd ? formatBrDate(baseline.periodEnd) : "-"} - separado dos dados de demonstracao do restante do produto.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RealMetric label="Posts por semana" value={baseline.postsPerWeek === null ? "-" : formatBrNumber(baseline.postsPerWeek)} />
        <RealMetric label="Alcance medio/post" value={baseline.reachAvgPerPost === null ? "-" : formatBrNumber(baseline.reachAvgPerPost)} />
        <RealMetric label="Engajamento medio/post" value={baseline.engagementAvgPerPost === null ? "-" : formatBrNumber(baseline.engagementAvgPerPost)} />
        <RealMetric
          label="Crescimento de seguidores"
          value={baseline.followerGrowth === null ? "nao importado" : `${baseline.followerGrowth >= 0 ? "+" : ""}${formatBrNumber(baseline.followerGrowth)}`}
        />
      </div>
    </section>
  );
}

function RealMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}
