import type { NormalizedReportRow, ReportSource } from "@/lib/report-imports/types";
import { exportNormalizedRowsToTsv } from "@/lib/report-imports/exports";

export const reportImportDatasetNotice = "Dataset ficticio de validacao local. Nao representa metricas reais.";

const themes = [
  ["cirurgia plastica nao combina com pressa", "expectativa_realista", "reel"],
  ["naturalidade tambem e planejamento", "estetica_natural", "carrossel"],
  ["consulta nao e venda", "consulta_nao_e_venda", "post"],
  ["cicatrizacao exige paciencia", "cicatrizacao", "story"],
  ["o que o marketing nao mostra", "seguranca", "reel"],
  ["plastica em evidencia", "plastica_em_evidencia", "carrossel"],
  ["estudo e atualizacao", "ciencia_simples", "bastidor_neutro"]
] as const;

export const sampleV7ReportRows: NormalizedReportRow[] = buildSampleRows();

export const sampleReporteiTsv = buildSourceText("reportei", sampleV7ReportRows.slice(0, 28));
export const sampleInstagramCsv = buildSourceText("instagram", sampleV7ReportRows.slice(28, 56), ",");
export const sampleMetaAdsCsv = buildSourceText("meta_ads", sampleV7ReportRows.filter((row) => row.channel === "meta_ads"), ";");
export const sampleGenericTsv = exportNormalizedRowsToTsv(sampleV7ReportRows);

export function getSampleReportImportText(source: ReportSource): string {
  if (source === "reportei") return sampleReporteiTsv;
  if (source === "instagram") return sampleInstagramCsv;
  if (source === "meta_ads") return sampleMetaAdsCsv;
  return sampleGenericTsv;
}

function buildSampleRows(): NormalizedReportRow[] {
  const rows: NormalizedReportRow[] = [];
  const start = new Date("2026-05-17T00:00:00Z");
  for (let day = 0; day < 14; day += 1) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + day);
    const iso = date.toISOString().slice(0, 10);
    for (let slot = 0; slot < 5; slot += 1) {
      const [theme, pillar, format] = themes[(day + slot) % themes.length];
      const base = 900 + day * 80 + slot * 140;
      rows.push({
        id: `v7-org-${day}-${slot}`,
        source: slot % 2 === 0 ? "reportei" : "instagram",
        rowNumber: rows.length + 2,
        date: slot === 4 && day === 10 ? undefined : iso,
        channel: "instagram",
        profile: "dr-cadu-demo",
        format,
        title: `${theme} ${day + 1}.${slot + 1}`,
        theme,
        pillar,
        caption: `Conteudo educativo sobre ${theme}, com linguagem segura e sem promessa.`,
        status: day < 7 ? "publicado_manual" : "avaliado",
        media: "midia neutra",
        notes: slot === 3 && day === 8 ? "linha incompleta proposital para teste" : "registro ficticio agregado",
        effort: (slot % 5) + 1,
        risk: slot === 0 ? "baixo" : "seguro",
        metrics: {
          reach: slot === 3 && day === 8 ? undefined : base,
          impressions: base + 220,
          likes: 20 + day + slot * 3,
          comments: slot + (day % 3),
          shares: 2 + slot + (day % 2),
          saves: 6 + slot * 2 + (day % 4),
          replies: slot === 3 ? 4 : 1,
          clicks: 3 + slot,
          profileVisits: 2 + slot,
          follows: slot === 1 ? 1 : 0
        },
        raw: {},
        sensitiveIssues: []
      });
    }
    const adsBase = 5000 + day * 180;
    rows.push({
      id: `v7-ads-${day}`,
      source: "meta_ads",
      rowNumber: rows.length + 2,
      date: iso,
      channel: "meta_ads",
      format: "ads",
      title: `Campanha educativa segura ${day + 1}`,
      theme: themes[day % themes.length][0],
      pillar: themes[day % themes.length][1],
      caption: "Registro pago manual agregado, sem segmentacao sensivel.",
      status: "avaliado",
      media: "criativo educativo",
      notes: "ads manual ficticio",
      effort: 2,
      risk: "baixo",
      metrics: {
        spend: Number((70 + day * 3.5).toFixed(2)),
        reach: adsBase,
        impressions: adsBase + 1400,
        clicks: 42 + day,
        cpc: Number((1.7 + day * 0.03).toFixed(2)),
        cpm: Number((12 + day * 0.2).toFixed(2)),
        ctr: Number((0.012 + day * 0.0004).toFixed(4)),
        frequency: Number((1.4 + (day % 5) * 0.22).toFixed(2)),
        results: 3 + (day % 4),
        leads: day % 3
      },
      raw: {},
      sensitiveIssues: []
    });
  }

  rows.push({ ...rows[3], id: "v7-duplicate-intentional", rowNumber: rows.length + 2 });
  return rows.map((row) => ({ ...row, raw: row.raw && Object.keys(row.raw).length ? row.raw : {} }));
}

function buildSourceText(source: ReportSource, rows: NormalizedReportRow[], delimiter = "\t"): string {
  if (source === "meta_ads") {
    const header = ["Date", "Campaign", "Spend", "Reach", "Impressions", "Clicks", "CPC", "CPM", "CTR", "Leads", "Results", "Frequency"];
    const lines = rows.map((row) =>
      [
        row.date ?? "",
        row.title,
        row.metrics.spend ?? "",
        row.metrics.reach ?? "",
        row.metrics.impressions ?? "",
        row.metrics.clicks ?? "",
        row.metrics.cpc ?? "",
        row.metrics.cpm ?? "",
        row.metrics.ctr ?? "",
        row.metrics.leads ?? "",
        row.metrics.results ?? "",
        row.metrics.frequency ?? ""
      ].join(delimiter)
    );
    return [header.join(delimiter), ...lines].join("\n");
  }

  const header = source === "instagram"
    ? ["Date", "Content type", "Caption", "Reach", "Impressions", "Likes", "Comments", "Shares", "Saves", "Replies", "Profile visits", "Follows"]
    : ["Data", "Rede", "Tipo", "Publicacao", "Legenda", "Alcance", "Impressoes", "Curtidas", "Comentarios", "Compartilhamentos", "Salvamentos", "Cliques", "Observacoes"];
  const lines = rows.map((row) => {
    if (source === "instagram") {
      return [
        row.date ?? "",
        row.format,
        row.caption ?? row.title,
        row.metrics.reach ?? "",
        row.metrics.impressions ?? "",
        row.metrics.likes ?? "",
        row.metrics.comments ?? "",
        row.metrics.shares ?? "",
        row.metrics.saves ?? "",
        row.metrics.replies ?? "",
        row.metrics.profileVisits ?? "",
        row.metrics.follows ?? ""
      ].join(delimiter);
    }
    return [
      row.date ?? "",
      row.channel,
      row.format,
      row.title,
      row.caption ?? "",
      row.metrics.reach ?? "",
      row.metrics.impressions ?? "",
      row.metrics.likes ?? "",
      row.metrics.comments ?? "",
      row.metrics.shares ?? "",
      row.metrics.saves ?? "",
      row.metrics.clicks ?? "",
      row.notes ?? ""
    ].join(delimiter);
  });
  return [header.join(delimiter), ...lines].join("\n");
}
