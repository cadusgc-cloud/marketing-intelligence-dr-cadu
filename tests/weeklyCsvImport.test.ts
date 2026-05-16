import { describe, expect, it } from "vitest";
import { parseWeeklyCsvImport } from "@/lib/weeklyCsvImport";

describe("Weekly CSV Import", () => {
  it("converte tabela campo/valor com ponto e virgula para importacao assistida", () => {
    const result = parseWeeklyCsvImport(`Campo;Valor
Periodo;11/05/2026 a 17/05/2026
Rotulo da semana;Semana CSV
Investimento Meta Ads;R$ 780,00
Conversas Meta;118
Stories publicados;42`);

    expect(result.delimiter).toBe("semicolon");
    expect(result.normalizedText).toContain("Investimento Meta Ads: R$ 780,00");
    expect(result.assistedResult.fields).toEqual(
      expect.objectContaining({
        startDate: "2026-05-11",
        endDate: "2026-05-17",
        weekLabel: "Semana CSV",
        metaSpend: 780,
        metaWhatsappConversations: 118,
        instagramStories: 42
      })
    );
  });

  it("converte tabela larga com cabecalho e uma linha de dados", () => {
    const result = parseWeeklyCsvImport(`Periodo,Rotulo da semana,Investimento Meta Ads,Conversas Meta,Cliques Google Ads
"11/05/2026 a 17/05/2026","Semana larga","R$ 1.234,56",100,70`);

    expect(result.delimiter).toBe("comma");
    expect(result.columnCount).toBe(5);
    expect(result.assistedResult.fields.metaSpend).toBe(1234.56);
    expect(result.assistedResult.fields.metaWhatsappConversations).toBe(100);
    expect(result.assistedResult.fields.googleClicks).toBe(70);
  });

  it("aceita TSV exportado de planilha", () => {
    const result = parseWeeklyCsvImport(`Campo\tValor
Investimento Google Ads\t220
Conversoes Google Ads\t0
Consultas marcadas\t12`);

    expect(result.delimiter).toBe("tab");
    expect(result.assistedResult.fields.googleSpend).toBe(220);
    expect(result.assistedResult.fields.googleConversions).toBe(0);
    expect(result.assistedResult.fields.consultationsScheduled).toBe(12);
  });

  it("usa a ultima linha nao vazia quando ha varias linhas de dados", () => {
    const result = parseWeeklyCsvImport(`Rotulo da semana;Conversas Meta
Semana antiga;50
Semana atual;120`);

    expect(result.warnings).toContain("A tabela tem mais de uma linha de dados. Foi usada a ultima linha nao vazia como semana atual.");
    expect(result.assistedResult.fields.weekLabel).toBe("Semana atual");
    expect(result.assistedResult.fields.metaWhatsappConversations).toBe(120);
  });

  it("sinaliza linhas com possiveis dados sensiveis", () => {
    const result = parseWeeklyCsvImport(`Campo;Valor
Investimento Meta Ads;500
Paciente;Maria`);

    expect(result.assistedResult.fields.metaSpend).toBe(500);
    expect(result.sensitiveWarnings.length).toBeGreaterThanOrEqual(1);
    expect(result.sensitiveWarnings.join(" ")).toContain("possivel dado sensivel");
  });

  it("nao quebra com texto vazio ou sem delimitador", () => {
    const empty = parseWeeklyCsvImport("");
    const unknown = parseWeeklyCsvImport("Investimento Meta Ads: 500");

    expect(empty.warnings).toContain("Cole um CSV/TSV ou carregue um arquivo antes de gerar a previa.");
    expect(unknown.delimiter).toBe("unknown");
    expect(unknown.assistedResult.fields.metaSpend).toBe(500);
  });
});
