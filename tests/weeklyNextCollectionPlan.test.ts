import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildWeeklyCollectionReadinessBoard } from "@/lib/weeklyCollectionReadiness";
import { buildWeeklyNextCollectionPlan, buildNextCollectionTasks } from "@/lib/weeklyNextCollectionPlan";
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
    notes: "Semana agregada com rotina editorial e sem dados pessoais.",
    ...overrides
  });
}

describe("Weekly Next Collection Plan", () => {
  it("gera plano de manutencao quando a coleta atual esta pronta", () => {
    const plan = buildWeeklyNextCollectionPlan(makeWeek());

    expect(plan.status).toBe("ready_to_plan");
    expect(plan.tasks).toHaveLength(1);
    expect(plan.tasks[0].id).toBe("maintain-weekly-collection-routine");
    expect(plan.dailyRoutine.join(" ")).toContain("totais agregados");
    expect(plan.weeklyCloseRoutine.join(" ")).toContain("mesmo periodo");
  });

  it("bloqueia rascunho vazio e prioriza identidade da semana", () => {
    const plan = buildWeeklyNextCollectionPlan(createEmptyWeeklyMarketingData());

    expect(plan.status).toBe("blocked");
    expect(plan.summary).toContain("bloqueios");
    expect(plan.tasks[0]).toMatchObject({
      id: "define-week-identity",
      priority: "high",
      ownerSuggestion: "Cadu"
    });
  });

  it("transforma baixa cadencia de Instagram em tarefa diaria de coleta", () => {
    const plan = buildWeeklyNextCollectionPlan(makeWeek({ instagramStories: 12, instagramReels: 1 }));
    const cadenceTask = plan.tasks.find((task) => task.id === "track-daily-instagram-cadence");

    expect(plan.status).toBe("needs_collection");
    expect(cadenceTask).toBeDefined();
    expect(cadenceTask?.cadence).toBe("daily");
    expect(cadenceTask?.guardrail).toContain("Sem automacao");
  });

  it("gera alerta de Google quando ha custo e clique sem conversao", () => {
    const plan = buildWeeklyNextCollectionPlan(makeWeek({ googleConversions: 0 }));
    const googleTask = plan.tasks.find((task) => task.id === "collect-google-ads-and-tracking");

    expect(googleTask).toBeDefined();
    expect(googleTask?.priority).toBe("high");
    expect(googleTask?.action).toContain("tracking");
    expect(googleTask?.acceptanceCriteria.join(" ")).toContain("nao como campo esquecido");
  });

  it("gera tarefa de funil comercial apenas com totais agregados", () => {
    const plan = buildWeeklyNextCollectionPlan(
      makeWeek({
        whatsappTotal: 0,
        qualifiedConversations: 0,
        consultationsScheduled: null,
        consultationsAttended: null,
        surgeriesClosed: null
      })
    );
    const funnelTask = plan.tasks.find((task) => task.id === "collect-commercial-funnel-totals");

    expect(funnelTask).toBeDefined();
    expect(funnelTask?.ownerSuggestion).toBe("atendimento");
    expect(funnelTask?.priority).toBe("high");
    expect(funnelTask?.guardrail).toContain("somente numeros agregados");
    expect(funnelTask?.guardrail).not.toMatch(/telefone individual|nome do paciente|dm privada/i);
  });

  it("preserva handoff interno, manual, sem API e sem dezembro de 2025 como benchmark", () => {
    const plan = buildWeeklyNextCollectionPlan(makeWeek({ googleConversions: 0 }));
    const text = `${plan.handoffScript} ${plan.doNotDo.join(" ")}`.toLocaleLowerCase("pt-BR");

    expect(text).toContain("somente totais agregados");
    expect(text).toContain("nao conectar api");
    expect(text).toContain("nao usar dezembro/2025 como benchmark normal");
    expect(text).toContain("revisar manualmente");
    expect(text).not.toMatch(/envio automatico liberado|scraping liberado|oauth obrigatorio|dados de paciente/);
  });

  it("mantem as tarefas derivadas da prontidao por fonte", () => {
    const board = buildWeeklyCollectionReadinessBoard(makeWeek({ instagramStories: 10, googleConversions: 0 }));
    const tasks = buildNextCollectionTasks(board);

    expect(tasks.map((task) => task.sourceId)).toEqual(expect.arrayContaining(["instagram-organic", "google-ads"]));
    expect(tasks.every((task) => task.evidenceToCollect.length > 0)).toBe(true);
    expect(tasks.every((task) => task.acceptanceCriteria.length > 0)).toBe(true);
  });

  it("integra o painel do plano na tela /data e documentacao", () => {
    const dataClient = readFileSync(path.join(process.cwd(), "app", "data", "WeeklyDataInputClient.tsx"), "utf8");
    const panel = readFileSync(path.join(process.cwd(), "app", "data", "WeeklyNextCollectionPlanPanel.tsx"), "utf8");
    const domain = readFileSync(path.join(process.cwd(), "lib", "weeklyNextCollectionPlan.ts"), "utf8");

    expect(dataClient).toContain("buildWeeklyNextCollectionPlan");
    expect(dataClient).toContain("WeeklyNextCollectionPlanPanel");
    expect(panel).toContain("Plano de coleta da proxima semana");
    expect(panel).toContain("Roteiro diario");
    expect(panel).toContain("Fechamento semanal");
    expect(domain).toContain("buildWeeklyNextCollectionPlan");
    expect(domain).toContain("/data/collection-packet");
  });
});
