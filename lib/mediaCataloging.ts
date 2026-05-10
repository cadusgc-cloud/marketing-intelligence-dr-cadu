import type {
  MediaApprovalStatus,
  MediaAsset,
  MediaAssetType,
  MediaOrientation,
  MediaSuggestedUse,
  MediaUsageStatus,
  PatientPrivacyRisk
} from "@/lib/mediaLibrary";
import type { ContentFunnelStage } from "@/lib/contentStudio";

export type MediaManifestSource = "pasted_list" | "spreadsheet_export" | "folder_manifest" | "simulated";
export type MediaCatalogingConfidence = "low" | "medium" | "high";
export type MediaCatalogingStatus = "draft" | "needs_review" | "ready_to_import" | "blocked";
export type CatalogedAssetType = MediaAssetType | "unknown";

export type MediaManifestItem = {
  id: string;
  rawLine: string;
  filename: string;
  extension: string;
  probableAssetType: CatalogedAssetType;
  probableOrientation: MediaOrientation;
  detectedKeywords: string[];
  notes: string;
  source: MediaManifestSource;
  createdAt: Date;
};

export type MediaCatalogingSuggestion = {
  id: string;
  manifestItemId: string;
  filename: string;
  displayName: string;
  suggestedAssetType: CatalogedAssetType;
  suggestedOrientation: MediaOrientation;
  suggestedTheme: string;
  suggestedPillar: string;
  suggestedFunnelStage: ContentFunnelStage;
  suggestedUse: MediaSuggestedUse;
  suggestedTags: string[];
  suggestedDescription: string;
  suggestedPrivacyRisk: PatientPrivacyRisk;
  suggestedApprovalStatus: MediaApprovalStatus;
  suggestedUsageStatus: MediaUsageStatus;
  confidence: MediaCatalogingConfidence;
  status: MediaCatalogingStatus;
  warnings: string[];
  reviewQuestions: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type MediaCatalogingSummary = {
  totalItems: number;
  imageItems: number;
  videoItems: number;
  unknownItems: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  needsReview: number;
  readyToImport: number;
  blocked: number;
  privacyRiskItems: number;
  duplicateCandidates: number;
  suggestedPillars: Record<string, number>;
};

export type MediaImportDraft = {
  id: string;
  suggestionId: string;
  mediaAssetDraft: MediaAsset;
  importStatus: "ready" | "needs_review" | "blocked";
  warnings: string[];
  createdAt: Date;
};

export type MediaCatalogingResult = {
  manifestText: string;
  normalizedText: string;
  lineCount: number;
  previewLines: string[];
  items: MediaManifestItem[];
  suggestions: MediaCatalogingSuggestion[];
  summary: MediaCatalogingSummary;
  drafts: MediaImportDraft[];
  duplicateCandidates: Array<{ baseName: string; filenames: string[] }>;
  warnings: string[];
};

const baseDate = new Date("2026-05-10T12:00:00.000Z");

export const SIMULATED_MEDIA_MANIFEST = [
  "cadu-consultorio-bastidor-01.jpg",
  "cadu-consultorio-bastidor-02.jpg",
  "cadu-centro-cirurgico-preparo-01.jpg",
  "protese-silicone-explicacao-01.mp4",
  "protese-silicone-ml-300-01.mp4",
  "mamoplastia-redutora-consulta-01.jpg",
  "mamoplastia-redutora-explicacao-01.mp4",
  "lipoaspiracao-planejamento-01.mp4",
  "lipoaspiracao-seguranca-01.jpg",
  "maternidade-naturalidade-01.jpg",
  "maternidade-pos-gestacao-01.mp4",
  "resultado-3-meses-explicacao-01.mp4",
  "resultado-mamas-revisao-etica-01.jpg",
  "bastidores-equipe-clinica-01.jpg",
  "autoridade-aula-cirurgia-01.jpg",
  "duvida-frequente-mamas-01.mp4",
  "checklist-seguranca-cirurgica-01.jpg",
  "rotina-pos-operatorio-01.jpg",
  "cadu-estudando-marketing-01.jpg",
  "naturalidade-consulta-01.jpg",
  "story-cta-avaliacao-01.jpg",
  "video-curto-protese-ml-01.mp4",
  "video-curto-lipo-nao-emagrece-01.mp4",
  "bastidor-familia-humanizado-01.jpg",
  "conteudo-site-mamoplastia-01.jpg",
  "reels-nem-toda-mulher-exagero-01.mp4",
  "foto-paciente-antes-depois-revisar-01.jpg",
  "depoimento-paciente-revisar-01.mp4",
  "consulta-online-duvida-01.jpg",
  "agenda-semana-clinica-01.jpg"
];

export function getDefaultMediaManifestText(): string {
  return SIMULATED_MEDIA_MANIFEST.join("\n");
}

export function normalizeManifestInput(input: string): string {
  return removeEmptyManifestLines(input)
    .map((line) => line.trim())
    .join("\n");
}

export function removeEmptyManifestLines(input: string): string[] {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function limitManifestPreview(input: string, limit = 8): string[] {
  return removeEmptyManifestLines(input).slice(0, limit);
}

export function getManifestInputWarnings(input: string): string[] {
  const lines = removeEmptyManifestLines(input);
  const warnings: string[] = [];

  if (lines.length === 0) warnings.push("Cole uma lista de nomes de arquivos para gerar a catalogacao assistida.");
  if (lines.length > 100) warnings.push("Lista grande detectada; o processamento e possivel, mas a revisao manual deve ser feita por blocos.");
  if (lines.some((line) => inferAssetTypeFromFilename(line) === "unknown")) warnings.push("Ha extensoes desconhecidas; esses itens devem ficar em revisao manual.");
  if (lines.some((line) => inferPrivacyRiskFromFilename(line) === "high")) warnings.push("Ha arquivos com paciente, resultado, depoimento ou antes/depois; revisao etica obrigatoria.");

  return warnings;
}

export function buildCatalogingResultFromManifestText(input: string, source: MediaManifestSource = "pasted_list"): MediaCatalogingResult {
  const normalizedText = normalizeManifestInput(input);
  const previewLines = limitManifestPreview(input);
  const inputWarnings = getManifestInputWarnings(input);

  if (!normalizedText) {
    return {
      manifestText: input,
      normalizedText,
      lineCount: 0,
      previewLines,
      items: [],
      suggestions: [],
      summary: emptyCatalogingSummary(),
      drafts: [],
      duplicateCandidates: [],
      warnings: [...inputWarnings, ...getCatalogingWarnings()]
    };
  }

  const lines = removeEmptyManifestLines(normalizedText);
  const items = parseMediaManifestLines(lines, source);
  const suggestions = generateMediaCatalogingSuggestions(items);
  const summary = summarizeMediaCataloging(suggestions);
  const drafts = createMediaImportDrafts(suggestions);
  const duplicateCandidates = detectDuplicateFilenameCandidates(items);

  return {
    manifestText: input,
    normalizedText,
    lineCount: lines.length,
    previewLines,
    items,
    suggestions,
    summary,
    drafts,
    duplicateCandidates,
    warnings: [...inputWarnings, ...getCatalogingWarnings()]
  };
}

export function parseMediaManifestText(text: string, source: MediaManifestSource = "pasted_list"): MediaManifestItem[] {
  return parseMediaManifestLines(text.split(/\r?\n/), source);
}

export function parseMediaManifestLines(lines: string[], source: MediaManifestSource = "simulated"): MediaManifestItem[] {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const filename = extractFilename(line);
      const extension = extractExtension(filename);
      const detectedKeywords = detectKeywordsFromFilename(filename);

      return {
        id: `manifest-item-${index + 1}`,
        rawLine: line,
        filename,
        extension,
        probableAssetType: inferAssetTypeFromFilename(filename),
        probableOrientation: inferOrientationFromFilename(filename),
        detectedKeywords,
        notes: "Item criado a partir de lista textual simulada; nenhum arquivo foi lido.",
        source,
        createdAt: baseDate
      };
    });
}

