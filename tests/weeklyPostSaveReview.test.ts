import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildWeeklyCommandCenter } from "@/lib/weeklyCommandCenter";
import { buildWeeklyCommandResult } from "@/lib/weeklyCommandResult";
import { buildWeeklyPostSaveReview } from "@/lib/weeklyPostSaveReview";
import { buildWeeklyStrategicDecisionReport } from "@/lib/weeklyStrategicDecision";
import { createWeeklyMarketingDataFromEditableFields, type WeeklyMarketingData } from "@/lib/weeklyDataInput";

function makeWeek(overrides: Partial<WeeklyMarketingData> = {}): WeeklyMarketingData {
  return createWeeklyMarketingDataFromEditableFields({
    id: "week-current",
    weekLabel: "Semana atual",
    startDate: "2026-05-11",
    endDate: "2026-05-17",
    metaSpend: 600,
    metaWhatsappConversations: 90,
    metaProfileVisits: 4000,
    googleSpend: 250,
    googleClicks: 80,
    googleConversions: 4,
    instagramStories: 42,
    instagramReels: 3,
    instagramPosts: 2,
    instagramProfileVisits: 900,
    whatsappTotal: 100,
    qualifiedConversations: 35,
    consultationsScheduled: 8,
    consultationsAttended: 6,
    surgeriesClosed: 2,
    notes: "Semana agregada sem dados pessoais.",
    ...overrides
  });
}

function buildReview(current: WeeklyMarketingData, previous: WeeklyMarketingData | null = makeWeek({ id: "week-previous", startDate: "2026-05-04", endDate: "2026-05-10" })) {
  const center = buildWeeklyCommandCenter(current);
  const strategic = buildWeeklyStrategicDecisionReport(current, previous);
  const commandResult = buildWeeklyCommandResult(current, previous, center, strategic, previous ? [previous] : []);
  return buildWeeklyPostSaveReview(current, previous, commandResult);
}

describe("Weekly Post Save Review", () => {
  it("gera revisao compacta pronta quando a semana salva esta completa", () => {
    const review = buildReview(makeWeek());

    expect(review.title).toBe("Revisao compacta pos-salvamento");
    expect(review.status).toBe("ready_for_review");
    expect(review.confidence).toBe("alta");
    expect(review.weekId).toBe("week-current");
    expect(review.savedSnapshot.map((item) => item.label)).toEqual(expect.arrayContaining(["Semana", "Status", "Meta WhatsApp", "Funil comercial"]));
    expect(review.firstAction.targetHref).toBe("/weekly/execution");
    expect(review.nextOpenLinks.map((link) => link.href)).toContain("/weekly/post-save-review?week=week-current");
  });

  it("marca leitura limitada quando falta funil comercial ou historico anterior", () => {
    const review = buildReview(
      makeWeek({
        consultationsScheduled: null,
        consultationsAttended: null,
        surgeriesClosed: null
      }),
      null
    );

    expect(review.status).not.toBe("ready_for_review");
    expect(review.confidence).not.toBe("alta");
    expect(review.firstAction.targetHref).toBe("/data");
    expect(review.reviewItems.find((item) => item.id === "commercial-funnel")?.status).toBe("limited");
    expect(review.copyMarkdown).toContain("Funil comercial");
  });

  it("mantem dezembro de 2025 como anomalia fora de benchmark normal", () => {
    const review = buildReview(
      makeWeek({
        startDate: "2025-12-08",
        endDate: "2025-12-14",
        weekLabel: "Semana Dezembro 2025"
      }),
      null
    );
    const text = JSON.stringify(review).toLocaleLowerCase("pt-BR");

    expect(review.status).toBe("needs_data_review");
    expect(review.confidence).toBe("baixa");
    expect(review.firstAction.title).toContain("anomalia");
    expect(text).toContain("dezembro/2025");
    expect(text).toContain("fora de benchmark normal");
  });

  it("destaca Google/tracking quando existe investimento sem conversao", () => {
    const review = buildReview(makeWeek({ googleSpend: 300, googleConversions: 0 }));
    const googleItem = review.reviewItems.find((item) => item.id === "google-tracking");

    expect(googleItem?.status).toBe("review");
    expect(googleItem?.targetHref).toBe("/signals");
    expect(review.nextOpenLinks.map((link) => link.href)).toContain("/signals");
  });

  it("mantem guardrails internos e sem automacao externa", () => {
    const review = buildReview(makeWeek({ googleConversions: 0 }));
    const text = JSON.stringify(review).toLocaleLowerCase("pt-BR");

    expect(text).toContain("metricas agregadas");
    expect(text).toContain("revisao humana");
    expect(text).toContain("nao publica");
    expect(text).not.toMatch(/resultado garantido|envio automatico para a equipe|postagem automatica|garante/);
  });

  it("integra a revisao pos-salvamento em /weekly, docs e README", () => {
    const page = readFileSync(path.join(process.cwd(), "app", "weekly", "page.tsx"), "utf8");
    const panel = readFileSync(path.join(process.cwd(), "app", "weekly", "WeeklyPostSaveReviewPanel.tsx"), "utf8");
    const copyButton = readFileSync(path.join(process.cwd(), "app", "weekly", "WeeklyPostSaveReviewCopyButton.tsx"), "utf8");
    const packetPage = readFileSync(path.join(process.cwd(), "app", "weekly", "post-save-review", "page.tsx"), "utf8");
    const layer = readFileSync(path.join(process.cwd(), "lib", "weeklyPostSaveReview.ts"), "utf8");
    const docs = readFileSync(path.join(process.cwd(), "docs", "WEEKLY_POST_SAVE_REVIEW_V3_8.md"), "utf8");
    const packetDocs = readFileSync(path.join(process.cwd(), "docs", "WEEKLY_POST_SAVE_REVIEW_PACKET_V3_9.md"), "utf8");
    const readme = readFileSync(path.join(process.cwd(), "README.md"), "utf8");

    expect(page).toContain("buildWeeklyPostSaveReview");
    expect(page).toContain("WeeklyPostSaveReviewPanel");
    expect(panel).toContain("Pos-salvamento v3.8");
    expect(panel).toContain("Checklist compacto");
    expect(panel).toContain("WeeklyPostSaveReviewCopyButton");
    expect(panel).toContain("Abrir pacote completo");
    expect(copyButton).toContain("navigator.clipboard");
    expect(copyButton).toContain("Copiar pacote");
    expect(packetPage).toContain("Pacote pos-salvamento");
    expect(packetPage).toContain("Copiar revisao");
    expect(packetPage).toContain("getPreviousValidWeeklyMarketingData");
    expect(layer).toContain("buildWeeklyPostSaveReview");
    expect(`${docs}\n${readme}`.toLocaleLowerCase("pt-BR")).toContain("v3.8");
    expect(`${docs}\n${readme}`.toLocaleLowerCase("pt-BR")).toContain("revisao compacta pos-salvamento");
    expect(`${packetDocs}\n${readme}`.toLocaleLowerCase("pt-BR")).toContain("v3.9");
    expect(`${packetDocs}\n${readme}`.toLocaleLowerCase("pt-BR")).toContain("pacote pos-salvamento");
  });
});
