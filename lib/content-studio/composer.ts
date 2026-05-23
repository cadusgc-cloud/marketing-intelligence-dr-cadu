import { buildContentExportBundle } from "@/lib/content-studio/exports";
import {
  CONTENT_STUDIO_CAPTIONS,
  CONTENT_STUDIO_CAROUSEL_TEMPLATES,
  CONTENT_STUDIO_HOOKS,
  CONTENT_STUDIO_REEL_HOOKS,
  CONTENT_STUDIO_THEMES,
  findContentStudioPillar
} from "@/lib/content-studio/library";
import { evaluateMarketingContentQuality } from "@/lib/content-studio/quality";
import { buildRecordingTopic } from "@/lib/content-studio/recording";
import { generateContentVariants } from "@/lib/content-studio/variants";
import type {
  CaptionAtom,
  CarouselDraft,
  ContentFormat,
  ContentStudioInput,
  ContentStudioPackage,
  EditorBriefing,
  MediaChecklist,
  PostDraft,
  ProductionTask,
  ReelScript,
  ReviewItem
} from "@/lib/content-studio/types";
import { buildStoryOpsSequence } from "@/lib/storyops";

const defaultInput: Required<ContentStudioInput> = {
  theme: "cirurgia plastica nao combina com pressa",
  pillarId: "expectativa_realista",
  format: "pacote_completo",
  date: "2026-05-24",
  audience: "Pacientes que buscam informacao clara antes de decidir.",
  tone: "humano, espontaneo, cientifico simples e anti-marketing elegante",
  contextNote: "Usar contexto neutro, sem local real e sem bastidor especifico."
};

export function normalizeContentStudioInput(input: ContentStudioInput = {}): Required<ContentStudioInput> {
  const theme = (input.theme || defaultInput.theme).trim() || defaultInput.theme;
  const pillar = findContentStudioPillar(input.pillarId);
  return {
    theme,
    pillarId: pillar.id,
    format: input.format ?? defaultInput.format,
    date: normalizeDate(input.date ?? defaultInput.date),
    audience: input.audience ?? defaultInput.audience,
    tone: input.tone ?? defaultInput.tone,
    contextNote: input.contextNote ?? defaultInput.contextNote
  };
}

export function generateContentStudioPackage(input: ContentStudioInput = {}): ContentStudioPackage {
  const normalized = normalizeContentStudioInput(input);
  const pillar = findContentStudioPillar(normalized.pillarId);
  const storySequence = buildStoryOpsSequence({
    date: normalized.date,
    theme: normalized.theme,
    editorialLine: "expectativa_realista",
    neutralContext: normalized.contextNote
  });
  const reel = buildReelScript(normalized.theme, normalized.format);
  const carousel = buildCarouselDraft(normalized.theme);
  const post = buildPostDraft(normalized.theme);
  const captions = selectCaptions(normalized.theme);
  const mediaChecklist = buildMediaChecklist(normalized.theme);
  const editorBriefing = buildEditorBriefing(normalized.theme, normalized.format, reel);
  const variants = generateContentVariants(normalized.theme);
  const quality = evaluateMarketingContentQuality([
    storySequence.items.map((item) => item.textOnScreen).join("\n"),
    reel.spokenScript,
    reel.onScreenText.join("\n"),
    carousel.cards.join("\n"),
    carousel.caption,
    post.screenText,
    post.caption,
    captions.map((caption) => caption.text).join("\n")
  ].join("\n\n"));
  const productionTasks = buildProductionTasks(normalized.theme, normalized.format, mediaChecklist.required, quality.riskLevel, quality.readinessScore);
  const reviewItem = buildReviewItem(normalized.theme, normalized.format, quality);
  const recordingPlan = buildRecordingTopic(normalized.theme, 1);
  const id = `studio-${slug(normalized.theme)}`;
  const exports = buildContentExportBundle({
    id,
    input: normalized,
    theme: normalized.theme,
    pillarName: pillar.name,
    storySequence,
    reel,
    carousel,
    post,
    captions,
    editorBriefing,
    mediaChecklist,
    quality
  });

  return {
    id,
    input: normalized,
    pillar,
    theme: normalized.theme,
    storySequence,
    reel,
    carousel,
    post,
    captions,
    variants,
    editorBriefing,
    mediaChecklist,
    productionTasks,
    reviewItem,
    recordingPlan,
    exports,
    quality,
    status: quality.blocked ? "bloqueado" : quality.requiresHumanReview ? "precisa_revisao" : "aprovado",
    createdAt: new Date("2026-05-23T15:00:00.000Z")
  };
}

