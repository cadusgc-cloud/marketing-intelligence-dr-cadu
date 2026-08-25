import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildRealWeekBaseline,
  buildRealWeekPanel,
  buildRealWeekStoredData,
  parseMetaAccountCsv,
  parseMetaContentCsv,
  parseRealWeekStoredJson
} from "@/lib/real-week";
import { suggestColumnMapping } from "@/lib/report-imports";

function readFixture(name: string): string {
  return readFileSync(fileURLToPath(new URL(`./fixtures/meta/${name}`, import.meta.url)), "utf8");
}

describe("Semana Real 001 - CSV de Conteudo do Meta Business Suite", () => {
  it("aceita o export de Conteudo em portugues e extrai os posts certos", () => {
    const result = parseMetaContentCsv(readFixture("conteudo-pt.csv"));

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.headerLanguage).toBe("pt");
    expect(result.posts).toHaveLength(6);

    expect(result.posts[0]).toEqual({
      date: "2026-08-03",
      postType: "reel",
      reach: 1000,
      likes: 100,
      comments: 10,
      shares: 5,
      saves: 20
    });
    expect(result.posts.map((post) => post.date)).toEqual([
      "2026-08-03",
      "2026-08-05",
      "2026-08-08",
      "2026-08-13",
      "2026-08-15",
      "2026-08-16"
    ]);
    expect(result.posts.map((post) => post.postType)).toEqual(["reel", "carrossel", "imagem", "reel", "imagem", "carrossel"]);
  });

  it("aceita o export de Conteudo em ingles com os mesmos numeros", () => {
    const pt = parseMetaContentCsv(readFixture("conteudo-pt.csv"));
    const en = parseMetaContentCsv(readFixture("conteudo-en.csv"));

    expect(en.ok).toBe(true);
    expect(en.headerLanguage).toBe("en");
    expect(en.posts).toEqual(pt.posts);
  });

  it("post sem alcance vira valor ausente, nao zero", () => {
    const result = parseMetaContentCsv(readFixture("conteudo-pt.csv"));
    const lastPost = result.posts[5];

    expect(lastPost.reach).toBeNull();
    expect(lastPost.likes).toBe(10);
  });

  it("aceita arquivo com BOM no inicio", () => {
    const result = parseMetaContentCsv(`﻿${readFixture("conteudo-pt.csv")}`);
    expect(result.ok).toBe(true);
    expect(result.posts).toHaveLength(6);
  });

  it("aceita CSV regravado pelo Excel com ponto e virgula", () => {
    const text = [
      "Horário de publicação;Tipo de publicação;Alcance;Curtidas;Compartilhamentos;Comentários;Salvamentos",
      "13/08/2026 10:00;Reel do IG;2000;150;10;20;40"
    ].join("\n");
    const result = parseMetaContentCsv(text);

    expect(result.ok).toBe(true);
    expect(result.posts).toEqual([
      { date: "2026-08-13", postType: "reel", reach: 2000, likes: 150, comments: 20, shares: 10, saves: 40 }
    ]);
  });

  it("arquivo sem a coluna de alcance falha com mensagem clara em portugues", () => {
    const result = parseMetaContentCsv(readFixture("conteudo-sem-alcance-pt.csv"));

    expect(result.ok).toBe(false);
    expect(result.posts).toEqual([]);
    const error = result.errors.find((item) => item.code === "coluna-alcance-ausente");
    expect(error?.message).toContain("Alcance");
    expect(error?.message).toContain("Reach");
    expect(error?.hint).toContain("Insights");
  });

  it("arquivo que nao e do Meta falha com orientacao do que fazer", () => {
    const result = parseMetaContentCsv(readFixture("arquivo-errado.csv"));

    expect(result.ok).toBe(false);
    const error = result.errors.find((item) => item.code === "formato-nao-reconhecido");
    expect(error?.message).toContain("Meta Business Suite");
    expect(error?.message).toContain("Produto");
    expect(error?.hint).toContain("Exportar");
  });

  it("texto vazio falha com orientacao", () => {
    const result = parseMetaContentCsv("   \n  ");

    expect(result.ok).toBe(false);
    expect(result.errors[0]?.code).toBe("arquivo-vazio");
    expect(result.errors[0]?.message).toContain("vazio");
  });

  it("coluna recomendada ausente vira aviso, nao bloqueio", () => {
    const text = [
      "Horário de publicação,Tipo de publicação,Alcance,Curtidas,Compartilhamentos,Comentários",
      "13/08/2026 10:00,Reel do IG,2000,150,10,20"
    ].join("\n");
    const result = parseMetaContentCsv(text);

    expect(result.ok).toBe(true);
    expect(result.warnings.some((warning) => warning.includes("Salvamentos"))).toBe(true);
    expect(result.posts[0].saves).toBeNull();
  });

  it("datas ambiguas seguem a convencao do idioma do cabecalho e geram aviso", () => {
    const text = [
      "Horário de publicação,Tipo de publicação,Alcance,Curtidas,Compartilhamentos,Comentários,Salvamentos",
      "05/08/2026 10:00,Reel do IG,2000,150,10,20,40"
    ].join("\n");
    const result = parseMetaContentCsv(text);

    expect(result.ok).toBe(true);
    expect(result.posts[0].date).toBe("2026-08-05");
    expect(result.warnings.some((warning) => warning.includes("dia/mes"))).toBe(true);
  });
});

