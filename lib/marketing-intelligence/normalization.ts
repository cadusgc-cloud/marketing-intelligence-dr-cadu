import type { ManualMetricFormat, ManualMetricPillar, ManualMetricRecord, MetricRisk, NormalizedMetricRecord } from "@/lib/marketing-intelligence/types";

export const allowedFormats: ManualMetricFormat[] = ["story", "reel", "post", "carrossel", "bastidor_neutro", "reflexao"];
export const allowedPillars: ManualMetricPillar[] = [
  "estetica_natural",
  "expectativa_realista",
  "seguranca",
  "cicatrizacao",
  "consulta_nao_e_venda",
  "plastica_em_evidencia",
  "bastidor_neutro",
  "ciencia_simples"
];

export const pillarLabels: Record<ManualMetricPillar, string> = {
  estetica_natural: "Estetica natural",
  expectativa_realista: "Expectativa realista",
  seguranca: "Seguranca",
  cicatrizacao: "Cicatrizacao",
  consulta_nao_e_venda: "Consulta nao e venda",
  plastica_em_evidencia: "Plastica em Evidencia",
  bastidor_neutro: "Bastidor neutro",
  ciencia_simples: "Ciencia simples"
};

export const formatLabels: Record<ManualMetricFormat, string> = {
  story: "Story",
  reel: "Reel",
  post: "Post",
  carrossel: "Carrossel",
  bastidor_neutro: "Bastidor neutro",
  reflexao: "Reflexao"
};

export const sensitiveTerms = [
  "paciente",
  "prontuario",
  "diagnostico",
  "prescrevo",
  "prescricao",
  "antes e depois",
  "antes/depois",
  "cirurgia de hoje",
  "paciente de hoje",
  "hospital agora",
  "clinica agora",
  "endereco",
  "telefone",
  "cpf",
  "numero de rg",
  "documento rg",
  "login",
  "senha",
  "resultado garantido",
  "sem risco",
  "agende agora",
  "ultimas vagas",
  "transforme seu corpo"
];

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizeFormat(value: string): ManualMetricFormat | undefined {
  const normalized = slug(value);
  const aliases: Record<string, ManualMetricFormat> = {
    stories: "story",
    story: "story",
    reels: "reel",
    reel: "reel",
    post: "post",
    feed: "post",
    carrossel: "carrossel",
    carousel: "carrossel",
    bastidor: "bastidor_neutro",
    bastidor_neutro: "bastidor_neutro",
    reflexao: "reflexao"
  };
  return aliases[normalized] ?? (allowedFormats.includes(normalized as ManualMetricFormat) ? normalized as ManualMetricFormat : undefined);
}

export function normalizePillar(value: string): ManualMetricPillar | undefined {
  const normalized = slug(value);
  const aliases: Record<string, ManualMetricPillar> = {
    estetica_natural: "estetica_natural",
    expectativa_realista: "expectativa_realista",
    seguranca: "seguranca",
    seguranca_em_cirurgia_plastica: "seguranca",
    cicatrizacao: "cicatrizacao",
    recuperacao_e_cicatrizacao: "cicatrizacao",
    consulta_nao_e_venda: "consulta_nao_e_venda",
    plastica_em_evidencia: "plastica_em_evidencia",
    bastidor_neutro: "bastidor_neutro",
    bastidores_neutros: "bastidor_neutro",
    ciencia_simples: "ciencia_simples",
    ciencia_explicada: "ciencia_simples"
  };
  return aliases[normalized] ?? (allowedPillars.includes(normalized as ManualMetricPillar) ? normalized as ManualMetricPillar : undefined);
}

export function detectSensitiveTerms(text: string): string[] {
  const lower = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return sensitiveTerms.filter((term) => {
    if (term.length <= 3) {
      return new RegExp(`(^|\\W)${term}(\\W|$)`, "i").test(lower);
    }
    return lower.includes(term);
  });
}

export function normalizeRisk(risk: string): MetricRisk {
  const value = slug(risk);
  if (value.includes("bloq")) return "bloquear";
  if (value.includes("revis")) return "revisar";
  if (value.includes("aten")) return "atencao";
  return "baixo";
}

export function normalizeMetricRows(rows: ManualMetricRecord[]): NormalizedMetricRecord[] {
  return rows.map((row, index) => {
    const normalizedFormat = normalizeFormat(String(row.format)) ?? "post";
    const normalizedPillar = normalizePillar(String(row.pillar)) ?? "expectativa_realista";
    const text = [row.theme, row.title, row.notes].join(" ");
    const sensitiveFlags = detectSensitiveTerms(text);
    const totalInteractions = row.likes + row.comments + row.shares + row.saves + row.replies + row.clicks + row.profileVisits + row.dms;
    const weightedInteractions = row.likes + row.comments * 4 + row.shares * 8 + row.saves * 9 + row.replies * 7 + row.clicks * 4 + row.profileVisits * 2 + row.dms * 12;

    return {
      ...row,
      id: `${row.date}-${slug(row.title || row.theme)}-${index}`,
      normalizedFormat,
      normalizedPillar,
      risk: normalizeRisk(String(row.risk)),
      effort: Math.max(1, Math.min(5, Number(row.effort) || 2)),
      totalInteractions,
      weightedInteractions,
      safeForLearning: sensitiveFlags.length === 0 && normalizeRisk(String(row.risk)) !== "bloquear",
      sensitiveFlags
    };
  });
}

export function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
