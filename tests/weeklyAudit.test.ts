import { describe, expect, it } from "vitest";
import {
  WEEKLY_AUDIT_DECISIONS,
  WEEKLY_AUDIT_SUMMARY,
  countByChannel,
  countByClassification,
  filterWeeklyAuditDecisions,
  generateWeeklyAuditExecutiveSummary,
  getHighImpactOpportunities,
  getHighImpactRisks
} from "@/lib/weeklyAudit";

describe("Weekly Audit", () => {
  it("possui pelo menos dez decisoes e achados mockados", () => {
    expect(WEEKLY_AUDIT_DECISIONS.length).toBeGreaterThanOrEqual(10);
  });

  it("inclui decisoes para todos os canais principais", () => {
    const channels = new Set(WEEKLY_AUDIT_DECISIONS.map((decision) => decision.channel));

    expect(channels).toEqual(new Set(["meta", "google", "instagram", "content", "funnel", "budget"]));
  });

  it("inclui todas as classificacoes de auditoria", () => {
    const classifications = new Set(WEEKLY_AUDIT_DECISIONS.map((decision) => decision.classification));

    expect(classifications).toEqual(
      new Set(["clear_win", "partial_win", "operational_error", "silent_risk", "missed_opportunity", "needs_more_data"])
    );
  });

  it("filtra por canal, classificacao, impacto e status", () => {
    expect(filterWeeklyAuditDecisions(WEEKLY_AUDIT_DECISIONS, { channel: "google" }).map((decision) => decision.id)).toEqual([
      "google-nao-escalar-sem-conversao",
      "google-intencao-melhorou",
      "cirurgia-estetica-generico"
    ]);

    expect(filterWeeklyAuditDecisions(WEEKLY_AUDIT_DECISIONS, { classification: "clear_win" })).toHaveLength(3);
    expect(filterWeeklyAuditDecisions(WEEKLY_AUDIT_DECISIONS, { impact: "high" })).toHaveLength(5);
    expect(filterWeeklyAuditDecisions(WEEKLY_AUDIT_DECISIONS, { status: "open" })).toHaveLength(6);
  });

  it("calcula contagem por classificacao", () => {
    expect(countByClassification(WEEKLY_AUDIT_DECISIONS)).toEqual({
      clear_win: 3,
      partial_win: 2,
      operational_error: 1,
      silent_risk: 2,
      missed_opportunity: 2,
      needs_more_data: 1
    });
  });

  it("calcula contagem por canal", () => {
    expect(countByChannel(WEEKLY_AUDIT_DECISIONS)).toEqual({
      meta: 2,
      google: 3,
      instagram: 1,
      content: 2,
      funnel: 2,
      budget: 1
    });
  });

  it("identifica riscos e oportunidades de alto impacto", () => {
    expect(getHighImpactRisks(WEEKLY_AUDIT_DECISIONS).map((decision) => decision.id)).toEqual([
      "google-nao-escalar-sem-conversao",
      "organico-sustentar-visitas"
    ]);

    expect(getHighImpactOpportunities(WEEKLY_AUDIT_DECISIONS).map((decision) => decision.id)).toEqual([
      "meta-canal-principal-escala",
      "bofu-whatsapp-escala-confiavel",
      "stories-parte-do-funil"
    ]);
  });

  it("gera resumo executivo simples da semana", () => {
    expect(WEEKLY_AUDIT_SUMMARY.executiveDiagnosis).toContain("Meta Ads");
    expect(generateWeeklyAuditExecutiveSummary()).toContain("Google permanece diagnostico");
    expect(generateWeeklyAuditExecutiveSummary()).toContain("risco(s) de alto impacto");
  });
});