export function inferAssetTypeFromFilename(filename: string): CatalogedAssetType {
  const extension = extractExtension(filename);
  if (["jpg", "jpeg", "png", "webp", "heic"].includes(extension)) return "photo";
  if (["mp4", "mov", "m4v", "webm"].includes(extension)) return "video";
  if (["pdf", "doc", "docx"].includes(extension)) return "document";
  return "unknown";
}

export function inferOrientationFromFilename(filename: string): MediaOrientation {
  const normalized = normalizeFilename(filename);
  if (containsAny(normalized, ["story", "stories", "reels", "tiktok", "shorts", "video-curto"])) return "vertical";
  if (containsAny(normalized, ["site", "aula", "horizontal"])) return "horizontal";
  if (containsAny(normalized, ["feed", "quadrado", "square"])) return "square";
  return "unknown";
}

export function detectKeywordsFromFilename(filename: string): string[] {
  const normalized = normalizeFilename(filename);
  return keywordDictionary.filter((keyword) => normalized.includes(keyword));
}

export function inferThemeFromKeywords(keywords: string[]): string {
  if (hasKeyword(keywords, ["antes-depois", "resultado", "depoimento", "paciente"])) return "Revisao etica e privacidade";
  if (hasKeyword(keywords, ["protese", "silicone", "ml", "mamas"])) return "Mamas e protese de silicone";
  if (hasKeyword(keywords, ["mamoplastia", "redutora"])) return "Mamoplastia redutora";
  if (hasKeyword(keywords, ["lipo", "lipoaspiracao", "contorno"])) return "Lipoaspiracao e contorno corporal";
  if (hasKeyword(keywords, ["maternidade", "pos-gestacao"])) return "Maternidade e pos-gestacao";
  if (hasKeyword(keywords, ["naturalidade", "exagero"])) return "Naturalidade e seguranca";
  if (hasKeyword(keywords, ["autoridade", "aula", "checklist", "seguranca"])) return "Autoridade e seguranca";
  if (hasKeyword(keywords, ["bastidor", "bastidores", "rotina", "equipe", "clinica", "consultorio"])) return "Bastidores e rotina";
  if (hasKeyword(keywords, ["cta", "avaliacao", "consulta"])) return "CTA e avaliacao";
  return "Tema a revisar";
}

