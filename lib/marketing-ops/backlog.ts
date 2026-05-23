import {
  buildCarouselPlan,
  buildReelPlan,
  buildDailyMediaSuggestions,
  EDITORIAL_PILLARS,
  getEditorialPillarById,
  runMonthlySafetyGate
} from "@/lib/monthly-editorial";
import { buildStoryOpsSequence } from "@/lib/storyops";
import type { ContentBacklogItem, ContentRepurposingPlan, TaskPriority } from "@/lib/marketing-ops/types";
import type { EditorialPillarId, SafetyClassification } from "@/lib/monthly-editorial";

const backlogSeeds: Array<{ theme: string; pillar: EditorialPillarId; format: ContentBacklogItem["suggestedFormat"]; priority: TaskPriority }> = [
  { theme: "expectativa realista", pillar: "expectativa_realista", format: "reel", priority: "alta" },
  { theme: "resultado natural", pillar: "estetica_natural", format: "carrossel", priority: "alta" },
  { theme: "cicatrizacao", pillar: "recuperacao_cicatrizacao", format: "carrossel", priority: "media" },
  { theme: "recuperacao", pillar: "recuperacao_cicatrizacao", format: "reel", priority: "media" },
  { theme: "seguranca", pillar: "seguranca_cirurgia_plastica", format: "carrossel", priority: "alta" },
  { theme: "consulta nao e venda", pillar: "comunicacao_medico_paciente", format: "post", priority: "alta" },
  { theme: "cirurgia plastica nao combina com pressa", pillar: "decisao_consciente", format: "reel", priority: "alta" },
  { theme: "naturalidade tambem e planejamento", pillar: "naturalidade_sem_promessa", format: "story", priority: "media" },
  { theme: "o que o marketing nao mostra", pillar: "sem_marketing_exagerado", format: "reel", priority: "alta" },
  { theme: "decisao consciente", pillar: "decisao_consciente", format: "carrossel", priority: "alta" },
  { theme: "estudo e atualizacao", pillar: "ensino_formacao_medica", format: "story", priority: "media" },
  { theme: "Plastica em Evidencia", pillar: "plastica_em_evidencia", format: "youtube_video", priority: "media" },
  { theme: "pericia medica e clareza tecnica", pillar: "pericia_clareza_tecnica", format: "post", priority: "baixa" },
  { theme: "bastidores neutros", pillar: "bastidores_neutros_humanos", format: "story", priority: "media" },
  { theme: "reflexao de fim de dia", pillar: "bastidores_neutros_humanos", format: "story", priority: "baixa" }
];

export function buildContentBacklog(): ContentBacklogItem[] {
  return backlogSeeds.map((seed, index) => {
    const safety = runMonthlySafetyGate(seed.theme, "backlog");
    return {
      id: `backlog-${index + 1}`,
      pillar: seed.pillar,
      theme: seed.theme,
      suggestedFormat: seed.format,
      priority: seed.priority,
      editorialRisk: safety.classification,
      canBecomeStory: true,
      canBecomeReel: seed.format !== "youtube_video",
      canBecomeCarousel: seed.format !== "story",
      requiredMedia: requiredMediaForFormat(seed.format)
    };
  });
}

export function buildRepurposingPlan(item: ContentBacklogItem, date = "2026-05-24"): ContentRepurposingPlan {
  const pillar = getEditorialPillarById(item.pillar) ?? EDITORIAL_PILLARS[0];
  const story = buildStoryOpsSequence({ date, theme: item.theme, editorialLine: pillar.storyEditorialLine, neutralContext: "Contexto neutro e editavel, sem local ou paciente." });
  const reel = buildReelPlan(date, 1, item.theme, pillar);
  const carousel = buildCarouselPlan(date, 1, item.theme, pillar);
  const media = buildDailyMediaSuggestions(1, false);
  const shortCaption = `Sobre ${item.theme}: informacao clara ajuda mais do que promessa bonita.\n\nConteudo educativo, sem substituir avaliacao individual.`;
  const editorBriefing = [
    `Briefing do editor - ${item.theme}`,
    "Formato: cortes simples, legenda clara e tom sobrio.",
    `Pilar: ${pillar.name}`,
    "Evitar promessa, comparacao visual indevida, pessoa identificavel e CTA agressivo."
  ].join("\n");
  const mediaChecklist = media.map((mediaItem) => `- ${mediaItem.label}: ${mediaItem.captureGuidance}`).join("\n");
  const spontaneousSpeech = `Uma forma simples de falar sobre ${item.theme}: antes de decidir, vale entender contexto, limites e recuperacao.`;
  const onScreenText = ["uma ideia por vez", "sem promessa", "decisao com calma"].join(" | ");
  const googleAgenda = [
    "Titulo:",
    `Conteudo Dr. Cadu - ${item.theme}`,
    "",
    "Descricao:",
    `- Pilar: ${pillar.name}`,
    "- Stories: sequencia StoryOps",
    "- Reel: roteiro curto",
    "- Post: carrossel educativo",
    "- Midia: material neutro",
    "- Seguranca: revisar antes de postar",
    "- Status: pendente"
  ].join("\n");
  const googleSheets = ["Data\tPilar\tTema\tStories\tReel\tCarrossel\tMidia\tRisco", `${date}\t${pillar.name}\t${item.theme}\tsim\tsim\tsim\t${media.map((mediaItem) => mediaItem.label).join(" + ")}\t${item.editorialRisk}`].join("\n");
  const safetyGate = runMonthlySafetyGate([item.theme, story.exportText, reel.exportText, carousel.exportText, shortCaption, editorBriefing].join(" "), "repurposing");

  return {
    id: `repurpose-${item.id}`,
    theme: item.theme,
    pillar: item.pillar,
    storySequence: story.exportText,
    reelScript: reel.exportText,
    carousel: carousel.exportText,
    shortCaption,
    editorBriefing,
    mediaChecklist,
    spontaneousSpeech,
    onScreenText,
    googleAgenda,
    googleSheets,
    safetyGate
  };
}

export function buildRepurposingPlans(items = buildContentBacklog()): ContentRepurposingPlan[] {
  return items.slice(0, 6).map((item, index) => buildRepurposingPlan(item, `2026-05-${String(24 + index).padStart(2, "0")}`));
}

export function riskForBacklog(item: ContentBacklogItem): SafetyClassification {
  return runMonthlySafetyGate(item.theme, "backlog").classification;
}

function requiredMediaForFormat(format: ContentBacklogItem["suggestedFormat"]): string[] {
  if (format === "reel") return ["video curto falando para camera", "capa simples para reel", "fundo simples"];
  if (format === "carrossel") return ["fundo simples", "foto de estudo", "imagem abstrata para reflexao"];
  if (format === "youtube_video") return ["video curto falando para camera", "foto de estudo", "capa simples para reel"];
  if (format === "post") return ["selfie neutra", "fundo simples"];
  return ["selfie neutra", "imagem de fim de dia"];
}
