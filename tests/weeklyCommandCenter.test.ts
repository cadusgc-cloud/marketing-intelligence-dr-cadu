import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  WEEKLY_COMMAND_CENTER_LINKS,
  buildWeeklyCommandCenter,
  determineOperationalStatus,
  generate24hActionPlan,
  generate72hActionPlan,
  generateWeeklyExecutiveSummary,
  getMissingDataWarnings,
  recommendWeeklyContent,
  selectMainDecision,
  selectMainRisk,
  summarizeChannelStatus
} from "@/lib/weeklyCommandCenter";
import { evaluateDecisionSignals, getTriggeredSignals } from "@/lib/decisionSignals";
import { convertWeeklyDataToDecisionInputs, createWeeklyMarketingDataFromEditableFields, WEEKLY_MARKETING_DATA_MOCK } from "@/lib/weeklyDataInput";

describe("Weekly Command Center", () => {
  it("monta uma central semanal válida", () => {
    const center = buildWeeklyCommandCenter();

    expect(center.id).toContain("weekly-command");
    expect(center.weekLabel).toBe(WEEKLY_MARKETING_DATA_MOCK.weekLabel);
    expect(center.executiveSummary).toContain("Meta Ads");
    expect(center.triggeredSignals.length).toBeGreaterThan(0);
    expect(center.auditFindings.length).toBeGreaterThan(0);
  });

  it("calcula status operacional", () => {
    const center = buildWeeklyCommandCenter();

    expect(center.operationalStatus).toBe("incomplete_data");
    expect(determineOperationalStatus([], [])).toBe("healthy");
  });

  it("impede recomendação de escala para Google quando conversões estão zeradas", () => {
    const center = buildWeeklyCommandCenter();
    const googleActions = [...center.actionPlan24h, ...center.actionPlan72h].filter((action) => action.channel === "google");

    expect(googleActions.some((action) => action.description.includes("diagnóstico"))).toBe(true);
    expect(googleActions.some((action) => action.decisionType === "scale")).toBe(false);
  });

  it("mantém Meta Ads como prioridade operacional quando performa melhor", () => {
    const center = buildWeeklyCommandCenter();

    expect(center.mainDecision).toContain("Meta Ads");
    expect(center.metaSummary).toContain("canal principal de escala");
    expect(center.actionPlan24h.some((action) => action.channel === "meta" && action.decisionType === "scale")).toBe(true);
  });

  it("gera planos de 24h e 72h com ações", () => {
    const center = buildWeeklyCommandCenter();

    expect(center.actionPlan24h.length).toBeGreaterThan(0);
    expect(center.actionPlan72h.length).toBeGreaterThan(0);
    expect(generate24hActionPlan(WEEKLY_MARKETING_DATA_MOCK, center.triggeredSignals).length).toBeGreaterThan(0);
    expect(generate72hActionPlan(WEEKLY_MARKETING_DATA_MOCK, center.triggeredSignals).length).toBeGreaterThan(0);
  });

  it("recomenda conteúdos semanais reaproveitáveis", () => {
    const center = buildWeeklyCommandCenter();

    expect(center.recommendedContent.length).toBeGreaterThan(0);
    expect(center.recommendedContent.some((content) => content.suggestedFormat.includes("Stories"))).toBe(true);
    expect(recommendWeeklyContent(center.triggeredSignals).length).toBeGreaterThan(0);
  });

  it("identifica dados faltantes do funil", () => {
    const missingData = getMissingDataWarnings(WEEKLY_MARKETING_DATA_MOCK);

    expect(missingData.some((item) => item.includes("consultationsScheduled"))).toBe(true);
    expect(missingData.some((item) => item.toLocaleLowerCase("pt-BR").includes("funil"))).toBe(true);
  });

  it("monta central para semana salva completa sem status de dados incompletos", () => {
    const completeWeek = createWeeklyMarketingDataFromEditableFields({
      ...WEEKLY_MARKETING_DATA_MOCK,
      id: "saved-week",
      weekLabel: "Semana salva completa",
      googleConversions: 4,
      consultationsScheduled: 12,
      consultationsAttended: 9,
      surgeriesClosed: 2
    });
    const center = buildWeeklyCommandCenter(completeWeek);

    expect(center.weekLabel).toBe("Semana salva completa");
    expect(center.operationalStatus).not.toBe("incomplete_data");
    expect(center.missingData).toEqual([]);
    expect(center.funnelSummary).toContain("dados suficientes");
  });

  it("representa os links para os módulos de origem", () => {
    const hrefs = WEEKLY_COMMAND_CENTER_LINKS.map((link) => link.href);
    const labels = WEEKLY_COMMAND_CENTER_LINKS.map((link) => link.label);

    expect(hrefs).toEqual(expect.arrayContaining(["/data", "/signals", "/audit", "/calendar", "/content"]));
    expect(labels).toEqual(
      expect.arrayContaining([
        "Ver dados semanais",
        "Ver sinais de decisão",
        "Ver auditoria semanal",
        "Ver calendário editorial",
        "Ver ideias de conteúdo"
      ])
    );
  });

  it("inclui investigação, escala/manutenção para Meta e diagnóstico para Google", () => {
    const center = buildWeeklyCommandCenter();
    const allActions = [...center.actionPlan24h, ...center.actionPlan72h];

    expect(allActions.some((action) => action.decisionType === "investigate")).toBe(true);
    expect(allActions.some((action) => action.channel === "meta" && (action.decisionType === "scale" || action.decisionType === "maintain"))).toBe(true);
    expect(allActions.some((action) => action.channel === "google" && (action.decisionType === "pause" || action.decisionType === "investigate"))).toBe(true);
  });

  it("gera resumo executivo textual e resumos por canal", () => {
    const inputs = convertWeeklyDataToDecisionInputs(WEEKLY_MARKETING_DATA_MOCK);
    const triggered = getTriggeredSignals(evaluateDecisionSignals(inputs));
    const summary = generateWeeklyExecutiveSummary(WEEKLY_MARKETING_DATA_MOCK, triggered, ["Campo ausente: consultationsScheduled"]);

    expect(summary).toContain("Meta Ads");
    expect(summary).toContain("Google Ads");
    expect(summarizeChannelStatus("google", WEEKLY_MARKETING_DATA_MOCK, triggered)).toContain("diagnóstico");
  });

  it("seleciona decisão e risco principal com base nos sinais estruturados", () => {
    const center = buildWeeklyCommandCenter();

    expect(selectMainDecision(WEEKLY_MARKETING_DATA_MOCK, center.triggeredSignals)).toContain("Meta Ads");
    expect(selectMainRisk(center)).toContain("Google Ads");
  });

  it("integra o painel de leitura estrategica na pagina semanal", () => {
    const page = readFileSync(path.join(process.cwd(), "app", "weekly", "page.tsx"), "utf8");
    const resultScreen = readFileSync(path.join(process.cwd(), "app", "weekly", "WeeklyCommandResultScreen.tsx"), "utf8");
    const panel = readFileSync(path.join(process.cwd(), "app", "weekly", "WeeklyStrategicDecisionPanel.tsx"), "utf8");
    const decisionLayer = readFileSync(path.join(process.cwd(), "lib", "weeklyStrategicDecision.ts"), "utf8");

    expect(page).toContain("getPreviousValidWeeklyMarketingData");
    expect(page).toContain("buildWeeklyStrategicDecisionReport");
    expect(page).toContain("buildWeeklyCommandResult");
    expect(page).toContain("buildWeeklyExecutionBoard");
    expect(page).toContain("WeeklyCommandResultScreen");
    expect(page).toContain("WeeklyExecutionBoardPanel");
    expect(page).toContain("WeeklyStrategicDecisionPanel");
    expect(resultScreen).toContain("Prioridades da proxima semana");
    expect(resultScreen).toContain("priorityLevers");
    expect(panel).toContain("Leitura Estrat");
    expect(panel).toContain("Principais sinais");
    expect(panel).toContain("Recomenda");
    expect(panel).toContain("report.caution");
    expect(decisionLayer).toContain("revisada por uma pessoa");
  });

  it("integra o board de execucao semanal como rota e painel interno", () => {
    const page = readFileSync(path.join(process.cwd(), "app", "weekly", "page.tsx"), "utf8");
    const executionPage = readFileSync(path.join(process.cwd(), "app", "weekly", "execution", "page.tsx"), "utf8");
    const executionPanel = readFileSync(path.join(process.cwd(), "app", "weekly", "WeeklyExecutionBoardPanel.tsx"), "utf8");
    const executionLayer = readFileSync(path.join(process.cwd(), "lib", "weeklyExecutionBoard.ts"), "utf8");

    expect(page).toContain("WeeklyExecutionBoardPanel");
    expect(page).toContain("buildWeeklyExecutionBoard");
    expect(executionPage).toContain("getPreviousValidWeeklyMarketingData");
    expect(executionPage).toContain("buildWeeklyCommandResult");
    expect(executionPage).toContain("WeeklyExecutionBoardPanel");
    expect(executionPanel).toContain("Board de Execucao Semanal");
    expect(executionPanel).toContain("Agenda sugerida");
    expect(executionPanel).toContain("Diario de decisoes");
    expect(executionLayer).toContain("Team Audit Mode permanece interno");
    expect(executionLayer).toContain("nao publica");
  });

  it("integra o pacote manual de execucao semanal como rota interna", () => {
    const executionPage = readFileSync(path.join(process.cwd(), "app", "weekly", "execution", "page.tsx"), "utf8");
    const packetPage = readFileSync(path.join(process.cwd(), "app", "weekly", "execution", "packet", "page.tsx"), "utf8");
    const packetPanel = readFileSync(path.join(process.cwd(), "app", "weekly", "execution", "WeeklyManualExecutionPacketPanel.tsx"), "utf8");
    const packetLayer = readFileSync(path.join(process.cwd(), "lib", "weeklyManualExecutionPacket.ts"), "utf8");

    expect(executionPage).toContain("/weekly/execution/packet");
    expect(packetPage).toContain("buildWeeklyManualExecutionPacket");
    expect(packetPage).toContain("WeeklyManualExecutionPacketPanel");
    expect(packetPanel).toContain("Pacote de Execucao Manual");
    expect(packetPanel).toContain("Gates antes de executar");
    expect(packetPanel).toContain("Plano de coleta da proxima semana");
    expect(packetLayer).toContain("Nao publicar conteudo automaticamente");
    expect(packetLayer).toContain("Dezembro/2025");
  });
});
