import { MEDIAOPS_V3_BLOCKED_TERMS, MEDIAOPS_V3_CATEGORIES } from "@/lib/marketing-ops/constants";
import type { DailyExecutionPlan, EditorialAssetNeed, MediaCaptureTask } from "@/lib/marketing-ops/types";
import { evaluateMediaText } from "@/lib/monthly-editorial";

export function buildEditorialAssetNeeds(days: DailyExecutionPlan[]): EditorialAssetNeed[] {
  const needs = days.flatMap((day) =>
    day.sourceDay.mediaSuggestions.map((media) => ({
      id: `${day.date}-${media.category}`,
      category: media.category,
      label: media.label,
      reason: `Necessaria para ${day.theme} em ${day.date}.`,
      priority: media.risk === "revisar_antes_de_postar" ? "alta" : "media",
      blocked: media.risk === "bloquear"
    }) satisfies EditorialAssetNeed)
  );
  return dedupeNeeds(needs);
}

export function detectMediaOpsGaps(days: DailyExecutionPlan[]): string[] {
  const text = days.flatMap((day) => day.sourceDay.mediaSuggestions.map((media) => media.category)).join(" ");
  const gaps = [
    gap("video_curto_falando", "faltam videos curtos", text),
    gap("fundo_simples", "faltam fundos simples", text),
    gap("livro_artigo", "faltam fotos de estudo", text),
    gap("imagem_fim_de_dia", "faltam materiais de fim de dia", text),
    gap("plastica", "faltam imagens para Plastica em Evidencia", days.map((day) => day.theme).join(" ")),
    gap("carrossel", "faltam midias para carrossel", days.map((day) => day.sourceDay.content.carouselPlan?.title ?? "").join(" ")),
    gap("capa", "faltam capas de reels", text)
  ].filter(Boolean) as string[];
  return gaps.length ? gaps : ["midia natural suficiente para o plano inicial"];
}

export function detectBlockedMediaTerms(text: string): string[] {
  const gate = evaluateMediaText(text);
  const detected = MEDIAOPS_V3_BLOCKED_TERMS.filter((term) => normalize(text).includes(normalize(term)));
  return Array.from(new Set([...detected, ...gate.detectedTerms]));
}

export function buildMediaCaptureTasks(days: DailyExecutionPlan[]): MediaCaptureTask[] {
  return days
    .flatMap((day) => day.tasks)
    .filter((task) => task.area === "media")
    .map((task) => ({
      ...task,
      mediaCategory: "midia natural",
      captureGuidance: "Capturar material vertical, neutro e sem identificacao.",
      privacyNote: "Bloquear se aparecer paciente, prontuario, exame, local, login, senha ou documento."
    }));
}

export function getMediaOpsCategories(): string[] {
  return MEDIAOPS_V3_CATEGORIES;
}

function gap(token: string, message: string, text: string): string | null {
  return normalize(text).includes(normalize(token)) ? null : message;
}

function dedupeNeeds(needs: EditorialAssetNeed[]): EditorialAssetNeed[] {
  const seen = new Set<string>();
  return needs.filter((need) => {
    const key = `${need.category}-${need.label}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
