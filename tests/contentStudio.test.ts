import { describe, expect, it } from "vitest";
import { CONTENT_IDEAS, CONTENT_PILLARS, filterContentIdeas, getContentIdeaById } from "@/lib/contentStudio";

describe("Content Studio", () => {
  it("possui pilares fixos iniciais", () => {
    expect(CONTENT_PILLARS).toEqual([
      "Mamas e prótese de silicone",
      "Mamoplastia redutora",
      "Lipoaspiração e contorno corporal",
      "Maternidade e pós-gestação",
      "Naturalidade e segurança",
      "Autoridade médica",
      "Bastidores e rotina",
      "Quebra de mitos"
    ]);
  });

  it("inclui pelo menos seis conteúdos reaproveitáveis", () => {
    expect(CONTENT_IDEAS).toHaveLength(6);
    expect(CONTENT_IDEAS.map((idea) => idea.title)).toContain("Prótese de silicone não se escolhe só por ml");
  });

  it("cada conteúdo possui Stories, short, TikTok, legenda, CTA e motivo estratégico", () => {
    for (const idea of CONTENT_IDEAS) {
      expect(idea.storiesScript.length).toBeGreaterThanOrEqual(3);
      expect(idea.storiesScript.length).toBeLessThanOrEqual(5);
      expect(idea.shortScript.length).toBeGreaterThan(80);
      expect(idea.tiktokScript.length).toBeGreaterThan(60);
      expect(idea.caption).toBeTruthy();
      expect(idea.cta).toBeTruthy();
      expect(idea.abVariation).toBeTruthy();
      expect(idea.strategicReason).toBeTruthy();
    }
  });

  it("filtra por pilar, funil, status e prioridade", () => {
    const ideas = filterContentIdeas(CONTENT_IDEAS, {
      pillar: "Naturalidade e segurança",
      funnelStage: "BOFU",
      status: "scripted",
      priority: "high"
    });

    expect(ideas.map((idea) => idea.title)).toEqual([
      "Resultado com 3 meses: o que já dá para avaliar",
      "Nem toda mulher quer exagero"
    ]);
  });

  it("busca conteúdo por id para área de detalhe", () => {
    const idea = getContentIdeaById("lipo-nao-e-emagrecimento");

    expect(idea?.title).toBe("Lipoaspiração não é emagrecimento");
    expect(idea?.storiesScript.join(" ")).toContain("mito ou verdade");
    expect(idea?.shortScript).toContain("contorno corporal");
    expect(idea?.tiktokScript).toContain("pare um segundo");
  });
});