describe("Semana Real 001 - CSV de Resultados (conta) do Meta Business Suite", () => {
  it("aceita alcance por dia em portugues", () => {
    const result = parseMetaAccountCsv(readFixture("resultados-alcance-pt.csv"));

    expect(result.ok).toBe(true);
    expect(result.days).toHaveLength(14);
    expect(result.days[0]).toEqual({ date: "2026-08-03", accountReach: 100, followersTotal: null, newFollowers: null });
    expect(result.days[13]).toEqual({ date: "2026-08-16", accountReach: 200, followersTotal: null, newFollowers: null });
  });

  it("aceita seguidores totais por dia em portugues", () => {
    const result = parseMetaAccountCsv(readFixture("resultados-seguidores-pt.csv"));

    expect(result.ok).toBe(true);
    expect(result.days[0]).toEqual({ date: "2026-08-03", accountReach: null, followersTotal: 10000, newFollowers: null });
    expect(result.days[13].followersTotal).toBe(10150);
  });

  it("aceita novos seguidores por dia em ingles", () => {
    const result = parseMetaAccountCsv(readFixture("resultados-novos-seguidores-en.csv"));

    expect(result.ok).toBe(true);
    expect(result.days).toHaveLength(14);
    expect(result.days[0]).toEqual({ date: "2026-08-03", accountReach: null, followersTotal: null, newFollowers: 5 });
  });

  it("arquivo de conta sem nenhuma metrica falha com mensagem clara", () => {
    const result = parseMetaAccountCsv('"Data","Observacao"\n"03/08/2026","dia comum"');

    expect(result.ok).toBe(false);
    const error = result.errors.find((item) => item.code === "metrica-conta-ausente");
    expect(error?.message).toContain("Seguidores");
    expect(error?.hint).toContain("Resultados");
  });
});

describe("Semana Real 001 - painel semanal", () => {
  function buildPanelFromFixtures() {
    const content = parseMetaContentCsv(readFixture("conteudo-pt.csv"));
    const reach = parseMetaAccountCsv(readFixture("resultados-alcance-pt.csv"));
    const followers = parseMetaAccountCsv(readFixture("resultados-seguidores-pt.csv"));
    return buildRealWeekPanel(content.posts, [...reach.days, ...followers.days]);
  }

  it("agrupa os posts por semana com os numeros certos", () => {
    const panel = buildPanelFromFixtures();

    expect(panel.periodStart).toBe("2026-08-03");
    expect(panel.periodEnd).toBe("2026-08-16");
    expect(panel.weeks).toHaveLength(2);

    const [week1, week2] = panel.weeks;
    expect(week1.weekStart).toBe("2026-08-03");
    expect(week1.weekEnd).toBe("2026-08-09");
    expect(week1.posts).toBe(3);
    expect(week1.reachTotal).toBe(2400);
    expect(week1.reachAvgPerPost).toBe(800);
    expect(week1.likes).toBe(240);
    expect(week1.comments).toBe(24);
    expect(week1.shares).toBe(11);
    expect(week1.saves).toBe(48);
    expect(week1.engagementTotal).toBe(323);
    expect(week1.accountReach).toBe(700);
    expect(week1.followerGrowth).toBe(60);

    expect(week2.weekStart).toBe("2026-08-10");
    expect(week2.posts).toBe(3);
    expect(week2.postsWithReach).toBe(2);
    expect(week2.reachTotal).toBe(2400);
    expect(week2.reachAvgPerPost).toBe(1200);
    expect(week2.engagementTotal).toBe(269);
    expect(week2.accountReach).toBe(1400);
    expect(week2.followerGrowth).toBe(80);
  });

  it("soma os totais do periodo", () => {
    const panel = buildPanelFromFixtures();

    expect(panel.totals.posts).toBe(6);
    expect(panel.totals.postsWithReach).toBe(5);
    expect(panel.totals.reachTotal).toBe(4800);
    expect(panel.totals.engagementTotal).toBe(592);
  });

  it("semana sem post aparece zerada no painel", () => {
    const posts = [
      { date: "2026-08-03", postType: "reel", reach: 100, likes: 10, comments: 1, shares: 1, saves: 1 },
      { date: "2026-08-18", postType: "post", reach: 200, likes: 20, comments: 2, shares: 2, saves: 2 }
    ];
    const panel = buildRealWeekPanel(posts, []);

    expect(panel.weeks).toHaveLength(3);
    expect(panel.weeks[1].posts).toBe(0);
    expect(panel.weeks[1].reachTotal).toBe(0);
  });
});

