import { describe, expect, it } from "vitest";
import {
  buildWeeklyCollectionExample,
  buildWeeklyCollectionTemplate,
  getWeeklyCollectionSafetyChecklist,
  getWeeklyCollectionTemplateSections
} from "@/lib/weeklyCollectionTemplate";
import { parseWeeklyAssistedImport } from "@/lib/weeklyAssistedImport";

describe("Weekly Collection Template", () => {
  it("organiza fontes semanais por canais esperados", () => {
    const sections = getWeeklyCollectionTemplateSections();

    expect(sections.map((section) => section.title)).toEqual(["Meta Ads", "Google Ads", "Instagram organico", "WhatsApp e funil comercial"]);
    expect(sections.flatMap((section) => section.fields.map((field) => field.label))).toEqual(
      expect.arrayContaining(["Investimento Meta Ads", "Conversas Meta", "Stories publicados", "Consultas marcadas"])
    );
  });

  it("gera template copiavel com aliases compativeis com a importacao assistida", () => {
    const template = buildWeeklyCollectionTemplate({
      weekLabel: "Semana teste",
      startDateLabel: "11/05/2026",
      endDateLabel: "17/05/2026"
    });

    expect(template).toContain("Periodo: 11/05/2026 a 17/05/2026");
    expect(template).toContain("Rotulo da semana: Semana teste");
    expect(template).toContain("Investimento Meta Ads:");
    expect(template).toContain("Conversoes Google Ads:");
    expect(template).toContain("Observacoes:");
  });

  it("mantem checklist de seguranca sem pedir dados pessoais", () => {
    const checklist = getWeeklyCollectionSafetyChecklist().join(" ");

    expect(checklist).toContain("apenas numeros consolidados");
    expect(checklist).toContain("Nao colar nomes");
    expect(checklist).not.toContain("API");
  });

  it("gera exemplo que a importacao assistida consegue reconhecer", () => {
    const result = parseWeeklyAssistedImport(buildWeeklyCollectionExample());

    expect(result.sensitiveWarnings).toEqual([]);
    expect(result.fields).toEqual(
      expect.objectContaining({
        startDate: "2026-05-11",
        endDate: "2026-05-17",
        metaSpend: 780,
        metaWhatsappConversations: 118,
        googleSpend: 220,
        googleClicks: 48,
        instagramStories: 42,
        consultationsScheduled: 12
      })
    );
  });
});
