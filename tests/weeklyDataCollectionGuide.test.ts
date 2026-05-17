import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildWeeklyDataCollectionGuide,
  buildWeeklyDataCollectionSources,
  getActiveWeeklyCollectionFields,
  getOptionalWeeklyCollectionNotes
} from "@/lib/weeklyDataCollectionGuide";

describe("Weekly Data Collection Guide", () => {
  it("organiza fontes manuais para todos os blocos do input semanal", () => {
    const guide = buildWeeklyDataCollectionGuide();

    expect(guide.title).toBe("Guia de Coleta Semanal");
    expect(guide.sources.map((source) => source.id)).toEqual([
      "week-identity",
      "instagram-organic",
      "meta-ads",
      "google-ads",
      "commercial-funnel",
      "execution-context"
    ]);
    expect(guide.routeFlow.map((route) => route.href)).toEqual(
      expect.arrayContaining(["/data", "/weekly", "/weekly/execution", "/weekly/execution/packet"])
    );
  });

  it("mapeia campos ativos para os campos existentes em /data", () => {
    const activeFields = getActiveWeeklyCollectionFields();
    const appFields = activeFields.map((field) => field.appField);

    expect(appFields).toEqual(
      expect.arrayContaining([
        "weekLabel",
        "startDate",
        "endDate",
        "instagramStories",
        "instagramReels",
        "instagramPosts",
        "instagramProfileVisits",
        "metaSpend",
        "metaWhatsappConversations",
        "metaProfileVisits",
        "googleSpend",
        "googleClicks",
        "googleConversions",
        "whatsappTotal",
        "qualifiedConversations",
        "consultationsScheduled",
        "consultationsAttended",
        "surgeriesClosed",
        "notes"
      ])
    );
  });

  it("deixa alcance, impressoes e interacoes como observacao ate existir campo dedicado", () => {
    const optionalNotes = getOptionalWeeklyCollectionNotes();

    expect(optionalNotes.map((field) => field.id)).toEqual(
      expect.arrayContaining(["instagram-reach", "instagram-impressions", "instagram-interactions"])
    );
    expect(optionalNotes.every((field) => field.appField === "notes")).toBe(true);
  });

  it("preserva privacidade e bloqueia dados sensiveis", () => {
    const guideText = JSON.stringify(buildWeeklyDataCollectionGuide()).toLocaleLowerCase("pt-BR");

    expect(guideText).toContain("metricas agregadas");
    expect(guideText).toContain("nao usar dados de pacientes");
    expect(guideText).toContain("tokens");
    expect(guideText).toContain("dezembro/2025");
    expect(guideText).not.toMatch(/oauth obrigatorio|api obrigatoria|buscar automaticamente/);
  });

  it("integra rota e link do guia em /data", () => {
    const dataPage = readFileSync(path.join(process.cwd(), "app", "data", "page.tsx"), "utf8");
    const guidePage = readFileSync(path.join(process.cwd(), "app", "data", "collection-guide", "page.tsx"), "utf8");

    expect(dataPage).toContain("/data/collection-guide");
    expect(dataPage).toContain("Abrir guia de coleta");
    expect(guidePage).toContain("buildWeeklyDataCollectionGuide");
    expect(guidePage).toContain("De onde tirar cada dado");
    expect(guidePage).toContain("Dados proibidos nesta fase");
  });

  it("mantem fontes sem dependencias externas ou schema novo", () => {
    const sources = buildWeeklyDataCollectionSources();
    const text = JSON.stringify(sources).toLocaleLowerCase("pt-BR");

    expect(sources.every((source) => source.manualPath.length > 0)).toBe(true);
    expect(text).toContain("reportei");
    expect(text).toContain("planilha interna");
    expect(text).not.toMatch(/schema prisma|migration|seed|token obrigatorio/);
  });
});
