import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildRealWeekFolderReport,
  decodeMetaCsvBuffer,
  parseMetaAccountCsv,
  parseMetaContentCsv,
  parseMetaStoriesCsv
} from "@/lib/real-week";

function fixturePath(name: string): string {
  return fileURLToPath(new URL(`./fixtures/meta/${name}`, import.meta.url));
}

function readFixtureBuffer(name: string): Uint8Array {
  return readFileSync(fixturePath(name));
}

function readDecodedFixture(name: string): string {
  return decodeMetaCsvBuffer(readFixtureBuffer(name));
}

describe("Semana Real 003 - decodificacao de encoding real", () => {
  it("decodifica UTF-16 LE com BOM (export dos cartoes de Resultados)", () => {
    const text = readDecodedFixture("cartao-alcance-utf16.csv");
    expect(text.startsWith("sep=,")).toBe(true);
    expect(text).toContain('"Alcance"');
  });

  it("decodifica UTF-16 BE com BOM", () => {
    const le = Buffer.from('sep=,\n"Data","Primary"\n', "utf16le");
    const be = Buffer.alloc(le.length);
    for (let i = 0; i < le.length; i += 2) {
      be[i] = le[i + 1];
      be[i + 1] = le[i];
    }
    const text = decodeMetaCsvBuffer(Buffer.concat([Buffer.from([0xfe, 0xff]), be]));
    expect(text.startsWith("sep=,")).toBe(true);
  });

  it("decodifica UTF-8 com BOM sem sobras", () => {
    const text = decodeMetaCsvBuffer(readFixtureBuffer("conteudo-real-pt.csv"));
    expect(text).toContain("Identificação do post");
  });
});

describe("Semana Real 003 - cartoes de Resultados (sep=, titulo, Data/Primary)", () => {
  it("cartao de alcance vira dias com alcance da conta", () => {
    const result = parseMetaAccountCsv(readDecodedFixture("cartao-alcance-utf16.csv"));

    expect(result.ok).toBe(true);
    expect(result.days).toEqual([
      { date: "2026-08-10", accountReach: 100, followersTotal: null, newFollowers: null },
      { date: "2026-08-11", accountReach: 110, followersTotal: null, newFollowers: null },
      { date: "2026-08-12", accountReach: 120, followersTotal: null, newFollowers: null }
    ]);
  });

  // Os cartoes de Insights > Resultados sao sempre serie DIARIA. "Seguidores no
  // Instagram" ali e quantos seguidores entraram no dia, nao o total da conta.
  it("cartao 'Seguidores no Instagram' vira novos seguidores por dia, nao total", () => {
    const result = parseMetaAccountCsv(readDecodedFixture("cartao-seguidores-utf16.csv"));

    expect(result.ok).toBe(true);
    expect(result.days.map((day) => day.newFollowers)).toEqual([50, 54, 68]);
    expect(result.days.every((day) => day.followersTotal === null)).toBe(true);
  });

  it("tabela simples com Seguidores acumulados continua sendo total", () => {
    const text = '"Data","Seguidores"\n"03/08/2026","10000"\n"04/08/2026","10010"\n';
    const result = parseMetaAccountCsv(text);

    expect(result.days.map((day) => day.followersTotal)).toEqual([10000, 10010]);
  });

  it("linha sep=; forca o delimitador declarado", () => {
    const text = 'sep=;\n"Alcance"\n"Data";"Primary"\n"2026-08-10T00:00:00";"100"\n';
    const result = parseMetaAccountCsv(text);
    expect(result.ok).toBe(true);
    expect(result.days[0]).toEqual({ date: "2026-08-10", accountReach: 100, followersTotal: null, newFollowers: null });
  });
});

describe("Semana Real 003 - posts do feed no formato real", () => {
  it("descricao multilinha nao quebra os registros", () => {
    const result = parseMetaContentCsv(readDecodedFixture("conteudo-real-pt.csv"));

    expect(result.ok).toBe(true);
    expect(result.posts).toHaveLength(3);
    expect(result.posts.map((post) => post.date)).toEqual(["2026-07-31", "2026-08-13", "2026-08-15"]);
  });

  it("Seguimentos no meio nao contamina Comentarios e Salvamentos", () => {
    const result = parseMetaContentCsv(readDecodedFixture("conteudo-real-pt.csv"));
    const multiline = result.posts[1];

    expect(multiline).toEqual({
      date: "2026-08-13",
      postType: "reel",
      reach: 800,
      likes: 80,
      comments: 8,
      shares: 4,
      saves: 16,
      follows: 1
    });
  });
});

describe("Semana Real 003 - stories separados do feed", () => {
  it("parser de stories reconhece o export real", () => {
    const result = parseMetaStoriesCsv(readDecodedFixture("stories-real-pt.csv"));

    expect(result.ok).toBe(true);
    expect(result.stories).toHaveLength(2);
    expect(result.stories[0]).toEqual({
      date: "2026-08-13",
      reach: 300,
      replies: 2,
      navigation: 150,
      stickerTaps: 5,
      profileVisits: 4
    });
  });

  it("CSV de posts do feed nao passa no parser de stories", () => {
    const result = parseMetaStoriesCsv(readDecodedFixture("conteudo-real-pt.csv"));
    expect(result.ok).toBe(false);
  });
});

describe("Semana Real 003 - classificacao na pasta com os formatos reais", () => {
  function buildRealFolderReport() {
    return buildRealWeekFolderReport(
      [
        { name: "instagram-posts.csv", text: readDecodedFixture("conteudo-real-pt.csv") },
        { name: "instagram-stories.csv", text: readDecodedFixture("stories-real-pt.csv") },
        { name: "alcance-por-dia.csv", text: readDecodedFixture("cartao-alcance-utf16.csv") },
        { name: "seguidores-por-dia.csv", text: readDecodedFixture("cartao-seguidores-utf16.csv") }
      ],
      "2026-08-25T12:00:00.000Z"
    );
  }

  it("classifica posts, stories e cartoes cada um no seu lugar", () => {
    const report = buildRealFolderReport();

    expect(report.files.map((file) => file.kind)).toEqual(["conteudo", "stories", "conta", "conta"]);
    expect(report.ok).toBe(true);
  });

  it("stories ficam fora do baseline de posts", () => {
    const report = buildRealFolderReport();

    expect(report.posts).toHaveLength(3);
    expect(report.baseline?.postsTotal).toBe(3);
    expect(report.stories).toHaveLength(2);
    expect(report.baseline?.followerGrowth).toBe(172);
    expect(report.baseline?.followerGrowthBasis).toBe("diario");
  });

  it("posts por semana usa a duracao do periodo, nao o numero de caixas de semana", () => {
    const report = buildRealFolderReport();

    // 2026-07-31 a 2026-08-15 = 16 dias = 2,3 semanas; 3 posts -> 1,3 por semana.
    // Contar caixas de semana daria 3, inflando o denominador com bordas parciais.
    expect(report.baseline?.weeksCovered).toBe(2.3);
    expect(report.baseline?.postsPerWeek).toBe(1.3);
  });

  it("relatorio traz secao de stories com a ressalva das 24h", () => {
    const report = buildRealFolderReport();

    expect(report.reportMarkdown).toContain("## Stories");
    expect(report.reportMarkdown).toContain("24");
    expect(report.reportMarkdown).toContain("2 storie");
  });
});