export function inferPillarFromKeywords(keywords: string[]): string {
  if (hasKeyword(keywords, ["protese", "silicone", "ml", "mamas"])) return "Mamas e protese de silicone";
  if (hasKeyword(keywords, ["mamoplastia", "redutora"])) return "Mamoplastia redutora";
  if (hasKeyword(keywords, ["lipo", "lipoaspiracao", "contorno"])) return "Lipoaspiracao e contorno corporal";
  if (hasKeyword(keywords, ["maternidade", "pos-gestacao"])) return "Maternidade e pos-gestacao";
  if (hasKeyword(keywords, ["naturalidade", "exagero", "resultado"])) return "Naturalidade e seguranca";
  if (hasKeyword(keywords, ["autoridade", "aula", "checklist", "seguranca"])) return "Autoridade medica";
  if (hasKeyword(keywords, ["bastidor", "bastidores", "rotina", "equipe", "clinica", "consultorio", "agenda"])) return "Bastidores e rotina";
  if (hasKeyword(keywords, ["mito", "nao-emagrece"])) return "Quebra de mitos";
  return "A revisar";
}

export function inferFunnelStageFromKeywords(keywords: string[]): ContentFunnelStage {
  if (hasKeyword(keywords, ["resultado", "antes-depois", "depoimento", "paciente", "avaliacao", "consulta"])) return "BOFU";
  if (hasKeyword(keywords, ["mamoplastia", "redutora", "lipo", "lipoaspiracao", "seguranca", "planejamento"])) return "MOFU";
  if (hasKeyword(keywords, ["protese", "silicone", "ml", "mamas", "autoridade", "duvida"])) return "MOFU";
  return "TOFU";
}

