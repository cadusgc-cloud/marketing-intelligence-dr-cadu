import { describe, expect, it } from "vitest";
import { parseWeeklyMarketingFormData } from "@/lib/weeklyMarketingForm";

function buildForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  const fields: Record<string, string> = {
    weekLabel: "Semana formulario",
    startDate: "2026-05-11",
    endDate: "2026-05-17",
    metaSpend: "1.234,56",
    metaWhatsappConversations: "100",
    metaProfileVisits: "4000",
    googleSpend: "200.50",
    googleClicks: "50",
    googleConversions: "5",
    instagramStories: "42",
    instagramReels: "3",
    instagramPosts: "2",
    instagramProfileVisits: "900",
    whatsappTotal: "120",
    qualifiedConversations: "40",
    consultationsScheduled: "",
    consultationsAttended: "",
    surgeriesClosed: "",
    notes: "Sem dados pessoais."
  };

  for (const [key, value] of Object.entries({ ...fields, ...overrides })) {
    form.set(key, value);
  }

  return form;
}

describe("Weekly Marketing Form", () => {
  it("converte FormData em input tipado aceitando virgula, ponto e nullable vazio", () => {
    const parsed = parseWeeklyMarketingFormData(buildForm());

    expect(parsed.errors).toEqual([]);
    expect(parsed.input).toEqual(
      expect.objectContaining({
        metaSpend: 1234.56,
        googleSpend: 200.5,
        consultationsScheduled: null,
        consultationsAttended: null,
        surgeriesClosed: null
      })
    );
  });

  it("bloqueia negativos, numeros invalidos e fim antes do inicio", () => {
    const parsed = parseWeeklyMarketingFormData(
      buildForm({
        endDate: "2026-05-10",
        metaSpend: "-10",
        googleClicks: "abc"
      })
    );

    expect(parsed.input).toBeNull();
    expect(parsed.errors).toEqual(
      expect.arrayContaining([
        "A data de fim nao pode ser anterior a data de inicio.",
        "O campo investimento Meta Ads nao pode ser negativo.",
        "O campo cliques Google Ads precisa ser numerico."
      ])
    );
  });
});
