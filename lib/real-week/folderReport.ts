import { parseMetaAccountCsv, parseMetaContentCsv, parseMetaStoriesCsv } from "@/lib/real-week/metaCsv";
import { buildRealWeekBaseline, buildRealWeekPanel, formatBrDate, formatBrNumber } from "@/lib/real-week/weekPanel";
import type {
  MetaContentPost,
  MetaDailyRow,
  MetaStoryRow,
  RealWeekBaseline,
  RealWeekPanel
} from "@/lib/real-week/types";

export type RealWeekFolderFile = { name: string; text: string };

export type RealWeekFolderFileResult = {
  name: string;
  kind: "conteudo" | "stories" | "conta" | "nao-reconhecido";
  summary: string;
  errors: string[];
  warnings: string[];
};

export type RealWeekFolderReport = {
  ok: boolean;
  files: RealWeekFolderFileResult[];
  posts: MetaContentPost[];
  stories: MetaStoryRow[];
  days: MetaDailyRow[];
  warnings: string[];
  panel: RealWeekPanel | null;
  baseline: RealWeekBaseline | null;
  reportMarkdown: string;
};

const exportGuide = [
  "Como exportar as pecas no Meta Business Suite (business.facebook.com):",
  "1. Insights > Conteudo > periodo de 30 dias > Exportar dados (CSV de posts).",
  "2. Insights > Resultados > mesmo periodo > Exportar (CSV de alcance por dia e de seguidores).",
  "3. Salve os arquivos nesta pasta e peca a analise."
];

export function buildRealWeekFolderReport(files: RealWeekFolderFile[], generatedAt: string): RealWeekFolderReport {
  const fileResults: RealWeekFolderFileResult[] = [];
  const posts: MetaContentPost[] = [];
  const stories: MetaStoryRow[] = [];
  const days: MetaDailyRow[] = [];
  const warnings: string[] = [];

  for (const file of files) {
    // Stories primeiro: o export de Stories tambem tem data e alcance, entao
    // passaria como feed se fosse testado depois.
    const storiesResult = parseMetaStoriesCsv(file.text);
    if (storiesResult.ok) {
      stories.push(...storiesResult.stories);
      fileResults.push({
        name: file.name,
        kind: "stories",
        summary: `${storiesResult.stories.length} storie(s) reconhecido(s).`,
        errors: [],
        warnings: storiesResult.warnings
      });
      continue;
    }

    const content = parseMetaContentCsv(file.text);
    const account = parseMetaAccountCsv(file.text);
    // Um CSV so com Data+Alcance casa nos dois parsers; so e conteudo se tiver
    // sinal exclusivo de post (tipo de publicacao ou metrica de engajamento).
    const looksLikeContent =
      content.ok &&
      content.posts.some(
        (post) =>
          post.postType !== "outro" ||
          post.likes !== null ||
          post.comments !== null ||
          post.shares !== null ||
          post.saves !== null
      );

    if (looksLikeContent || (content.ok && !account.ok)) {
      posts.push(...content.posts);
      fileResults.push({
        name: file.name,
        kind: "conteudo",
        summary: `${content.posts.length} post(s) reconhecido(s).`,
        errors: [],
        warnings: content.warnings
      });
      continue;
    }

    if (account.ok) {
      days.push(...account.days);
      fileResults.push({
        name: file.name,
        kind: "conta",
        summary: `${account.days.length} dia(s) reconhecido(s).`,
        errors: [],
        warnings: account.warnings
      });
      continue;
    }

    const contentRecognizedSomething = content.errors.some((error) => error.code !== "formato-nao-reconhecido");
    const bestErrors = contentRecognizedSomething ? content.errors : account.errors;
    fileResults.push({
      name: file.name,
      kind: "nao-reconhecido",
      summary: "Arquivo ignorado.",
      errors: bestErrors.map((error) => `${error.message}${error.hint ? ` ${error.hint}` : ""}`),
      warnings: []
    });
  }

  const dedupedPosts = dedupePosts(posts);
  if (dedupedPosts.length < posts.length) {
    warnings.push(`${posts.length - dedupedPosts.length} post(s) duplicado(s) entre arquivos foram ignorados.`);
  }

  const hasData = dedupedPosts.length > 0 || days.length > 0;
  const panel = hasData ? buildRealWeekPanel(dedupedPosts, days) : null;
  const baseline = panel ? buildRealWeekBaseline(panel) : null;
  const ok = dedupedPosts.length > 0;

  const report: RealWeekFolderReport = {
    ok,
    files: fileResults,
    posts: dedupedPosts,
    stories: dedupeStories(stories),
    days: panel?.days ?? [],
    warnings,
    panel,
    baseline,
    reportMarkdown: ""
  };
  report.reportMarkdown = buildFolderReportMarkdown(report, files.length, generatedAt);
  return report;
}

