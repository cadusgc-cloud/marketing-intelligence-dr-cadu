import { describe, expect, it } from "vitest";
import { generateMediaCatalogingSuggestions, parseMediaManifestText } from "@/lib/mediaCataloging";
import {
  balanceStoryPlanByFunnelStage,
  buildDailyStoryPlanFromCatalog,
  buildWeeklyStoryPlanFromCatalog,
  getHighRiskCatalogSuggestions,
  getUnmatchedStorySlots,
  matchSuggestionToStorySlot,
  summarizeCatalogPlanning
} from "@/lib/storyPlanFromCatalog";

function suggestionsFromManifest(text: string) {
  return generateMediaCatalogingSuggestions(parseMediaManifestText(text));
}

describe("Story Plan From Catalog", () => {
  it("matchSuggestionToStorySlot associa bastidor ao slot bastidor humano", () => {
    const [suggestion] = suggestionsFromManifest("cadu-consultorio-bastidor-01.jpg");
    const match = matchSuggestionToStorySlot(suggestion, "human_bastidor");

    expect(match).toBeTruthy();
    expect(match?.slotType).toBe("human_bastidor");
    expect(match?.filename).toBe("cadu-consultorio-bastidor-01.jpg");
  });

  it("matchSuggestionToStorySlot associa protese/mamas ao slot procedimento ou duvida frequente", () => {
    const [suggestion] = suggestionsFromManifest("protese-silicone-explicacao-01.mp4");

    expect(matchSuggestionToStorySlot(suggestion, "procedimento")).toBeTruthy();
    expect(matchSuggestionToStorySlot(suggestion, "duvida_frequente")).toBeTruthy();
  });

  it("matchSuggestionToStorySlot associa lipo ao slot procedimento", () => {
    const [suggestion] = suggestionsFromManifest("lipoaspiracao-planejamento-01.mp4");
    const match = matchSuggestionToStorySlot(suggestion, "procedimento");

    expect(match).toBeTruthy();
    expect(match?.confidence).not.toBe("low");
  });

  it("matchSuggestionToStorySlot associa maternidade/naturalidade ao slot maternidade", () => {
    const [suggestion] = suggestionsFromManifest("maternidade-naturalidade-01.jpg");
    const match = matchSuggestionToStorySlot(suggestion, "maternidade_naturalidade");

    expect(match).toBeTruthy();
    expect(match?.slotType).toBe("maternidade_naturalidade");
  });

  it("matchSuggestionToStorySlot associa cta/avaliacao/consulta aos slots CTA", () => {
    const [suggestion] = suggestionsFromManifest("story-cta-avaliacao-01.jpg");

    expect(matchSuggestionToStorySlot(suggestion, "cta_leve")).toBeTruthy();
    expect(matchSuggestionToStorySlot(suggestion, "cta_direto")).toBeTruthy();
  });

  it("paciente/resultado/antes-depois gera warning etico", () => {
    const [suggestion] = suggestionsFromManifest("foto-paciente-antes-depois-revisar-01.jpg");
    const match = matchSuggestionToStorySlot(suggestion, "prova_confianca");

    expect(suggestion.suggestedPrivacyRisk).toBe("high");
    expect(match?.warnings.join(" ")).toContain("Revisão ética");
  });

  it("buildDailyStoryPlanFromCatalog cria 10 slots", () => {
    const suggestions = suggestionsFromManifest(defaultManifest);
    const plan = buildDailyStoryPlanFromCatalog(suggestions);

    expect(plan.slots).toHaveLength(10);
    expect(plan.totalStories).toBe(10);
  });

  it("plano diario contem CTA leve e CTA direto", () => {
    const suggestions = suggestionsFromManifest(defaultManifest);
    const slotTypes = buildDailyStoryPlanFromCatalog(suggestions).slots.map((slot) => slot.slotType);

    expect(slotTypes).toContain("cta_leve");
    expect(slotTypes).toContain("cta_direto");
  });

  it("plano diario sinaliza slot sem midia quando faltar sugestao adequada", () => {
    const suggestions = suggestionsFromManifest("protese-silicone-explicacao-01.mp4");
    const plan = buildDailyStoryPlanFromCatalog(suggestions);

    expect(getUnmatchedStorySlots(plan.slots).length).toBeGreaterThan(0);
    expect(plan.warnings.join(" ")).toContain("sem mídia adequada");
  });

  it("buildWeeklyStoryPlanFromCatalog cria 7 dias", () => {
    const suggestions = suggestionsFromManifest(defaultManifest);
    const weeklyPlan = buildWeeklyStoryPlanFromCatalog(suggestions);

    expect(weeklyPlan.dailyPlans).toHaveLength(7);
    expect(weeklyPlan.totalStories).toBe(70);
    expect(weeklyPlan.averageStoriesPerDay).toBe(10);
  });

  it("summarizeCatalogPlanning calcula totais", () => {
    const suggestions = suggestionsFromManifest(defaultManifest);
    const summary = summarizeCatalogPlanning(suggestions);

    expect(summary.totalSuggestions).toBeGreaterThan(0);
    expect(summary.usableSuggestions).toBeGreaterThan(0);
    expect(summary.dailyStoriesPlanned).toBe(10);
    expect(summary.weeklyStoriesPlanned).toBe(70);
  });

  it("getUnmatchedStorySlots identifica lacunas", () => {
    const suggestions = suggestionsFromManifest("arquivo-sem-contexto.xyz");
    const plan = buildDailyStoryPlanFromCatalog(suggestions);

    expect(getUnmatchedStorySlots(plan.slots)).toHaveLength(10);
  });

  it("getHighRiskCatalogSuggestions identifica itens de risco", () => {
    const suggestions = suggestionsFromManifest("depoimento-paciente-revisar-01.mp4\nresultado-3-meses-explicacao-01.mp4");

    expect(getHighRiskCatalogSuggestions(suggestions)).toHaveLength(2);
  });

  it("balanceStoryPlanByFunnelStage evita plano so TOFU ou gera warning", () => {
    const suggestions = suggestionsFromManifest("cadu-consultorio-bastidor-01.jpg\nbastidores-equipe-clinica-01.jpg");
    const plan = buildDailyStoryPlanFromCatalog(suggestions);
    const balance = balanceStoryPlanByFunnelStage(plan.slots);

    expect(balance.warnings.length).toBeGreaterThan(0);
  });
});

const defaultManifest = [
  "cadu-consultorio-bastidor-01.jpg",
  "cadu-centro-cirurgico-preparo-01.jpg",
  "autoridade-aula-cirurgia-01.jpg",
  "duvida-frequente-mamas-01.mp4",
  "video-curto-lipo-nao-emagrece-01.mp4",
  "checklist-seguranca-cirurgica-01.jpg",
  "protese-silicone-explicacao-01.mp4",
  "maternidade-naturalidade-01.jpg",
  "story-cta-avaliacao-01.jpg",
  "agenda-semana-clinica-01.jpg"
].join("\n");
