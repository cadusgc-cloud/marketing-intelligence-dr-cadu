import { execFileSync } from "node:child_process";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { WeeklyMarketingWeekInput } from "@/lib/weeklyMarketingWeeks";

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const TEST_DIRECT_URL = process.env.TEST_DIRECT_URL ?? TEST_DATABASE_URL;
const describePersistence = TEST_DATABASE_URL ? describe : describe.skip;

let prisma: typeof import("@/lib/db").prisma;
let upsertWeeklyMarketingData: typeof import("@/lib/weeklyMarketingWeeks").upsertWeeklyMarketingData;
let getLatestWeeklyMarketingData: typeof import("@/lib/weeklyMarketingWeeks").getLatestWeeklyMarketingData;
let getWeeklyMarketingDataById: typeof import("@/lib/weeklyMarketingWeeks").getWeeklyMarketingDataById;
let getPreviousWeeklyMarketingData: typeof import("@/lib/weeklyMarketingWeeks").getPreviousWeeklyMarketingData;
let getWeeklyMarketingWeekSummaries: typeof import("@/lib/weeklyMarketingWeeks").getWeeklyMarketingWeekSummaries;

const baseInput: WeeklyMarketingWeekInput = {
  weekLabel: "Semana persistida",
  startDate: "2026-05-11",
  endDate: "2026-05-17",
  metaSpend: 500,
  metaWhatsappConversations: 100,
  metaProfileVisits: 4000,
  googleSpend: 200,
  googleClicks: 50,
  googleConversions: 5,
  instagramStories: 42,
  instagramReels: 3,
  instagramPosts: 2,
  instagramProfileVisits: 900,
  whatsappTotal: 120,
  qualifiedConversations: 40,
  consultationsScheduled: 12,
  consultationsAttended: 9,
  surgeriesClosed: 2,
  notes: "Persistencia agregada."
};

function prismaCommand() {
  if (process.platform === "win32") {
    return { command: "cmd.exe", args: ["/c", "node_modules\\.bin\\prisma.cmd", "migrate", "deploy"] };
  }
  return { command: "node_modules/.bin/prisma", args: ["migrate", "deploy"] };
}

beforeAll(async () => {
  if (!TEST_DATABASE_URL) return;
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  process.env.DIRECT_URL = TEST_DIRECT_URL;
  const command = prismaCommand();
  execFileSync(command.command, command.args, {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL, DIRECT_URL: TEST_DIRECT_URL },
    stdio: "pipe"
  });

  const dbModule = await import("@/lib/db");
  const weeklyModule = await import("@/lib/weeklyMarketingWeeks");
  prisma = dbModule.prisma;
  upsertWeeklyMarketingData = weeklyModule.upsertWeeklyMarketingData;
  getLatestWeeklyMarketingData = weeklyModule.getLatestWeeklyMarketingData;
  getWeeklyMarketingDataById = weeklyModule.getWeeklyMarketingDataById;
  getPreviousWeeklyMarketingData = weeklyModule.getPreviousWeeklyMarketingData;
  getWeeklyMarketingWeekSummaries = weeklyModule.getWeeklyMarketingWeekSummaries;
});

beforeEach(async () => {
  if (!prisma) return;
  await prisma.weeklyMarketingWeek.deleteMany();
});

afterAll(async () => {
  await prisma?.$disconnect();
});

describePersistence("WeeklyMarketingWeek persistence", () => {
  it("cria e atualiza a mesma semana pelo periodo", async () => {
    const first = await upsertWeeklyMarketingData(baseInput);
    const second = await upsertWeeklyMarketingData({
      ...baseInput,
      metaSpend: 800,
      consultationsScheduled: null,
      consultationsAttended: null,
      surgeriesClosed: null
    });
    const records = await prisma.weeklyMarketingWeek.findMany();

    expect(records).toHaveLength(1);
    expect(second.id).toBe(first.id);
    expect(second.metaCostPerWhatsapp).toBe(8);
    expect(second.consultationsScheduled).toBeNull();
  });

  it("seleciona a semana mais recente por endDate", async () => {
    await upsertWeeklyMarketingData({ ...baseInput, weekLabel: "Semana antiga", startDate: "2026-05-04", endDate: "2026-05-10" });
    await upsertWeeklyMarketingData({ ...baseInput, weekLabel: "Semana nova", startDate: "2026-05-18", endDate: "2026-05-24" });

    const latest = await getLatestWeeklyMarketingData();

    expect(latest?.weekLabel).toBe("Semana nova");
    expect(latest?.endDate).toBe("2026-05-24");
  });

  it("carrega semana por id e lista resumos em ordem decrescente", async () => {
    const oldWeek = await upsertWeeklyMarketingData({ ...baseInput, weekLabel: "Semana antiga", startDate: "2026-05-04", endDate: "2026-05-10" });
    await upsertWeeklyMarketingData({ ...baseInput, weekLabel: "Semana nova", startDate: "2026-05-18", endDate: "2026-05-24" });

    const loaded = await getWeeklyMarketingDataById(oldWeek.id);
    const summaries = await getWeeklyMarketingWeekSummaries();

    expect(loaded?.weekLabel).toBe("Semana antiga");
    expect(summaries.map((week) => week.weekLabel)).toEqual(["Semana nova", "Semana antiga"]);
    expect(summaries[0].operationalSnapshot).toContain("conversas Meta");
  });

  it("busca a semana imediatamente anterior a semana selecionada", async () => {
    await upsertWeeklyMarketingData({ ...baseInput, weekLabel: "Semana antiga", startDate: "2026-05-04", endDate: "2026-05-10" });
    const current = await upsertWeeklyMarketingData({ ...baseInput, weekLabel: "Semana atual", startDate: "2026-05-11", endDate: "2026-05-17" });
    await upsertWeeklyMarketingData({ ...baseInput, weekLabel: "Semana futura", startDate: "2026-05-18", endDate: "2026-05-24" });

    const previous = await getPreviousWeeklyMarketingData(current);

    expect(previous?.weekLabel).toBe("Semana antiga");
    expect(previous?.endDate).toBe("2026-05-10");
  });
});