export function generateDefaultStudioPackages(count = 10): ContentStudioPackage[] {
  return CONTENT_STUDIO_THEMES.slice(0, count).map((theme, index) => generateContentStudioPackage({
    theme,
    pillarId: ["expectativa_realista", "estetica_natural", "consulta_nao_e_venda", "seguranca"][index % 4],
    date: `2026-05-${String(24 + (index % 7)).padStart(2, "0")}`
  }));
}

function buildReelScript(theme: string, format: ContentFormat): ReelScript {
  const hook = CONTENT_STUDIO_REEL_HOOKS[Math.abs(theme.length) % CONTENT_STUDIO_REEL_HOOKS.length];
  const spokenScript = [
    `${hook}`,
    `Quando o tema e ${theme}, a primeira coisa e sair da promessa e voltar para criterio.`,
    "Uma decisao melhor nasce de avaliacao, limites conversados e expectativa realista.",
    "Isso nao substitui consulta; serve para organizar a conversa com mais calma."
  ].join(" ");
  const onScreenText = [
    "sem pressa",
    "sem promessa",
    "com criterio",
    "revisar antes de decidir"
  ];
  const exportText = [
    `# Reel - ${theme}`,
    `Gancho: ${hook}`,
    `Fala sugerida: ${spokenScript}`,
    `Texto na tela: ${onScreenText.join(" | ")}`,
    "Cena: video vertical curto falando para camera, fundo simples e nao identificavel.",
    "Seguranca: nao citar paciente, local, antes/depois ou promessa."
  ].join("\n");
  return {
    id: `reel-${slug(theme)}`,
    title: `Reel - ${theme}`,
    hook,
    spokenScript,
    onScreenText,
    suggestedScenes: ["fala para camera", "take neutro de apoio", "capa simples sem antes/depois"],
    estimatedDurationSeconds: format === "reel" ? 45 : 38,
    recordingBriefing: [
      `Gravar video curto sobre ${theme}.`,
      "Uma ideia por take, sem falar de caso real.",
      "Usar fundo simples e evitar placa, tela, prontuario ou local reconhecivel.",
      "Fechar com convite leve para pensar com calma."
    ].join("\n"),
    safetyNote: "Publicacao manual somente apos revisao humana.",
    exportText
  };
}

function buildCarouselDraft(theme: string): CarouselDraft {
  const template = CONTENT_STUDIO_CAROUSEL_TEMPLATES[Math.abs(theme.length) % CONTENT_STUDIO_CAROUSEL_TEMPLATES.length];
  const cards = template.map((line, index) => index === 0 ? `${capitalize(theme)}` : line);
  return {
    id: `carousel-${slug(theme)}`,
    title: `Carrossel - ${theme}`,
    cards,
    caption: `${capitalize(theme)}. Um lembrete para pensar com criterio, sem promessa e sem pressa.`,
    visualSuggestion: "Fundo claro, tipografia simples, sem antes/depois, sem foto de paciente e sem cara de campanha.",
    safetyNote: "Revisar cards para nao individualizar conduta.",
    exportText: [
      `# Carrossel - ${theme}`,
      ...cards.map((card, index) => `Card ${index + 1}: ${card}`),
      "Legenda: Um lembrete para pensar com criterio, sem promessa e sem pressa.",
      "Design: simples, limpo e educativo."
    ].join("\n")
  };
}

function buildPostDraft(theme: string): PostDraft {
  return {
    id: `post-${slug(theme)}`,
    title: `Post estatico - ${theme}`,
    screenText: `${capitalize(theme)}: clareza antes da decisao.`,
    caption: `${capitalize(theme)}. O objetivo aqui e organizar a conversa, nao vender uma resposta pronta.`,
    visualSuggestion: "Foto neutra, fundo simples ou texto discreto com cara de nota editorial.",
    safetyNote: "Evitar promessa, caso real e chamada agressiva.",
    exportText: [
      `# Post estatico - ${theme}`,
      `Texto de tela: ${capitalize(theme)}: clareza antes da decisao.`,
      "Legenda: O objetivo aqui e organizar a conversa, nao vender uma resposta pronta.",
      "Visual: foto neutra ou fundo simples."
    ].join("\n")
  };
}

function selectCaptions(theme: string): CaptionAtom[] {
  const base = CONTENT_STUDIO_CAPTIONS.slice(0, 4).map((caption, index) => ({
    ...caption,
    id: `${caption.id}-${slug(theme)}`,
    text: [
      `${capitalize(theme)}.`,
      "Pensar com calma tambem e cuidado.",
      "Informacao clara ajuda mais do que promessa bonita.",
      "Este conteudo e educativo e nao substitui avaliacao individual."
    ][index]
  }));
  return base;
}

