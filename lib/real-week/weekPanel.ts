import type {
  FollowerGrowthBasis,
  MetaContentPost,
  MetaDailyRow,
  RealWeekBaseline,
  RealWeekPanel,
  RealWeekSummary,
  RealWeekTotals
} from "@/lib/real-week/types";

export function buildRealWeekPanel(posts: MetaContentPost[], days: MetaDailyRow[] = []): RealWeekPanel {
  const mergedDays = mergeDailyRows(days);
  const allDates = [...posts.map((post) => post.date), ...mergedDays.map((day) => day.date)].sort();

  if (allDates.length === 0) {
    return { periodStart: null, periodEnd: null, weeks: [], totals: buildTotals([]), days: [] };
  }

  const periodStart = allDates[0];
  const periodEnd = allDates[allDates.length - 1];
  const weeks: RealWeekSummary[] = [];

  for (
    let weekStart = startOfWeek(periodStart);
    weekStart <= periodEnd;
    weekStart = addDays(weekStart, 7)
  ) {
    weeks.push(buildWeekSummary(weekStart, posts, mergedDays));
  }

  return { periodStart, periodEnd, weeks, totals: buildTotals(posts), days: mergedDays };
}

export function buildRealWeekBaseline(panel: RealWeekPanel): RealWeekBaseline {
  const mergedDays = panel.days;
  const weeksCovered = panel.weeks.length;
  const postsTotal = panel.totals.posts;
  const postsPerWeek = weeksCovered > 0 ? round1(postsTotal / weeksCovered) : null;
  const reachAvgPerPost =
    panel.totals.postsWithReach > 0 ? round1(panel.totals.reachTotal / panel.totals.postsWithReach) : null;
  const engagementAvgPerPost = postsTotal > 0 ? round1(panel.totals.engagementTotal / postsTotal) : null;
  const engagementRate =
    panel.totals.reachTotal > 0 ? round4(panel.totals.engagementOnPostsWithReach / panel.totals.reachTotal) : null;

  const followerDays = mergedDays.filter((day) => day.followersTotal !== null);
  const newFollowerDays = mergedDays.filter((day) => day.newFollowers !== null);
  let followerGrowth: number | null = null;
  let followerGrowthBasis: FollowerGrowthBasis | null = null;
  if (followerDays.length > 0) {
    followerGrowth = (followerDays[followerDays.length - 1].followersTotal ?? 0) - (followerDays[0].followersTotal ?? 0);
    followerGrowthBasis = "total";
  } else if (newFollowerDays.length > 0) {
    followerGrowth = newFollowerDays.reduce((sum, day) => sum + (day.newFollowers ?? 0), 0);
    followerGrowthBasis = "diario";
  }

  const reachDays = mergedDays.filter((day) => day.accountReach !== null);
  const accountReachDailyAvg =
    reachDays.length > 0 ? round1(reachDays.reduce((sum, day) => sum + (day.accountReach ?? 0), 0) / reachDays.length) : null;

  const baseline: RealWeekBaseline = {
    periodStart: panel.periodStart,
    periodEnd: panel.periodEnd,
    weeksCovered,
    postsTotal,
    postsPerWeek,
    reachAvgPerPost,
    engagementAvgPerPost,
    engagementRate,
    followerGrowth,
    followerGrowthBasis,
    accountReachDailyAvg,
    markdown: "",
    tsv: ""
  };

  baseline.markdown = buildBaselineMarkdown(baseline);
  baseline.tsv = buildBaselineTsv(baseline);
  return baseline;
}

function buildWeekSummary(weekStart: string, posts: MetaContentPost[], days: MetaDailyRow[]): RealWeekSummary {
  const weekEnd = addDays(weekStart, 6);
  const weekPosts = posts.filter((post) => post.date >= weekStart && post.date <= weekEnd);
  const weekDays = days.filter((day) => day.date >= weekStart && day.date <= weekEnd);

  const postsWithReach = weekPosts.filter((post) => post.reach !== null);
  const reachTotal = sum(postsWithReach.map((post) => post.reach ?? 0));
  const likes = sum(weekPosts.map((post) => post.likes ?? 0));
  const comments = sum(weekPosts.map((post) => post.comments ?? 0));
  const shares = sum(weekPosts.map((post) => post.shares ?? 0));
  const saves = sum(weekPosts.map((post) => post.saves ?? 0));

  const reachDays = weekDays.filter((day) => day.accountReach !== null);
  const followerDays = weekDays.filter((day) => day.followersTotal !== null);
  const newFollowerDays = weekDays.filter((day) => day.newFollowers !== null);

  let followerGrowth: number | null = null;
  if (followerDays.length > 0) {
    followerGrowth = (followerDays[followerDays.length - 1].followersTotal ?? 0) - (followerDays[0].followersTotal ?? 0);
  } else if (newFollowerDays.length > 0) {
    followerGrowth = sum(newFollowerDays.map((day) => day.newFollowers ?? 0));
  }

  return {
    weekStart,
    weekEnd,
    label: `${formatBrDate(weekStart)} a ${formatBrDate(weekEnd)}`,
    posts: weekPosts.length,
    postsWithReach: postsWithReach.length,
    reachTotal,
    reachAvgPerPost: postsWithReach.length > 0 ? round1(reachTotal / postsWithReach.length) : null,
    likes,
    comments,
    shares,
    saves,
    engagementTotal: likes + comments + shares + saves,
    accountReach: reachDays.length > 0 ? sum(reachDays.map((day) => day.accountReach ?? 0)) : null,
    followerGrowth
  };
}

