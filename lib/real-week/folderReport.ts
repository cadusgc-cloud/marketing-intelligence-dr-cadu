import { parseMetaAccountCsv, parseMetaContentCsv } from "@/lib/real-week/metaCsv";
import { buildRealWeekBaseline, buildRealWeekPanel, formatBrDate, formatBrNumber } from "@/lib/real-week/weekPanel";
import type {
  MetaContentPost,
  MetaDailyRow,
  RealWeekBaseline,
  RealWeekPanel
} from "@/lib/real-week/types";

export type RealWeekFolderFile = { name: string; text: string };

export type RealWeekFolderFileResult = {
  name: string;
  kind: "conteudo" | "conta" | "nao-reconhecido";
  summary: string;
  errors: string[];
  warnings: string[];
};

export type RealWeekFolderReport = {
  ok: boolean;
  files: RealWeekFolderFileResult[];
  posts: MetaContentPost[];
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
  const days: MetaDailyRow[] = [];
  const warnings: string[] = [];

  for (const file of files) {
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
    days: panel?.days ?? [],
    warnings,
    panel,
    baseline,
    reportMarkdown: ""
  };
  report.reportMarkdown = buildFolderReportMarkdown(report, files.length, generatedAt);
  return report;
}

function dedupePosts(posts: MetaContentPost[]): MetaContentPost[] {
  const seen = new Set<string>();
  const result: MetaContentPost[] = [];
  for (const post of posts) {
    const key = [post.date, post.postType, post.reach, post.likes, post.comments, post.shares, post.saves].join("|");
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
      file.kind === "conteudo" ? "posts (Insights > Conteudo)" : file.kind === "conta" ? "conta por dia (Insights > Resultados)" : "nao reconhecido";
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
      ...exportGuide
    );
    return lines.join("\n");
  }

  lines.push(
    "## Painel semanal (dados reais)",
    "",
    "| Semana | Posts | Alcance | Alcance medio/post | Curtidas | Comentarios | Compart. | Salvos | Engajamento | Alcance conta | Seguidores |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"
  );
  for (const week of report.panel.weeks) {
    lines.push(
      `| ${week.label} | ${week.posts} | ${formatBrNumber(week.reachTotal)} | ${week.reachAvgPerPost === null ? "-" : formatBrNumber(week.reachAvgPerPost)} | ${formatBrNumber(week.likes)} | ${formatBrNumber(week.comments)} | ${formatBrNumber(week.shares)} | ${formatBrNumber(week.saves)} | ${formatBrNumber(week.engagementTotal)} | ${week.accountReach === null ? "-" : formatBrNumber(week.accountReach)} | ${week.followerGrowth === null ? "-" : `${week.followerGrowth >= 0 ? "+" : ""}${formatBrNumber(week.followerGrowth)}`} |`
    );
  }
  lines.push("", report.baseline.markdown);
  return lines.join("\n");
}