export function inferSuggestedUseFromFilename(filename: string): MediaSuggestedUse {
  const keywords = detectKeywordsFromFilename(filename);
  if (hasKeyword(keywords, ["site", "conteudo-site"])) return "site";
  if (hasKeyword(keywords, ["story", "stories", "cta", "bastidor", "rotina", "consultorio", "equipe"])) return "stories";
  if (hasKeyword(keywords, ["tiktok", "nao-emagrece"])) return "tiktok";
  if (hasKeyword(keywords, ["reels"])) return "reels";
  if (hasKeyword(keywords, ["video-curto"])) return "shorts";
  if (inferAssetTypeFromFilename(filename) === "video") return "reels";
  return "stories";
}

export function inferPrivacyRiskFromFilename(filename: string): PatientPrivacyRisk {
  const keywords = detectKeywordsFromFilename(filename);
  if (hasKeyword(keywords, ["paciente", "depoimento", "resultado", "antes-depois"])) return "high";
  if (hasKeyword(keywords, ["consulta", "centro-cirurgico", "pos-operatorio", "familia"])) return "medium";
  return "low";
}

export function inferApprovalStatusFromRisk(filename: string, risk: PatientPrivacyRisk = inferPrivacyRiskFromFilename(filename)): MediaApprovalStatus {
  const keywords = detectKeywordsFromFilename(filename);
  if (hasKeyword(keywords, ["antes-depois"])) return "blocked";
  if (risk === "high") return "needs_adjustment";
  return "not_reviewed";
}

export function generateMediaCatalogingSuggestions(items: MediaManifestItem[]): MediaCatalogingSuggestion[] {
  const duplicateKeys = new Set(detectDuplicateFilenameCandidates(items).map((candidate) => candidate.baseName));

  return items.map((item) => {
    const keywords = item.detectedKeywords;
    const privacyRisk = inferPrivacyRiskFromFilename(item.filename);
    const confidence = calculateConfidence(item, privacyRisk);
    const warnings = buildSuggestionWarnings(item, privacyRisk, confidence, duplicateKeys);
    const status = determineSuggestionStatus(item, privacyRisk, confidence);

    return {
      id: `${item.id}-suggestion`,
      manifestItemId: item.id,
      filename: item.filename,
      displayName: displayNameFromFilename(item.filename),
      suggestedAssetType: item.probableAssetType,
      suggestedOrientation: item.probableOrientation,
      suggestedTheme: inferThemeFromKeywords(keywords),
      suggestedPillar: inferPillarFromKeywords(keywords),
      suggestedFunnelStage: inferFunnelStageFromKeywords(keywords),
      suggestedUse: inferSuggestedUseFromFilename(item.filename),
      suggestedTags: keywords,
      suggestedDescription: `Rascunho catalogado a partir do nome ${item.filename}.`,
      suggestedPrivacyRisk: privacyRisk,
      suggestedApprovalStatus: inferApprovalStatusFromRisk(item.filename, privacyRisk),
      suggestedUsageStatus: status === "blocked" ? "blocked" : "unused",
      confidence,
      status,
      warnings,
      reviewQuestions: generateReviewQuestionsForSuggestion(item, privacyRisk, confidence),
      createdAt: baseDate,
      updatedAt: baseDate
    };
  });
}

