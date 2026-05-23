import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildWeeklyCollectionPacket,
  buildWeeklyCsvTemplate,
  buildWeeklyFieldValueTemplate,
  buildWeeklySourceHandoff
} from "@/lib/weeklyCollectionPacket";

describe("Weekly Collection Packet", () => {
  it("gera artefatos copiaveis para coleta manual semanal", () => {
    const packet = buildWeeklyCollectionPacket();

    expect(packet.title).toBe("Pacote Copiavel de Coleta Semanal");
    expect(packet.artifacts.map((artifact) => artifact.type)).toEqual(
      expect.arrayContaining(["checklist", "csv", "field_value", "handoff"])
    );
    expect(packet.weeklyCloseChecklist.length).toBeGreaterThan(5);
    expect(packet.nextRoutes.map((route) => route.href)).toEqual(
      expect.arrayContaining(["/data", "/weekly", "/weekly/execution", "/weekly/execution/packet"])
    );
  });

  it("gera modelo CSV/TSV com campos ativos do input semanal", () => {
    const csv = buildWeeklyCsvTemplate();

    expect(csv.split("\n")[0]).toBe("campo;valor;fonte;observacao");
    expect(csv).toContain("Investimento Meta Ads");
    expect(csv).toContain("Conversas Meta");
    expect(csv).toContain("Stories publicados");
    expect(csv).toContain("Consultas marcadas");
    expect(csv).toContain("Observacoes agregadas");
  });

  it("gera template campo valor seguro para importacao assistida", () => {
    const template = buildWeeklyFieldValueTemplate();
    const normalized = template.toLocaleLowerCase("pt-BR");

    expect(template).toContain("Periodo:");
    expect(template).toContain("Rotulo da semana:");
    expect(template).toContain("## Instagram organico");
    expect(normalized).toContain("metricas agregadas");
    expect(normalized).toContain("sem dados pessoais");
    expect(normalized).not.toMatch(/dm individual|nome do paciente|telefone do paciente|print privado/);
  });

  it("define gates de prontidao com privacidade, periodo e bloqueio de envio externo", () => {
    const gates = buildWeeklyCollectionPacket().readinessGates;

    expect(gates.map((gate) => gate.id)).toEqual(
      expect.arrayContaining(["same-period", "privacy", "manual-review", "december-2025", "no-auto-send"])
    );
    expect(gates.find((gate) => gate.id === "no-auto-send")?.status).toBe("blocked");
  });

  it("gera handoff por fonte sem acionar envio automatico", () => {
    const handoff = buildWeeklySourceHandoff();
    const text = JSON.stringify(handoff).toLocaleLowerCase("pt-BR");

    expect(handoff.map((source) => source.sourceId)).toEqual(
      expect.arrayContaining(["instagram-organic", "meta-ads", "google-ads", "commercial-funnel"])
    );
    expect(text).toContain("investimento meta ads");
    expect(text).not.toMatch(/enviar automaticamente|publicar automaticamente|api obrigatoria/);
  });

  it("mantem linguagem interna, agregada e sem promessa", () => {
    const text = JSON.stringify(buildWeeklyCollectionPacket()).toLocaleLowerCase("pt-BR");

    expect(text).toContain("metricas agregadas");
    expect(text).toContain("revisao humana");
    expect(text).toContain("dezembro/2025");
    expect(text).not.toMatch(/oauth obrigatorio|api obrigatoria|resultado garantido|garante resultado/);
  });

  it("integra a rota do pacote copiavel nos fluxos existentes", () => {
    const packetPage = readFileSync(path.join(process.cwd(), "app", "data", "collection-packet", "page.tsx"), "utf8");
    const guidePage = readFileSync(path.join(process.cwd(), "app", "data", "collection-guide", "page.tsx"), "utf8");
    const dataPage = readFileSync(path.join(process.cwd(), "app", "data", "page.tsx"), "utf8");
    const commandResult = readFileSync(path.join(process.cwd(), "lib", "weeklyCommandResult.ts"), "utf8");
    const manualPacket = readFileSync(path.join(process.cwd(), "lib", "weeklyManualExecutionPacket.ts"), "utf8");

    expect(packetPage).toContain("buildWeeklyCollectionPacket");
    expect(packetPage).toContain("Copiar, preencher e revisar");
    expect(packetPage).toContain("Handoff por origem");
    expect(guidePage).toContain("/data/collection-packet");
    expect(dataPage).toContain("/data/collection-packet");
    expect(commandResult).toContain("/data/collection-packet");
    expect(manualPacket).toContain("/data/collection-packet");
  });
});