function buildTotals(posts: MetaContentPost[]): RealWeekTotals {
  const postsWithReach = posts.filter((post) => post.reach !== null);
  const engagementOf = (post: MetaContentPost) =>
    (post.likes ?? 0) + (post.comments ?? 0) + (post.shares ?? 0) + (post.saves ?? 0);

  return {
    posts: posts.length,
    postsWithReach: postsWithReach.length,
    reachTotal: sum(postsWithReach.map((post) => post.reach ?? 0)),
    likes: sum(posts.map((post) => post.likes ?? 0)),
    comments: sum(posts.map((post) => post.comments ?? 0)),
    shares: sum(posts.map((post) => post.shares ?? 0)),
    saves: sum(posts.map((post) => post.saves ?? 0)),
    engagementTotal: sum(posts.map(engagementOf)),
    engagementOnPostsWithReach: sum(postsWithReach.map(engagementOf))
  };
}

export function mergeDailyRows(days: MetaDailyRow[]): MetaDailyRow[] {
  const byDate = new Map<string, MetaDailyRow>();
  for (const day of days) {
    const existing = byDate.get(day.date);
    if (!existing) {
      byDate.set(day.date, { ...day });
      continue;
    }
    if (day.accountReach !== null) existing.accountReach = day.accountReach;
    if (day.followersTotal !== null) existing.followersTotal = day.followersTotal;
    if (day.newFollowers !== null) existing.newFollowers = day.newFollowers;
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function buildBaselineMarkdown(baseline: RealWeekBaseline): string {
  const period =
    baseline.periodStart && baseline.periodEnd
      ? `${formatBrDate(baseline.periodStart)} a ${formatBrDate(baseline.periodEnd)}`
      : "sem periodo importado";
  const followerLine =
    baseline.followerGrowth === null
      ? "nao importado (envie tambem o CSV de Insights > Resultados)"
      : `${baseline.followerGrowth >= 0 ? "+" : ""}${formatBrNumber(baseline.followerGrowth)} ${
          baseline.followerGrowthBasis === "total" ? "(diferenca entre o primeiro e o ultimo dia)" : "(soma dos novos seguidores por dia)"
        }`;
  const accountReachLine =
    baseline.accountReachDailyAvg === null
      ? "nao importado (envie tambem o CSV de Insights > Resultados)"
      : formatBrNumber(baseline.accountReachDailyAvg);

  return [
    "# Baseline da equipe atual (semana real)",
    "",
    `Periodo importado: ${period} (${baseline.weeksCovered} semana(s))`,
    "",
    `- Posts no periodo: ${formatBrNumber(baseline.postsTotal)} (${formatOrDash(baseline.postsPerWeek)} por semana)`,
    `- Alcance medio por post: ${formatOrDash(baseline.reachAvgPerPost)}`,
    `- Engajamento medio por post: ${formatOrDash(baseline.engagementAvgPerPost)} (curtidas + comentarios + compartilhamentos + salvamentos)`,
    `- Taxa de engajamento sobre alcance: ${baseline.engagementRate === null ? "-" : `${formatBrNumber(round1(baseline.engagementRate * 100))}%`}`,
    `- Crescimento de seguidores no periodo: ${followerLine}`,
    `- Alcance diario medio da conta: ${accountReachLine}`,
    "",
    "Fonte: exportacao manual do Meta Business Suite (Insights > Conteudo e Insights > Resultados).",
    "Este e o numero de referencia da equipe atual. A operacao propria precisa superar este baseline."
  ].join("\n");
}

function buildBaselineTsv(baseline: RealWeekBaseline): string {
  const lines: Array<[string, string]> = [
    ["periodo_inicio", baseline.periodStart ?? ""],
    ["periodo_fim", baseline.periodEnd ?? ""],
    ["semanas", String(baseline.weeksCovered)],
    ["posts_total", String(baseline.postsTotal)],
    ["posts_por_semana", baseline.postsPerWeek === null ? "" : String(baseline.postsPerWeek)],
    ["alcance_medio_por_post", baseline.reachAvgPerPost === null ? "" : String(baseline.reachAvgPerPost)],
    ["engajamento_medio_por_post", baseline.engagementAvgPerPost === null ? "" : String(baseline.engagementAvgPerPost)],
    ["taxa_engajamento", baseline.engagementRate === null ? "" : String(baseline.engagementRate)],
    ["crescimento_seguidores", baseline.followerGrowth === null ? "" : String(baseline.followerGrowth)],
    ["base_crescimento_seguidores", baseline.followerGrowthBasis ?? ""],
    ["alcance_diario_medio_conta", baseline.accountReachDailyAvg === null ? "" : String(baseline.accountReachDailyAvg)]
  ];
  return ["indicador\tvalor", ...lines.map(([key, value]) => `${key}\t${value}`)].join("\n");
}

export function startOfWeek(dateIso: string): string {
  const date = new Date(`${dateIso}T00:00:00Z`);
  const diff = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - diff);
  return date.toISOString().slice(0, 10);
}

export function addDays(dateIso: string, days: number): string {
  const date = new Date(`${dateIso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function formatBrDate(dateIso: string): string {
  const [year, month, day] = dateIso.split("-");
  return `${day}/${month}/${year}`;
}

export function formatBrNumber(value: number): string {
  return String(value).replace(".", ",");
}

function formatOrDash(value: number | null): string {
  return value === null ? "-" : formatBrNumber(value);
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function round4(value: number): number {
  return Math.round(value * 10000) / 10000;
}