export function generateReviewQuestionsForSuggestion(
  item: MediaManifestItem | MediaCatalogingSuggestion,
  privacyRisk?: PatientPrivacyRisk,
  confidence?: MediaCatalogingConfidence
): string[] {
  const filename = item.filename;
  const keywords = "detectedKeywords" in item ? item.detectedKeywords : item.suggestedTags;
  const risk = privacyRisk ?? inferPrivacyRiskFromFilename(filename);
  const currentConfidence = confidence ?? ("confidence" in item ? item.confidence : "medium");
  const questions: string[] = [];

  if (risk === "high") questions.push("A midia expoe paciente, resultado, depoimento ou antes/depois?");
  if (hasKeyword(keywords, ["antes-depois"])) questions.push("O material respeita as regras eticas para antes/depois?");
  if (hasKeyword(keywords, ["resultado", "depoimento"])) questions.push("Ha aprovacao medica e consentimento adequado para uso?");
  if (hasKeyword(keywords, ["cta", "avaliacao", "consulta"])) questions.push("O CTA esta adequado, sem promessa de resultado?");
  if (currentConfidence === "low") questions.push("Qual pilar, funil e uso correto devem ser definidos manualmente?");
  if (questions.length === 0) questions.push("Confirmar pilar, uso e aprovacao antes de importar para a Biblioteca de Midias.");

  return questions;
}

export function detectDuplicateFilenameCandidates(items: MediaManifestItem[]): Array<{ baseName: string; filenames: string[] }> {
  const grouped = items.reduce<Record<string, string[]>>((acc, item) => {
    const baseName = normalizeFilename(stripExtension(item.filename)).replace(/-\d+$/, "");
    acc[baseName] = [...(acc[baseName] ?? []), item.filename];
    return acc;
  }, {});

  return Object.entries(grouped)
    .filter(([, filenames]) => filenames.length > 1)
    .map(([baseName, filenames]) => ({ baseName, filenames }));
}

export function summarizeMediaCataloging(suggestions: MediaCatalogingSuggestion[]): MediaCatalogingSummary {
  return {
    totalItems: suggestions.length,
    imageItems: suggestions.filter((suggestion) => suggestion.suggestedAssetType === "photo").length,
    videoItems: suggestions.filter((suggestion) => suggestion.suggestedAssetType === "video").length,
    unknownItems: suggestions.filter((suggestion) => suggestion.suggestedAssetType === "unknown").length,
    highConfidence: suggestions.filter((suggestion) => suggestion.confidence === "high").length,
    mediumConfidence: suggestions.filter((suggestion) => suggestion.confidence === "medium").length,
    lowConfidence: suggestions.filter((suggestion) => suggestion.confidence === "low").length,
    needsReview: suggestions.filter((suggestion) => suggestion.status === "needs_review").length,
    readyToImport: suggestions.filter((suggestion) => suggestion.status === "ready_to_import").length,
    blocked: suggestions.filter((suggestion) => suggestion.status === "blocked").length,
    privacyRiskItems: suggestions.filter((suggestion) => suggestion.suggestedPrivacyRisk === "high").length,
    duplicateCandidates: detectDuplicateFilenameCandidates(
      suggestions.map((suggestion, index) => ({
        id: `summary-${index}`,
        rawLine: suggestion.filename,
        filename: suggestion.filename,
        extension: extractExtension(suggestion.filename),
        probableAssetType: suggestion.suggestedAssetType,
        probableOrientation: suggestion.suggestedOrientation,
        detectedKeywords: suggestion.suggestedTags,
        notes: "",
        source: "simulated",
        createdAt: suggestion.createdAt
      }))
    ).length,
    suggestedPillars: countBy(suggestions.map((suggestion) => suggestion.suggestedPillar))
  };
}

export function createMediaImportDrafts(suggestions: MediaCatalogingSuggestion[]): MediaImportDraft[] {
  return suggestions.map((suggestion) => ({
    id: `${suggestion.id}-draft`,
    suggestionId: suggestion.id,
    mediaAssetDraft: convertSuggestionToMediaAssetDraft(suggestion),
    importStatus: suggestion.status === "ready_to_import" ? "ready" : suggestion.status === "blocked" ? "blocked" : "needs_review",
    warnings: suggestion.warnings,
    createdAt: baseDate
  }));
}

