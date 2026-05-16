import { describe, expect, it } from "vitest";
import { buildWeeklyCommandCenter } from "@/lib/weeklyCommandCenter";
import { buildWeeklyCommandResult } from "@/lib/weeklyCommandResult";
import { buildWeeklyExecutionBoard } from "@/lib/weeklyExecutionBoard";
import { buildWeeklyManualExecutionPacket } from "@/lib/weeklyManualExecutionPacket";
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

function buildPacket(current: WeeklyMarketingData, previous: WeeklyMarketingData | null = null) {
  const report = buildWeeklyCommandResult(current, previous, buildWeeklyCommandCenter(current));
  const board = buildWeeklyExecutionBoard(report);
  return buildWeeklyManualExecutionPacket(report, board);
}

describe("Weekly Manual Execution Packet", () => {
  it("gera pacote manual com brief executivo, gates e roteiro", () => {
    const packet = buildPacket(makeWeek({ googleConversions: 0, instagramStories: 20 }), makeWeek({ id: "previous-week" }));

    expect(packet.weekLabel).toBe("Semana atual");
    expect(packet.executiveBrief).toContain("Semana atual");
    expect(packet.approvalGates.map((gate) => gate.id)).toEqual(
      expect.arrayContaining(["privacy", "medical-governance", "automatic-publishing", "budget"])
    );
    expect(packet.reviewScript.map((item) => item.order)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("mantem publicacao/envio automatico como bloqueio explicito", () => {
    const packet = buildPacket(makeWeek());
    const gate = packet.approvalGates.find((item) => item.id === "automatic-publishing");

    expect(gate).toEqual(
      expect.objectContaining({
        status: "blocked"
      })
    );
    expect(gate?.defaultDecision).toContain("Nao autoriza");
    expect(packet.doNotDo.join(" ")).toContain("Nao publicar conteudo automaticamente");
  });

  it("prioriza coleta do funil quando ha bloqueio de dados comerciais", () => {
    const packet = buildPacket(makeWeek({
      consultationsScheduled: null,
      consultationsAttended: null,
      surgeriesClosed: null
    }), makeWeek({ id: "previous-week" }));
    const funnelCollection = packet.dataCollectionPlan.find((item) => item.id === "commercial-funnel");

    expect(packet.approvalGates.map((gate) => gate.id)).toContain("tracking");
    expect(funnelCollection).toEqual(
      expect.objectContaining({
        priority: "high"
      })
    );
    expect(funnelCollection?.privacyRule).toContain("sem nomes");
  });

  it("agrupa tarefas por responsavel sugerido sem acionar equipe automaticamente", () => {
    const packet = buildPacket(makeWeek({ googleConversions: 0, instagramStories: 18 }), makeWeek({ id: "previous-week" }));

    expect(packet.ownerBriefs.length).toBeGreaterThan(0);
    expect(packet.ownerBriefs.flatMap((brief) => brief.risksToWatch).join(" ")).toContain("Nao acionar equipe automaticamente");
    expect(packet.ownerBriefs.some((brief) => brief.tasks.length > 0)).toBe(true);
  });

  it("cria links para continuar a revisao sem depender de API externa", () => {
    const packet = buildPacket(makeWeek());
    const hrefs = packet.nextOpenLinks.map((link) => link.href);

    expect(hrefs).toEqual(
      expect.arrayContaining(["/data", "/stories/today", "/stories/next-week", "/audit"])
    );
    expect(hrefs.some((href) => href.includes("/weekly/execution/packet"))).toBe(false);
  });

  it("preserva linguagem interna, deterministica e sem promessa", () => {
    const packet = buildPacket(makeWeek({ googleConversions: 0, instagramStories: 20 }), makeWeek({ id: "previous-week" }));
    const text = JSON.stringify(packet).toLocaleLowerCase("pt-BR");

    expect(text).toContain("metricas agregadas");
    expect(text).toContain("revisao humana");
    expect(text).toContain("team audit mode");
    expect(text).not.toMatch(/resultado garantido|garante|postagem automatica|envio automatico para equipe/);
  });
});