function buildEditorBriefing(theme: string, format: ContentFormat, reel: ReelScript): EditorBriefing {
  const briefing: Omit<EditorBriefing, "exportText"> = {
    id: `briefing-${slug(theme)}`,
    title: `Briefing editor - ${theme}`,
    objective: "Transformar uma ideia educativa em conteudo curto, claro e seguro.",
    format,
    rhythm: "Cortes calmos, sem trilha sensacionalista e sem promessa visual.",
    cuts: ["gancho curto", "explicacao simples", "limite importante", "fechamento responsavel"],
    visualElements: ["fundo simples", "legendas curtas", "capa vertical discreta"],
    onScreenText: reel.onScreenText,
    safetyCare: ["sem antes/depois", "sem paciente", "sem local", "sem CTA agressivo", "sem promessa"]
  };
  return {
    ...briefing,
    exportText: [
      `# ${briefing.title}`,
      `Objetivo: ${briefing.objective}`,
      `Formato: ${briefing.format}`,
      `Ritmo: ${briefing.rhythm}`,
      `Cortes: ${briefing.cuts.join(", ")}`,
      `Textos na tela: ${briefing.onScreenText.join(" | ")}`,
      `Cuidados: ${briefing.safetyCare.join(", ")}`
    ].join("\n")
  };
}

function buildMediaChecklist(theme: string): MediaChecklist {
  const required = ["video curto falando para camera", "fundo simples", "capa simples para reel", "foto neutra de apoio"];
  const optional = ["mesa com agenda sem dados", "livro ou artigo sem dado sensivel", "imagem de fim de dia"];
  const avoid = ["paciente visivel", "prontuario", "exame identificavel", "endereco", "hospital/clinica identificavel", "antes/depois", "cirurgia de hoje"];
  return {
    required,
    optional,
    avoid,
    exportText: [
      `# Checklist de midia - ${theme}`,
      "## Gravar/fotografar",
      ...required.map((item) => `- ${item}`),
      "## Opcional",
      ...optional.map((item) => `- ${item}`),
      "## Evitar/bloquear",
      ...avoid.map((item) => `- ${item}`)
    ].join("\n")
  };
}

function buildProductionTasks(theme: string, format: ContentFormat, requiredMedia: string[], safetyStatus: ProductionTask["safetyStatus"], readiness: number): ProductionTask[] {
  const status = safetyStatus === "bloquear" ? "bloqueado" : readiness >= 82 ? "pronto" : "pendente";
  return [
    task(theme, format, "revisar pacote editorial", "alta", safetyStatus === "bloquear" ? "bloqueado" : "pendente", requiredMedia, safetyStatus, readiness),
    task(theme, "reel", "gravar video curto", "alta", status, ["video curto falando para camera"], safetyStatus, readiness),
    task(theme, "stories", "copiar stories do dia", "media", status, ["selfie neutra", "fundo simples"], safetyStatus, readiness),
    task(theme, "carrossel", "preparar carrossel simples", "media", status, ["fundo simples"], safetyStatus, readiness),
    task(theme, "briefing_editor", "enviar briefing ao editor manualmente", "media", safetyStatus === "bloquear" ? "bloqueado" : "pendente", requiredMedia, safetyStatus, readiness)
  ];
}

function task(theme: string, format: ContentFormat, title: string, priority: ProductionTask["priority"], status: ProductionTask["status"], requiredMedia: string[], safetyStatus: ProductionTask["safetyStatus"], readiness: number): ProductionTask {
  return {
    id: `task-${slug(title)}-${slug(theme)}`,
    title,
    format,
    theme,
    priority,
    status,
    dueHint: "esta semana",
    requiredMedia,
    safetyStatus,
    readiness,
    exportText: `${title}\nTema: ${theme}\nFormato: ${format}\nMidia: ${requiredMedia.join(", ")}\nStatus: ${status}`
  };
}

function buildReviewItem(theme: string, format: ContentFormat, quality: ReturnType<typeof evaluateMarketingContentQuality>): ReviewItem {
  return {
    id: `review-${slug(theme)}`,
    title: `Revisao - ${theme}`,
    format,
    theme,
    status: quality.blocked ? "bloqueado" : quality.requiresHumanReview ? "precisa_revisao" : "aprovado",
    voiceScore: quality.voiceScore,
    safetyScore: quality.safetyScore,
    readinessScore: quality.readinessScore,
    risks: quality.issues.map((issue) => issue.message),
    exportText: `Revisar tema: ${theme}\nVoice: ${quality.voiceScore}/100\nSafety: ${quality.safetyScore}/100\nReadiness: ${quality.readinessScore}/100`
  };
}

function normalizeDate(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : defaultInput.date;
}

function slug(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
