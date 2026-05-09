import { describe, expect, it } from "vitest";
import { CONTENT_IDEAS, CONTENT_PILLARS, filterContentIdeas, getContentIdeaById } from "@/lib/contentStudio";

describe("Content Studio", () => {
  it("possui pilares fixos iniciais", () => {
    expect(CONTENT_PILLARS).toEqual([
      "Mamas e protese de silicone",
      "Mamoplastia redutora",
      "Lipoaspiracao e contorno corporal",
      "Maternidade e pos-gestacao",
      "Naturalidade e seguranca",
      "Autoridade medica",
      "Bastidores e rotina",
      "Quebra de mitos"
    ]);
  });

  it("inclui pelo menos seis conteudos reaproveitaveis", () => {
    expect(CONTENT_IDEAS).toHaveLength(6);
    expect(CONTENT_IDEAS.map((idea) => idea.title)).toContain("Protese de silicone nao se escolhe so por ml");
  });

  it("cada conteudo possui stories, short, TikTok, legenda, CTA e motivo estrategico", () => {
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
      pillar: "Naturalidade e seguranca",
      funnelStage: "BOFU",
      status: "scripted",
      priority: "high"
    });

    expect(ideas.map((idea) => idea.title)).toEqual([
      "Resultado com 3 meses: o que ja da para avaliar",
      "Nem toda mulher quer exagero"
    ]);
  });

  it("busca conteudo por id para area de detalhe", () => {
    const idea = getContentIdeaById("lipo-nao-e-emagrecimento");

    expect(idea?.title).toBe("Lipoaspiracao nao e emagrecimento");
    expect(idea?.storiesScript.join(" ")).toContain("mito ou verdade");
    expect(idea?.shortScript).toContain("contorno corporal");
    expect(idea?.tiktokScript).toContain("pare um segundo");
  });
});