export function convertSuggestionToMediaAssetDraft(suggestion: MediaCatalogingSuggestion): MediaAsset {
  return {
    id: `draft-${suggestion.id}`,
    filename: suggestion.filename,
    displayName: suggestion.displayName,
    filePath: `/simulado/catalogacao/${suggestion.filename}`,
    assetType: suggestion.suggestedAssetType === "unknown" ? "document" : suggestion.suggestedAssetType,
    orientation: suggestion.suggestedOrientation,
    source: "Catalogacao assistida simulada",
    theme: suggestion.suggestedTheme,
    pillar: suggestion.suggestedPillar,
    funnelStage: suggestion.suggestedFunnelStage,
    suggestedUse: suggestion.suggestedUse,
    description: suggestion.suggestedDescription,
    tags: suggestion.suggestedTags,
    usageStatus: suggestion.suggestedUsageStatus,
    approvalStatus: suggestion.suggestedApprovalStatus,
    ethicalNotes: suggestion.warnings.join(" ") || "Rascunho exige revisao humana antes de uso.",
    patientPrivacyRisk: suggestion.suggestedPrivacyRisk,
    createdAt: suggestion.createdAt,
    updatedAt: suggestion.updatedAt
  };
}

export function filterSuggestionsByStatus(suggestions: MediaCatalogingSuggestion[], status: MediaCatalogingStatus): MediaCatalogingSuggestion[] {
  return suggestions.filter((suggestion) => suggestion.status === status);
}

export function filterSuggestionsByConfidence(suggestions: MediaCatalogingSuggestion[], confidence: MediaCatalogingConfidence): MediaCatalogingSuggestion[] {
  return suggestions.filter((suggestion) => suggestion.confidence === confidence);
}

export function filterSuggestionsByPillar(suggestions: MediaCatalogingSuggestion[], pillar: string): MediaCatalogingSuggestion[] {
  return suggestions.filter((suggestion) => suggestion.suggestedPillar === pillar);
}

export function filterSuggestionsByPrivacyRisk(suggestions: MediaCatalogingSuggestion[], risk: PatientPrivacyRisk): MediaCatalogingSuggestion[] {
  return suggestions.filter((suggestion) => suggestion.suggestedPrivacyRisk === risk);
}

export function getCatalogingWarnings(): string[] {
  return [
    "Nesta fase, a catalogacao usa apenas nomes de arquivos simulados.",
    "Nenhum arquivo real e lido, enviado ou analisado visualmente.",
    "Nao ha upload, OCR, reconhecimento de imagem, API externa, banco ou persistencia.",
    "Toda sugestao precisa de validacao humana antes de entrar na Biblioteca de Midias.",
    "Arquivos com paciente, depoimento, resultado ou antes/depois exigem revisao etica manual."
  ];
}

export function catalogingConfidenceLabel(confidence: MediaCatalogingConfidence): string {
  return {
    low: "Baixa confiança",
    medium: "Média confiança",
    high: "Alta confiança"
  }[confidence];
}

export function catalogingStatusLabel(status: MediaCatalogingStatus): string {
  return {
    draft: "Rascunho",
    needs_review: "Precisa revisão",
    ready_to_import: "Pronto para importar",
    blocked: "Bloqueado"
  }[status];
}

function determineSuggestionStatus(item: MediaManifestItem, privacyRisk: PatientPrivacyRisk, confidence: MediaCatalogingConfidence): MediaCatalogingStatus {
  const keywords = item.detectedKeywords;
  if (item.probableAssetType === "unknown") return "needs_review";
  if (hasKeyword(keywords, ["antes-depois"])) return "blocked";
  if (privacyRisk === "high") return "needs_review";
  if (confidence === "low") return "needs_review";
  if (confidence === "high") return "ready_to_import";
  return "draft";
}

