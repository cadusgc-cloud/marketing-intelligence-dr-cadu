import type { QualityIssue, QualitySeverity } from "@/lib/marketing-quality/types";

type Rule = {
  id: string;
  terms: string[];
  severity: QualitySeverity;
  message: string;
  suggestion: string;
};

export const QUALITY_BLOCKING_TEXT_RULES: Rule[] = [
  rule("promessa", ["resultado garantido", "transformacao completa", "corpo perfeito", "sem risco", "sem cicatriz", "recuperacao rapida garantida"], "blocking", "Promessa ou garantia detectada.", "Trocar por linguagem de limites, variabilidade e avaliacao individual."),
  rule("antes-depois", ["antes e depois", "antes/depois"], "blocking", "Antes/depois detectado.", "Remover comparacao visual ou promessa implicita."),
  rule("cta-agressivo", ["agende agora", "ultimas vagas", "compre agora", "vagas limitadas", "oportunidade unica"], "blocking", "CTA agressivo ou urgencia artificial detectada.", "Usar convite educativo e discreto."),
  rule("paciente", ["paciente de hoje", "paciente real", "prontuario", "exame identificavel", "documento sensivel"], "blocking", "Paciente, documento ou material sensivel detectado.", "Remover qualquer referencia identificavel."),
  rule("bastidor-inventado", ["cirurgia de hoje", "no hospital agora", "aqui na clinica agora"], "blocking", "Bastidor especifico ou local em tempo real detectado.", "Usar contexto neutro e editavel."),
  rule("conduta-individual", ["eu indico para voce", "voce precisa fazer", "tratamento ideal para voce", "diagnostico", "prescrev"], "blocking", "Conduta individual, diagnostico ou prescricao detectado.", "Manter conteudo educativo geral.")
];

export const QUALITY_WARNING_TEXT_RULES: Rule[] = [
  rule("afirmacao-absoluta", ["melhor tecnica", "definitivo", "nunca", "sempre"], "warning", "Afirmacao absoluta detectada.", "Usar linguagem menos absoluta."),
  rule("tom-campanha", ["imperdivel", "promocao", "desconto", "viral"], "warning", "Tom promocional ou de viralizacao detectado.", "Manter tom sobrio e educativo."),
  rule("localizacao", ["rua ", "avenida ", "bairro ", "endereco", "localizacao revelada", "placa visivel"], "warning", "Pista de localizacao detectada.", "Remover pistas visuais ou textuais de local."),
  rule("agora-sem-contexto", ["estou aqui agora", "acontecendo agora"], "warning", "Presenca em tempo real nao comprovada.", "Usar frase neutra sem simular o momento.")
];

export function evaluateTextRules(text: string, source: string): QualityIssue[] {
  const normalized = normalizeText(text);
  const rules = [...QUALITY_BLOCKING_TEXT_RULES, ...QUALITY_WARNING_TEXT_RULES];
  return rules.flatMap((item) => {
    const foundTerms = item.terms.filter((term) => normalized.includes(normalizeText(term)));
    return foundTerms.map((term) => ({
      id: `${source}-${item.id}-${slugify(term)}`,
      area: "safety" as const,
      severity: item.severity,
      message: `${item.message} Termo: ${term}.`,
      source,
      suggestion: item.suggestion
    }));
  });
}

export function hasRawJsonForUser(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[") || /\"days\"\s*:/.test(trimmed);
}

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9/]+/g, " ")
    .trim();
}

export function countMainSentences(value: string): number {
  const parts = value
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  return Math.max(1, parts.length);
}

function rule(id: string, terms: string[], severity: QualitySeverity, message: string, suggestion: string): Rule {
  return { id, terms, severity, message, suggestion };
}

function slugify(value: string): string {
  return normalizeText(value).replace(/\s+/g, "-") || "termo";
}
