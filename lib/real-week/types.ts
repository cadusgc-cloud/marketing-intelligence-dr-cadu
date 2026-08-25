export type RealWeekImportError = {
  code:
    | "arquivo-vazio"
    | "formato-nao-reconhecido"
    | "coluna-data-ausente"
    | "coluna-alcance-ausente"
    | "metrica-conta-ausente";
  message: string;
  hint?: string;
};

export type MetaHeaderLanguage = "pt" | "en";

export type MetaContentPost = {
  date: string;
  postType: string;
  reach: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  follows: number | null;
};

export type MetaStoryRow = {
  date: string;
  reach: number | null;
  replies: number | null;
  navigation: number | null;
  stickerTaps: number | null;
  profileVisits: number | null;
};

export type MetaStoriesParseResult = {
  ok: boolean;
  headerLanguage: MetaHeaderLanguage;
  stories: MetaStoryRow[];
  errors: RealWeekImportError[];
  warnings: string[];
  ignoredRowCount: number;
};

export type MetaContentParseResult = {
  ok: boolean;
  headerLanguage: MetaHeaderLanguage;
  posts: MetaContentPost[];
  errors: RealWeekImportError[];
  warnings: string[];
  ignoredRowCount: number;
};

export type MetaDailyRow = {
  date: string;
  accountReach: number | null;
  followersTotal: number | null;
  newFollowers: number | null;
};

export type MetaAccountParseResult = {
  ok: boolean;
  headerLanguage: MetaHeaderLanguage;
  days: MetaDailyRow[];
  errors: RealWeekImportError[];
  warnings: string[];
  ignoredRowCount: number;
};

export type RealWeekSummary = {
  weekStart: string;
  weekEnd: string;
  label: string;
  posts: number;
  postsWithReach: number;
  reachTotal: number;
  reachAvgPerPost: number | null;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  follows: number;
  engagementTotal: number;
  accountReach: number | null;
  followerGrowth: number | null;
};

export type RealWeekTotals = {
  posts: number;
  postsWithReach: number;
  reachTotal: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  follows: number;
  engagementTotal: number;
  engagementOnPostsWithReach: number;
};

export type RealWeekPanel = {
  periodStart: string | null;
  periodEnd: string | null;
  weeks: RealWeekSummary[];
  totals: RealWeekTotals;
  days: MetaDailyRow[];
};

export type FollowerGrowthBasis = "total" | "diario";

export type RealWeekBaseline = {
  periodStart: string | null;
  periodEnd: string | null;
  weeksCovered: number;
  postsTotal: number;
  postsPerWeek: number | null;
  reachAvgPerPost: number | null;
  engagementAvgPerPost: number | null;
  engagementRate: number | null;
  followerGrowth: number | null;
  followerGrowthBasis: FollowerGrowthBasis | null;
  followsFromPosts: number;
  accountReachDailyAvg: number | null;
  markdown: string;
  tsv: string;
};

export type RealWeekStoredData = {
  version: 1;
  importedAt: string;
  contentLabel: string | null;
  accountLabel: string | null;
  posts: MetaContentPost[];
  days: MetaDailyRow[];
};

export type RealWeekStoredParseResult = { ok: true; data: RealWeekStoredData } | { ok: false; error: string };
