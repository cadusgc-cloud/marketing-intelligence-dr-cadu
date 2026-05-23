import { CONTENT_STUDIO_FORBIDDEN_TERMS } from "@/lib/content-studio/library";
import { DR_CADU_BRAND_VOICE, brandVoiceStatus } from "@/lib/content-studio/voice";
import type { UnifiedQualityIssue, UnifiedQualityResult } from "@/lib/content-studio/types";

const campaignTerms = ["campanha imperdivel", "promocao", "desconto", "vagas limitadas", "oportunidade unica"];
const usefulTerms = ["calma", "criterio", "seguranca", "expectativa", "limite", "risco", "recuperacao", "decisao", "informacao"];

export function evaluateMarketingContentQuality(content: unknown): UnifiedQualityResult {
  const text = stringifyContent(content);
  const normalized = normalize(text);
  const issues: UnifiedQualityIssue[] = [];

  for (const term of CONTENT_STUDIO_FORBIDDEN_TERMS) {
    if (normalized.includes(normalize(term))) {
      issues.push(issue(`forbidden-${slug(term)}`, categoryForTerm(term), "blocking", `Termo de risco detectado: ${term}.`, "Remover a expressao e trocar por orientacao educativa.", term));
    }
  }

  for (const term of campaignTerms) {
    if (normalized.includes(normalize(term))) {
      issues.push(issue(`campaign-${slug(term)}`, "campanha", "blocking", `Tom comercial agressivo detectado: ${term}.`, "Trocar por convite educativo e revisavel.", term));
    }
  }

  if (sentenceCount(text) > 10 && text.length > 900) {
    issues.push(issue("too-long", "concisao", "warning", "Texto longo para uso operacional.", "Separar em blocos curtos antes de exportar."));
  }

  if (!usefulTerms.some((term) => normalized.includes(term))) {
    issues.push(issue("low-practical-use", "utilidade", "warning", "Conteudo pouco orientado a decisao consciente.", "Adicionar uma frase sobre criterio, limite, seguranca ou expectativa realista."));
  }

  if (normalized.includes("agora") && !normalized.includes("sem dizer que esta acontecendo agora")) {
    issues.push(issue("possible-real-time", "naturalidade", "warning", "Uso de 'agora' pode sugerir bastidor em tempo real.", "Usar contexto neutro e editavel."));
  }

  const blocking = issues.filter((item) => item.severity === "blocking").length;
  const warnings = issues.filter((item) => item.severity === "warning").length;
  const voicePenalty = scoreVoicePenalty(normalized, text) + warnings * 5 + blocking * 30;
  const safetyPenalty = warnings * 8 + blocking * 40;
  const voiceScore = clamp(100 - voicePenalty);
  const safetyScore = clamp(100 - safetyPenalty);
  const readinessScore = clamp(Math.round((voiceScore + safetyScore) / 2) - (blocking > 0 ? 25 : 0));
  const blocked = blocking > 0;
  const requiresHumanReview = blocked || warnings > 0 || readinessScore < 82;
  const riskLevel = blocked ? "bloquear" : requiresHumanReview ? "revisar_antes_de_postar" : "seguro";
  const status = blocked ? "bloquear" : requiresHumanReview ? "revisar" : "aprovado";

  return {
    voiceScore,
    safetyScore,
    readinessScore,
    riskLevel,
    issues,
    suggestions: buildSuggestions(issues, voiceScore),
    blocked,
    approvedForManualUse: !blocked,
    requiresHumanReview,
    status
  };
}

export function buildUnifiedQualityMarkdown(result: UnifiedQualityResult): string {
  return [
    "# Quality unificado - Content Studio v5",
    "",
    `Status: ${result.status}`,
    `Voice score: ${result.voiceScore}/100 (${brandVoiceStatus(result.voiceScore)})`,
    `Safety score: ${result.safetyScore}/100`,
    `Readiness: ${result.readinessScore}/100`,
    `Risco: ${result.riskLevel}`,
    "",
    "## Problemas",
    ...(result.issues.length ? result.issues.map((item) => `- ${item.severity}: ${item.message}`) : ["- nenhum problema bloqueante"]),
    "",
    "## Sugestoes",
    ...result.suggestions.map((item) => `- ${item}`)
  ].join("\n");
}

function stringifyContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (content == null) return "";
  if (Array.isArray(content)) return content.map(stringifyContent).join("\n");
  if (typeof content === "object") return Object.values(content as Record<string, unknown>).map(stringifyContent).join("\n");
  return String(content);
}

function categoryForTerm(term: string): UnifiedQualityIssue["category"] {
  const normalized = normalize(term);
  if (normalized.includes("resultado") || normalized.includes("sem risco") || normalized.includes("sem cicatriz")) return "promessa";
  if (normalized.includes("agende") || normalized.includes("vagas") || normalized.includes("promocao")) return "cta_agressivo";
  if (normalized.includes("diagnostico")) return "diagnostico";
  if (normalized.includes("prescre")) return "prescricao";
  if (normalized.includes("antes")) return "antes_depois";
  if (normalized.includes("paciente") || normalized.includes("hospital") || normalized.includes("clinica") || normalized.includes("endereco")) return "paciente_local";
  return "seguranca_medica";
}

function scoreVoicePenalty(normalized: string, text: string): number {
  let penalty = 0;
  for (const pattern of DR_CADU_BRAND_VOICE.forbiddenPatterns) {
    if (normalized.includes(normalize(pattern))) penalty += 22;
  }
  if (text.includes("!!!")) penalty += 10;
  if (text.split("\n").some((line) => line.length > 220)) penalty += 8;
  if (normalized.includes("viral") || normalized.includes("bombar")) penalty += 10;
  return penalty;
}

function buildSuggestions(issues: UnifiedQualityIssue[], voiceScore: number): string[] {
  const suggestions = new Set<string>();
  if (voiceScore < 86) suggestions.add("Aproximar o texto do tom humano, curto e professoral do Dr. Cadu.");
  for (const item of issues) suggestions.add(item.suggestion);
  suggestions.add("Revisar manualmente antes de qualquer publicacao externa.");
  suggestions.add("Nao usar paciente, local, prontuario, antes/depois ou promessa.");
  return [...suggestions];
}

function issue(
  id: string,
  category: UnifiedQualityIssue["category"],
  severity: UnifiedQualityIssue["severity"],
  message: string,
  suggestion: string,
  term?: string
): UnifiedQualityIssue {
  return { id, category, severity, message, suggestion, term };
}

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9/]+/g, " ").replace(/\s+/g, " ").trim();
}

function slug(value: string): string {
  return normalize(value).replace(/\s+/g, "-").replace(/\//g, "-");
}

function sentenceCount(value: string): number {
  return value.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}