function calculateConfidence(item: MediaManifestItem, privacyRisk: PatientPrivacyRisk): MediaCatalogingConfidence {
  if (item.probableAssetType === "unknown") return "low";
  if (item.detectedKeywords.length === 0) return "low";
  if (privacyRisk === "high") return "medium";
  if (item.detectedKeywords.length >= 2 && inferPillarFromKeywords(item.detectedKeywords) !== "A revisar") return "high";
  return "medium";
}

function buildSuggestionWarnings(
  item: MediaManifestItem,
  privacyRisk: PatientPrivacyRisk,
  confidence: MediaCatalogingConfidence,
  duplicateKeys: Set<string>
): string[] {
  const warnings: string[] = ["Sugestao assistida; nao representa aprovacao final."];
  const normalizedBase = normalizeFilename(stripExtension(item.filename)).replace(/-\d+$/, "");
  if (item.probableAssetType === "unknown") warnings.push("Extensao desconhecida; revisar manualmente antes de importar.");
  if (confidence === "low") warnings.push("Baixa confianca de catalogacao; revisar pilar, funil e uso.");
  if (privacyRisk === "high") warnings.push("Revisao etica obrigatoria por possivel paciente, depoimento, resultado ou antes/depois.");
  if (hasKeyword(item.detectedKeywords, ["antes-depois"])) warnings.push("Possivel antes/depois: bloquear ate revisao etica formal.");
  if (duplicateKeys.has(normalizedBase)) warnings.push("Possivel duplicata ou variacao de uma mesma sequencia.");
  return warnings;
}

function extractFilename(line: string): string {
  const normalized = line.replace(/\\/g, "/");
  return normalized.split("/").filter(Boolean).at(-1)?.trim() ?? line.trim();
}

function extractExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.at(-1)!.toLowerCase() : "";
}

function stripExtension(filename: string): string {
  return filename.replace(/\.[^.]+$/, "");
}

function displayNameFromFilename(filename: string): string {
  return stripExtension(filename)
    .split(/[-_]+/)
    .filter((part) => !/^\d+$/.test(part))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, "-");
}

function containsAny(value: string, candidates: string[]): boolean {
  return candidates.some((candidate) => value.includes(candidate));
}

function hasKeyword(keywords: string[], candidates: string[]): boolean {
  return candidates.some((candidate) => keywords.includes(candidate));
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function emptyCatalogingSummary(): MediaCatalogingSummary {
  return {
    totalItems: 0,
    imageItems: 0,
    videoItems: 0,
    unknownItems: 0,
    highConfidence: 0,
    mediumConfidence: 0,
    lowConfidence: 0,
    needsReview: 0,
    readyToImport: 0,
    blocked: 0,
    privacyRiskItems: 0,
    duplicateCandidates: 0,
    suggestedPillars: {}
  };
}

const keywordDictionary = [
  "agenda",
  "antes-depois",
  "aula",
  "autoridade",
  "avaliacao",
  "bastidor",
  "bastidores",
  "cadu",
  "centro-cirurgico",
  "checklist",
  "clinica",
  "consulta",
  "consultorio",
  "conteudo-site",
  "contorno",
  "cta",
  "depoimento",
  "duvida",
  "equipe",
  "estudando",
  "exagero",
  "familia",
  "foto",
  "lipo",
  "lipoaspiracao",
  "mamoplastia",
  "mamas",
  "maternidade",
  "ml",
  "nao-emagrece",
  "naturalidade",
  "paciente",
  "planejamento",
  "pos-gestacao",
  "pos-operatorio",
  "preparo",
  "protese",
  "redutora",
  "reels",
  "resultado",
  "revisar",
  "revisao-etica",
  "rotina",
  "seguranca",
  "silicone",
  "story",
  "video-curto"
];
