import type { MetaContentPost, MetaDailyRow, RealWeekStoredData, RealWeekStoredParseResult } from "@/lib/real-week/types";

export const realWeekStorageKey = "marketing-os.real-week.v1";

export function buildRealWeekStoredData(input: {
  posts: MetaContentPost[];
  days: MetaDailyRow[];
  importedAt: string;
  contentLabel?: string | null;
  accountLabel?: string | null;
}): RealWeekStoredData {
  return {
    version: 1,
    importedAt: input.importedAt,
    contentLabel: input.contentLabel ?? null,
    accountLabel: input.accountLabel ?? null,
    posts: input.posts,
    days: input.days
  };
}

export function parseRealWeekStoredJson(json: string): RealWeekStoredParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "Os dados salvos no navegador nao sao um JSON valido." };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { ok: false, error: "Os dados salvos no navegador estao em formato inesperado." };
  }
  const data = parsed as Partial<RealWeekStoredData>;
  if (data.version !== 1) {
    return { ok: false, error: "Os dados salvos sao de outra versao do app. Importe os CSVs de novo." };
  }
  if (!Array.isArray(data.posts) || !Array.isArray(data.days) || typeof data.importedAt !== "string") {
    return { ok: false, error: "Os dados salvos estao incompletos. Importe os CSVs de novo." };
  }

  return {
    ok: true,
    data: {
      version: 1,
      importedAt: data.importedAt,
      contentLabel: typeof data.contentLabel === "string" ? data.contentLabel : null,
      accountLabel: typeof data.accountLabel === "string" ? data.accountLabel : null,
      posts: data.posts,
      days: data.days
    }
  };
}