function buildStoriesSection(stories: MetaStoryRow[]): string[] {
  if (stories.length === 0) return [];

  const withReach = stories.filter((story) => story.reach !== null);
  const avgReach =
    withReach.length > 0 ? Math.round(withReach.reduce((total, story) => total + (story.reach ?? 0), 0) / withReach.length) : null;

  return [
    "",
    "## Stories (contados a parte)",
    "",
    `${stories.length} storie(s) no arquivo, de ${formatBrDate(stories[0].date)} a ${formatBrDate(stories[stories.length - 1].date)}.`,
    `Alcance medio por story: ${avgReach === null ? "-" : formatBrNumber(avgReach)}. Respostas: ${formatBrNumber(sumField(stories, "replies"))}. Toques em figurinhas: ${formatBrNumber(sumField(stories, "stickerTaps"))}. Visitas ao perfil: ${formatBrNumber(sumField(stories, "profileVisits"))}.`,
    "",
    "Atencao: o Meta so exporta stories das ultimas 24 horas, entao este recorte nao cobre o periodo inteiro e NAO entra no baseline de posts. Para acompanhar stories, exporte todo dia."
  ];
}

function sumField(stories: MetaStoryRow[], field: keyof Omit<MetaStoryRow, "date">): number {
  return stories.reduce((total, story) => total + (story[field] ?? 0), 0);
}

function dedupeStories(stories: MetaStoryRow[]): MetaStoryRow[] {
  const seen = new Set<string>();
  return stories
    .filter((story) => {
      const key = [story.date, story.reach, story.replies, story.navigation, story.stickerTaps].join("|");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function dedupePosts(posts: MetaContentPost[]): MetaContentPost[] {
  const seen = new Set<string>();
  const result: MetaContentPost[] = [];
  for (const post of posts) {
    const key = [post.date, post.postType, post.reach, post.likes, post.comments, post.shares, post.saves, post.follows].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(post);
  }
  return result.sort((a, b) => a.date.localeCompare(b.date));
}

function buildFolderReportMarkdown(report: RealWeekFolderReport, totalFiles: number, generatedAt: string): string {
  const generatedDate = formatBrDate(generatedAt.slice(0, 10));
  const lines: string[] = [
    "# Semana real - relatorio automatico",
    "",
    `Gerado em ${generatedDate} a partir de ${totalFiles} arquivo(s) desta pasta. Nada saiu da maquina.`,
    ""
  ];

  if (totalFiles === 0) {
    lines.push(
      "Nenhum arquivo encontrado na pasta.",
      "",
      ...exportGuide
    );
    return lines.join("\n");
  }

  lines.push("## Arquivos lidos", "");
  for (const file of report.files) {
    const kindLabel =
      file.kind === "conteudo"
        ? "posts do feed (Insights > Conteudo)"
        : file.kind === "stories"
          ? "stories (Insights > Conteudo, filtro Stories)"
          : file.kind === "conta"
            ? "conta por dia (Insights > Resultados)"
            : "nao reconhecido";
    lines.push(`- ${file.name}: ${kindLabel}. ${file.summary}`);
    for (const error of file.errors) lines.push(`  - Problema: ${error}`);
    for (const warning of file.warnings) lines.push(`  - Aviso: ${warning}`);
  }
  lines.push("");

  for (const warning of report.warnings) {
    lines.push(`Aviso geral: ${warning}`, "");
  }

  if (!report.ok || !report.panel || !report.baseline) {
    lines.push(
      "Nenhum CSV valido de posts foi encontrado, entao o painel nao foi gerado.",
      "",
      ...exportGuide,
      ...buildStoriesSection(report.stories)
    );
    return lines.join("\n");
  }

  lines.push(
    "## Painel semanal (dados reais)",
    "",
    "| Semana | Posts | Alcance | Alcance medio/post | Curtidas | Comentarios | Compart. | Salvos | Seguimentos | Engajamento | Alcance conta | Seguidores |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"
  );
  for (const week of report.panel.weeks) {
    lines.push(
      `| ${week.label} | ${week.posts} | ${formatBrNumber(week.reachTotal)} | ${week.reachAvgPerPost === null ? "-" : formatBrNumber(week.reachAvgPerPost)} | ${formatBrNumber(week.likes)} | ${formatBrNumber(week.comments)} | ${formatBrNumber(week.shares)} | ${formatBrNumber(week.saves)} | ${formatBrNumber(week.follows)} | ${formatBrNumber(week.engagementTotal)} | ${week.accountReach === null ? "-" : formatBrNumber(week.accountReach)} | ${week.followerGrowth === null ? "-" : `${week.followerGrowth >= 0 ? "+" : ""}${formatBrNumber(week.followerGrowth)}`} |`
    );
  }

  lines.push("", report.baseline.markdown, ...buildStoriesSection(report.stories));
  return lines.join("\n");
}
