import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildWeeklySourceEvidenceLedger } from "@/lib/weeklySourceEvidenceLedger";
import { createEmptyWeeklyMarketingData, createWeeklyMarketingDataFromEditableFields, type WeeklyMarketingData } from "@/lib/weeklyDataInput";

function makeWeek(overrides: Partial<WeeklyMarketingData> = {}): WeeklyMarketingData {
  return createWeeklyMarketingDataFromEditableFields({
    id: "week-current",
    weekLabel: "Semana atual",
    startDate: "2026-05-11",
    endDate: "2026-05-17",
    metaSpend: 780,
    metaWhatsappConversations: 118,
    metaProfileVisits: 6100,
    googleSpend: 220,
    googleClicks: 48,
    googleConversions: 4,
    instagramStories: 42,
    instagramReels: 3,
    instagramPosts: 2,
    instagramProfileVisits: 1290,
    whatsappTotal: 126,
    qualifiedConversations: 42,
    consultationsScheduled: 12,
    consultationsAttended: 9,
    surgeriesClosed: 2,
    notes: "Semana agregada completa e sem dados pessoais.",
    ...overrides
  });
}

describe("Weekly Source Evidence Ledger", () => {
  it("gera mapa verificado para semana completa", () => {
    const ledger = buildWeeklySourceEvidenceLedger(makeWeek());

    expect(ledger.title).toBe("Mapa de origem dos dados");
    expect(ledger.status).toBe("verified");
    expect(ledger.totals.verified).toBe(6);
    expect(ledger.sources.map((source) => source.id)).toEqual([
      "week-identity",
      "instagram-organic",
      "meta-ads",
      "google-ads",
      "commercial-funnel",
      "execution-context"
    ]);
    expect(ledger.copyMarkdown).toContain("# Mapa de origem dos dados");
    expect(ledger.copyMarkdown).toContain("Instagram organico");
    expect(ledger.copyMarkdown).toContain("Meta Ads");
  });

  it("bloqueia rascunho sem identidade da semana", () => {
    const ledger = buildWeeklySourceEvidenceLedger(createEmptyWeeklyMarketingData());

    expect(ledger.status).toBe("blocked");
    expect(ledger.totals.blocked).toBeGreaterThan(0);
    expect(ledger.copyMarkdown).toContain("Identidade da semana");
    expect(ledger.copyMarkdown).toContain("Campo ausente");
  });

  it("marca revisao quando funil e canais ainda tem lacunas", () => {
    const ledger = buildWeeklySourceEvidenceLedger(
      makeWeek({
        instagramStories: 10,
        instagramReels: 1,
        googleConversions: 0,
        consultationsScheduled: null,
        consultationsAttended: null,
        surgeriesClosed: null
      })
    );

    expect(ledger.status).toBe("needs_review");
    expect(ledger.totals.needsReview).toBeGreaterThanOrEqual(3);
    expect(ledger.copyMarkdown).toContain("WhatsApp e funil comercial");
    expect(ledger.copyMarkdown).toContain("Google Ads");
  });

  it("mantem Dezembro de 2025 como anomalia operacional", () => {
    const ledger = buildWeeklySourceEvidenceLedger(
      makeWeek({
        weekLabel: "Semana Dezembro 2025",
        startDate: "2025-12-08",
        endDate: "2025-12-14"
      })
    );
    const text = ledger.copyMarkdown.toLocaleLowerCase("pt-BR");

    expect(ledger.status).toBe("needs_review");
    expect(text).toContain("dezembro/2025");
    expect(text).toContain("fora de benchmark normal");
  });

  it("bloqueia quando observacoes indicam dado identificavel", () => {
    const ledger = buildWeeklySourceEvidenceLedger(makeWeek({ notes: "CPF 000 e telefone individual apareceram no rascunho." }));

    expect(ledger.status).toBe("blocked");
    expect(ledger.sources.find((source) => source.id === "execution-context")?.status).toBe("blocked");
    expect(ledger.copyMarkdown).toContain("Remover");
  });

  it("preserva guardrails: agregado, manual, sem API e sem dado pessoal", () => {
    const ledger = buildWeeklySourceEvidenceLedger(makeWeek());
    const text = ledger.copyMarkdown.toLocaleLowerCase("pt-BR");

    expect(text).toContain("metricas agregadas");
    expect(text).toContain("api externa");
    expect(text).toContain("nao altera banco");
    expect(text).toContain("dados clinicos");
    expect(text).not.toMatch(/api obrigatoria|oauth obrigatorio|scraping liberado|publicacao automatica liberada/);
  });

  it("integra mapa em /data, rota dedicada, guia, docs e README", () => {
    const dataClient = readFileSync(path.join(process.cwd(), "app", "data", "WeeklyDataInputClient.tsx"), "utf8");
    const panel = readFileSync(path.join(process.cwd(), "app", "data", "WeeklySourceEvidenceLedgerPanel.tsx"), "utf8");
    const dataPage = readFileSync(path.join(process.cwd(), "app", "data", "page.tsx"), "utf8");
    const guide = readFileSync(path.join(process.cwd(), "lib", "weeklyDataCollectionGuide.ts"), "utf8");
    const readiness = readFileSync(path.join(process.cwd(), "lib", "weeklyCollectionReadiness.ts"), "utf8");
    const docs = readFileSync(path.join(process.cwd(), "docs", "WEEKLY_SOURCE_EVIDENCE_LEDGER_V3_5.md"), "utf8");
    const readme = readFileSync(path.join(process.cwd(), "README.md"), "utf8");
    const routePath = path.join(process.cwd(), "app", "data", "source-evidence", "page.tsx");

    expect(dataClient).toContain("buildWeeklySourceEvidenceLedger");
    expect(dataClient).toContain("WeeklySourceEvidenceLedgerPanel");
    expect(panel).toContain("weekly-source-evidence-ledger");
    expect(panel).toContain("Copiar mapa");
    expect(dataPage).toContain("/data/source-evidence");
    expect(guide).toContain("/data/source-evidence");
    expect(readiness).toContain("/data/source-evidence");
    expect(existsSync(routePath)).toBe(true);
    expect(`${docs}\n${readme}`.toLocaleLowerCase("pt-BR")).toContain("v3.5");
    expect(`${docs}\n${readme}`.toLocaleLowerCase("pt-BR")).toContain("mapa de origem dos dados");
  });
});
