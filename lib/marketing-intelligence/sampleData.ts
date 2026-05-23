import type { ManualMetricPillar, ManualMetricRecord, ManualMetricFormat } from "@/lib/marketing-intelligence/types";

export const sampleDatasetNotice = "Dataset ficticio para validacao local. Nao representa metricas reais.";

const themes = [
  ["cirurgia plastica nao combina com pressa", "expectativa_realista", "reel"],
  ["naturalidade tambem e planejamento", "estetica_natural", "carrossel"],
  ["seguranca vem antes da pressa", "seguranca", "post"],
  ["cicatrizacao exige paciencia", "cicatrizacao", "carrossel"],
  ["consulta nao e venda", "consulta_nao_e_venda", "reel"],
  ["Plastica em Evidencia: menos promessa, mais clareza", "plastica_em_evidencia", "reel"],
  ["bastidor neutro de estudo", "bastidor_neutro", "story"],
  ["ciencia simples para publico leigo", "ciencia_simples", "carrossel"],
  ["resultado bonito precisa fazer sentido", "estetica_natural", "post"],
  ["o que o marketing nao mostra", "consulta_nao_e_venda", "reel"],
  ["recuperacao nao e competicao", "cicatrizacao", "reflexao"],
  ["expectativa realista evita frustracao", "expectativa_realista", "carrossel"]
] as const;

function isoDateFromOffset(offset: number) {
  const base = new Date("2026-04-13T12:00:00.000Z");
  base.setUTCDate(base.getUTCDate() + offset);
  return base.toISOString().slice(0, 10);
}

function buildRecord(index: number): ManualMetricRecord {
  const [theme, pillar, format] = themes[index % themes.length];
  const wave = index % 7;
  const qualityBoost = pillar === "seguranca" || pillar === "expectativa_realista" ? 1.22 : pillar === "bastidor_neutro" ? 0.82 : 1;
  const formatBoost = format === "reel" ? 1.25 : format === "carrossel" ? 1.12 : format === "story" ? 0.72 : 0.92;
  const reach = Math.round((980 + index * 38 + wave * 155) * qualityBoost * formatBoost);
  const impressions = Math.round(reach * (1.18 + (wave % 3) * 0.08));
  const likes = Math.round(reach * (0.022 + (wave % 4) * 0.002));
  const comments = Math.round(reach * (0.002 + (wave % 2) * 0.001));
  const shares = Math.round(reach * (0.004 + (pillar === "seguranca" ? 0.003 : 0.001)));
  const saves = Math.round(reach * (0.006 + (pillar === "ciencia_simples" || pillar === "expectativa_realista" ? 0.006 : 0.002)));
  const replies = Math.round(format === "story" ? reach * 0.008 : reach * 0.002);
  const dms = Math.round((pillar === "consulta_nao_e_venda" ? reach * 0.002 : reach * 0.001) + (wave === 4 ? 2 : 0));
  const effort = format === "reel" ? 4 : format === "carrossel" ? 3 : format === "story" ? 1 : 2;

  return {
    date: isoDateFromOffset(index),
    channel: "Instagram organico",
    format: format as ManualMetricFormat,
    theme,
    pillar: pillar as ManualMetricPillar,
    title: `${theme} #${index + 1}`,
    impressions,
    reach,
    likes,
    comments,
    shares,
    saves,
    replies,
    clicks: Math.round(reach * 0.003),
    profileVisits: Math.round(reach * 0.006),
    dms,
    retentionSeconds: format === "reel" ? 22 + wave * 3 : format === "story" ? 6 + wave : 0,
    status: "publicado_manual",
    risk: index % 17 === 0 ? "atencao" : "baixo",
    effort,
    notes: "Amostra ficticia agregada para teste interno, sem dado pessoal e sem identificacao."
  };
}

export const sampleManualMetricRecords: ManualMetricRecord[] = Array.from({ length: 48 }, (_, index) => buildRecord(index));

export const sampleMetricsTsv = [
  [
    "Data",
    "Canal",
    "Formato",
    "Tema",
    "Pilar",
    "Titulo",
    "Impressoes",
    "Alcance",
    "Curtidas",
    "Comentarios",
    "Compartilhamentos",
    "Salvamentos",
    "Respostas",
    "Cliques",
    "Visitas ao perfil",
    "DMs",
    "Retencao",
    "Status",
    "Risco",
    "Esforco",
    "Observacoes"
  ].join("\t"),
  ...sampleManualMetricRecords.slice(0, 12).map((record) => [
    record.date,
    record.channel,
    record.format,
    record.theme,
    record.pillar,
    record.title,
    record.impressions,
    record.reach,
    record.likes,
    record.comments,
    record.shares,
    record.saves,
    record.replies,
    record.clicks,
    record.profileVisits,
    record.dms,
    record.retentionSeconds,
    record.status,
    record.risk,
    record.effort,
    record.notes
  ].join("\t"))
].join("\n");
