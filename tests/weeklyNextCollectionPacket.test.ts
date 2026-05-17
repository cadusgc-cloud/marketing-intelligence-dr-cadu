import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildWeeklyNextCollectionOwnerBriefs,
  buildWeeklyNextCollectionPacket,
  buildWeeklyNextCollectionPacketText
} from "@/lib/weeklyNextCollectionPacket";
import { buildWeeklyNextCollectionPlan } from "@/lib/weeklyNextCollectionPlan";
import { createWeeklyMarketingDataFromEditableFields, type WeeklyMarketingData } from "@/lib/weeklyDataInput";

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
    googleConversions: 0,
    instagramStories: 12,
    instagramReels: 1,
    instagramPosts: 2,
    instagramProfileVisits: 1290,
    whatsappTotal: 126,
    qualifiedConversations: 42,
    consultationsScheduled: null,
    consultationsAttended: null,
    surgeriesClosed: null,
    notes: "Semana agregada com tracking em revisao e sem dados pessoais.",
    ...overrides
  });
}

describe("Weekly Next Collection Packet", () => {
  it("gera pacote copiavel com artefatos operacionais", () => {
    const packet = buildWeeklyNextCollectionPacket(buildWeeklyNextCollectionPlan(makeWeek()));

    expect(packet.title).toBe("Pacote copiavel do plano de coleta");
    expect(packet.artifacts.map((artifact) => artifact.type)).toEqual(
      expect.arrayContaining(["full_plan", "daily_routine", "weekly_close", "handoff", "owner_brief"])
    );
    expect(packet.fullPacketText).toContain("Tarefas priorizadas");
    expect(packet.fullPacketText).toContain("Roteiro diario");
    expect(packet.fullPacketText).toContain("Fechamento semanal");
  });

  it("agrupa tarefas por responsavel sugerido", () => {
    const plan = buildWeeklyNextCollectionPlan(makeWeek());
    const briefs = buildWeeklyNextCollectionOwnerBriefs(plan);

    expect(briefs.map((brief) => brief.owner)).toEqual(expect.arrayContaining(["marketing", "atendimento"]));
    expect(briefs.every((brief) => brief.taskCount > 0)).toBe(true);
    expect(briefs.map((brief) => brief.content).join(" ")).toContain("sem dados pessoais");
  });

  it("inclui handoff interno sem envio automatico ou API", () => {
    const packet = buildWeeklyNextCollectionPacket(buildWeeklyNextCollectionPlan(makeWeek()));
    const text = JSON.stringify(packet).toLocaleLowerCase("pt-BR");

    expect(text).toContain("handoff interno");
    expect(text).toContain("nao envia");
    expect(text).toContain("nao conectar api");
    expect(text).not.toMatch(/api obrigatoria|oauth obrigatorio|scraping liberado|envio automatico liberado/);
  });

  it("mantem dezembro de 2025 fora de benchmark normal", () => {
    const packetText = buildWeeklyNextCollectionPacketText(
      buildWeeklyNextCollectionPlan(
        makeWeek({
          weekLabel: "Semana Dezembro 2025",
          startDate: "2025-12-08",
          endDate: "2025-12-14"
        })
      )
    );

    expect(packetText).toContain("Dezembro/2025");
    expect(packetText).toContain("fora de benchmark normal");
    expect(packetText).toContain("nao usar Dezembro/2025 como benchmark normal");
  });

  it("preserva privacidade e metricas agregadas no texto completo", () => {
    const packetText = buildWeeklyNextCollectionPacketText(buildWeeklyNextCollectionPlan(makeWeek()));
    const normalized = packetText.toLocaleLowerCase("pt-BR");

    expect(normalized).toContain("somente totais agregados");
    expect(normalized).toContain("nenhum dado pessoal");
    expect(normalized).toContain("revisao humana");
    expect(normalized).not.toMatch(/nome do paciente|telefone do paciente|dm privada|print privado obrigatorio/);
  });

  it("integra botao de copia e rota dedicada ao fluxo de /data", () => {
    const panel = readFileSync(path.join(process.cwd(), "app", "data", "WeeklyNextCollectionPlanPanel.tsx"), "utf8");
    const dataClient = readFileSync(path.join(process.cwd(), "app", "data", "WeeklyDataInputClient.tsx"), "utf8");
    const route = readFileSync(path.join(process.cwd(), "app", "data", "next-collection-plan", "page.tsx"), "utf8");
    const plan = readFileSync(path.join(process.cwd(), "lib", "weeklyNextCollectionPlan.ts"), "utf8");

    expect(panel).toContain("Copiar pacote completo");
    expect(panel).toContain("buildWeeklyNextCollectionPacket");
    expect(dataClient).toContain("WeeklyNextCollectionPlanPanel");
    expect(route).toContain("buildWeeklyNextCollectionPacket");
    expect(route).toContain("Plano completo copiavel");
    expect(plan).toContain("/data/next-collection-plan");
  });

  it("documenta a v2.9 no README e no documento dedicado", () => {
    const readme = readFileSync(path.join(process.cwd(), "README.md"), "utf8");
    const docs = readFileSync(path.join(process.cwd(), "docs", "WEEKLY_NEXT_COLLECTION_PACKET_V2_9.md"), "utf8");

    expect(readme).toContain("v2.9 - Pacote copiavel do plano de coleta");
    expect(docs).toContain("Weekly Next Collection Packet v2.9");
    expect(docs).toContain("nao enviar automaticamente");
    expect(docs).toContain("dados reais");
  });
});