describe("Semana Real 001 - baseline da equipe atual", () => {
  it("calcula o baseline com seguidores totais", () => {
    const content = parseMetaContentCsv(readFixture("conteudo-pt.csv"));
    const reach = parseMetaAccountCsv(readFixture("resultados-alcance-pt.csv"));
    const followers = parseMetaAccountCsv(readFixture("resultados-seguidores-pt.csv"));
    const panel = buildRealWeekPanel(content.posts, [...reach.days, ...followers.days]);
    const baseline = buildRealWeekBaseline(panel);

    expect(baseline.weeksCovered).toBe(2);
    expect(baseline.postsTotal).toBe(6);
    expect(baseline.postsPerWeek).toBe(3);
    expect(baseline.reachAvgPerPost).toBe(960);
    expect(baseline.engagementAvgPerPost).toBe(98.7);
    expect(baseline.engagementRate).toBe(0.1206);
    expect(baseline.followerGrowth).toBe(150);
    expect(baseline.followerGrowthBasis).toBe("total");
    expect(baseline.accountReachDailyAvg).toBe(150);

    expect(baseline.markdown).toContain("Baseline da equipe atual");
    expect(baseline.markdown).toContain("960");
    expect(baseline.markdown).toContain("12,1%");
    expect(baseline.tsv).toContain("posts_por_semana\t3");
  });

  it("com novos seguidores diarios o crescimento e a soma do periodo", () => {
    const content = parseMetaContentCsv(readFixture("conteudo-en.csv"));
    const followers = parseMetaAccountCsv(readFixture("resultados-novos-seguidores-en.csv"));
    const panel = buildRealWeekPanel(content.posts, followers.days);
    const baseline = buildRealWeekBaseline(panel);

    expect(baseline.followerGrowth).toBe(70);
    expect(baseline.followerGrowthBasis).toBe("diario");
  });

  it("sem relatorio de conta o baseline marca seguidores como indisponiveis", () => {
    const content = parseMetaContentCsv(readFixture("conteudo-pt.csv"));
    const panel = buildRealWeekPanel(content.posts, []);
    const baseline = buildRealWeekBaseline(panel);

    expect(baseline.followerGrowth).toBeNull();
    expect(baseline.followerGrowthBasis).toBeNull();
    expect(baseline.accountReachDailyAvg).toBeNull();
    expect(baseline.markdown).toContain("nao importado");
  });
});

describe("Semana Real 001 - dados salvos localmente", () => {
  it("serializa e recarrega os dados importados", () => {
    const content = parseMetaContentCsv(readFixture("conteudo-pt.csv"));
    const reach = parseMetaAccountCsv(readFixture("resultados-alcance-pt.csv"));
    const stored = buildRealWeekStoredData({
      posts: content.posts,
      days: reach.days,
      importedAt: "2026-08-24T12:00:00.000Z",
      contentLabel: "conteudo-pt.csv",
      accountLabel: "resultados-alcance-pt.csv"
    });

    const parsed = parseRealWeekStoredJson(JSON.stringify(stored));
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.data.posts).toEqual(content.posts);
      expect(parsed.data.days).toEqual(reach.days);
      expect(parsed.data.version).toBe(1);
    }
  });

  it("JSON invalido ou de outra versao nao quebra, retorna erro", () => {
    expect(parseRealWeekStoredJson("nao é json").ok).toBe(false);
    expect(parseRealWeekStoredJson(JSON.stringify({ version: 99, posts: [], days: [] })).ok).toBe(false);
  });
});

describe("Semana Real 001 - tela /imports reconhece cabecalhos reais do Meta", () => {
  it("mapeia os cabecalhos do export de Conteudo para os campos canonicos", () => {
    const mapping = suggestColumnMapping(
      ["Horário de publicação", "Tipo de publicação", "Alcance", "Curtidas", "Compartilhamentos", "Comentários", "Salvamentos"],
      "instagram"
    );

    expect(mapping.mapped["Horário de publicação"]).toBe("date");
    expect(mapping.mapped["Tipo de publicação"]).toBe("format");
    expect(mapping.mapped["Alcance"]).toBe("reach");
    expect(mapping.mapped["Salvamentos"]).toBe("saves");
    expect(mapping.missingRequiredFields).toEqual([]);
  });
});
