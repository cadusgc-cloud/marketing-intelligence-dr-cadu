import { detectDelimiter, splitDelimitedLine } from "@/lib/report-imports/parser";
import { parseNumber, cleanText } from "@/lib/report-imports/normalization";
import { normalizeHeader } from "@/lib/report-imports/sources";
import type {
  MetaAccountParseResult,
  MetaContentParseResult,
  MetaContentPost,
  MetaDailyRow,
  MetaHeaderLanguage,
  RealWeekImportError
} from "@/lib/real-week/types";

type ColumnSpec = {
  key: string;
  label: string;
  searchedFor: string;
  ptAliases: string[];
  enAliases: string[];
};

const exportHint = "Confira se o arquivo veio do Meta Business Suite: Insights > Conteudo > Exportar dados (CSV).";
const accountHint = "Confira se o arquivo veio do Meta Business Suite: Insights > Resultados > Exportar (CSV).";

const contentColumns: ColumnSpec[] = [
  {
    key: "date",
    label: "data de publicacao",
    searchedFor: "Horario de publicacao, Publish time, Data, Date",
    ptAliases: ["horario de publicacao", "hora de publicacao", "data de publicacao", "data", "dia"],
    enAliases: ["publish time", "publish date", "date", "created time"]
  },
  {
    key: "postType",
    label: "tipo de conteudo",
    searchedFor: "Tipo de publicacao, Post type",
    ptAliases: ["tipo de publicacao", "tipo de conteudo", "tipo", "formato"],
    enAliases: ["post type", "content type", "type", "media type", "media product type"]
  },
  {
    key: "reach",
    label: "alcance",
    searchedFor: "Alcance, Reach",
    ptAliases: ["alcance", "contas alcancadas"],
    enAliases: ["reach", "accounts reached"]
  },
  {
    key: "likes",
    label: "curtidas",
    searchedFor: "Curtidas, Likes",
    ptAliases: ["curtidas", "reacoes", "gostei"],
    enAliases: ["likes", "reactions"]
  },
  {
    key: "comments",
    label: "comentarios",
    searchedFor: "Comentarios, Comments",
    ptAliases: ["comentarios"],
    enAliases: ["comments"]
  },
  {
    key: "shares",
    label: "compartilhamentos",
    searchedFor: "Compartilhamentos, Shares",
    ptAliases: ["compartilhamentos", "envios"],
    enAliases: ["shares", "sends"]
  },
  {
    key: "saves",
    label: "salvamentos",
    searchedFor: "Salvamentos, Saves",
    ptAliases: ["salvamentos", "salvos"],
    enAliases: ["saves", "saved"]
  }
];

const contentKnownIgnored: ColumnSpec[] = [
  spec("postId", "identificacao da publicacao", ["identificacao da publicacao", "id da publicacao"], ["post id"]),
  spec("accountId", "identificacao da conta", ["identificacao da conta", "id da conta"], ["account id"]),
  spec("accountUsername", "nome de usuario da conta", ["nome de usuario da conta"], ["account username"]),
  spec("accountName", "nome da conta", ["nome da conta"], ["account name"]),
  spec("description", "descricao", ["descricao", "legenda"], ["description", "caption"]),
  spec("duration", "duracao", ["duracao segundos", "duracao"], ["duration sec", "duration secs", "duration"]),
  spec("permalink", "link permanente", ["link permanente"], ["permalink"]),
  spec("dataComment", "comentario de dados", ["comentario de dados"], ["data comment"]),
  spec("views", "visualizacoes", ["visualizacoes", "impressoes"], ["views", "impressions"]),
  spec("follows", "seguimentos", ["seguimentos", "comecaram a seguir"], ["follows", "new follows"])
];

const accountColumns: ColumnSpec[] = [
  {
    key: "date",
    label: "data",
    searchedFor: "Data, Date",
    ptAliases: ["data", "dia", "data de referencia"],
    enAliases: ["date", "day"]
  },
  {
    key: "accountReach",
    label: "alcance da conta",
    searchedFor: "Alcance, Reach",
    ptAliases: ["alcance", "contas alcancadas"],
    enAliases: ["reach", "accounts reached"]
  },
  {
    key: "followersTotal",
    label: "seguidores totais",
    searchedFor: "Seguidores, Followers",
    ptAliases: ["seguidores", "total de seguidores", "seguidores totais"],
    enAliases: ["followers", "total followers", "followers total"]
  },
  {
    key: "newFollowers",
    label: "novos seguidores",
    searchedFor: "Novos seguidores, New followers",
    ptAliases: ["novos seguidores", "seguidores ganhos", "comecaram a seguir", "seguimentos"],
    enAliases: ["new followers", "new follows", "follows", "net follows"]
  }
];

export function parseMetaContentCsv(rawText: string): MetaContentParseResult {
  const base = parseMetaTable(rawText, contentColumns, contentKnownIgnored, exportHint);
  if (base.errors.length > 0) {
    return {
      ok: false,
      headerLanguage: base.headerLanguage,
      posts: [],
      errors: base.errors,
      warnings: base.warnings,
      ignoredRowCount: 0
    };
  }

  const errors: RealWeekImportError[] = [];
  const warnings = [...base.warnings];
  const columnIndex = base.columnIndex;

  if (columnIndex.date === undefined) {
    errors.push({
      code: "coluna-data-ausente",
      message: "Nao encontrei a coluna de data de publicacao. Procurei por: Horario de publicacao, Publish time, Data, Date.",
      hint: exportHint
    });
  }
  if (columnIndex.reach === undefined) {
    errors.push({
      code: "coluna-alcance-ausente",
      message: "Nao encontrei a coluna de alcance. Procurei por: Alcance, Reach.",
      hint: exportHint
    });
  }
  if (errors.length > 0) {
    return { ok: false, headerLanguage: base.headerLanguage, posts: [], errors, warnings, ignoredRowCount: 0 };
  }

  for (const column of contentColumns) {
    if (column.key === "date" || column.key === "reach") continue;
    if (columnIndex[column.key] === undefined) {
      warnings.push(
        `Coluna de ${column.label} nao encontrada (${column.searchedFor}). Esses valores vao aparecer como ausentes.`
      );
    }
  }

  const dayMonthOrder = detectDayMonthOrder(
    base.dataRows.map((row) => row[columnIndex.date!] ?? ""),
    base.headerLanguage,
    warnings
  );

  const posts: MetaContentPost[] = [];
  let ignoredRowCount = 0;
  for (const row of base.dataRows) {
    const date = parseMetaDate(row[columnIndex.date!] ?? "", dayMonthOrder);
    if (!date) {
      ignoredRowCount += 1;
      continue;
    }
    posts.push({
      date,
      postType: normalizePostType(readCell(row, columnIndex.postType)),
      reach: parseMetaNumber(readCell(row, columnIndex.reach), base.headerLanguage),
      likes: parseMetaNumber(readCell(row, columnIndex.likes), base.headerLanguage),
      comments: parseMetaNumber(readCell(row, columnIndex.comments), base.headerLanguage),
      shares: parseMetaNumber(readCell(row, columnIndex.shares), base.headerLanguage),
      saves: parseMetaNumber(readCell(row, columnIndex.saves), base.headerLanguage)
    });
  }

  if (ignoredRowCount > 0) {
    warnings.push(`${ignoredRowCount} linha(s) sem data valida foram ignoradas.`);
  }

  posts.sort((a, b) => a.date.localeCompare(b.date));
  return { ok: true, headerLanguage: base.headerLanguage, posts, errors: [], warnings, ignoredRowCount };
}

export function parseMetaAccountCsv(rawText: string): MetaAccountParseResult {
  const base = parseMetaTable(rawText, accountColumns, [], accountHint);
  if (base.errors.length > 0) {
    return {
      ok: false,
      headerLanguage: base.headerLanguage,
      days: [],
      errors: base.errors,
      warnings: base.warnings,
      ignoredRowCount: 0
    };
  }

  const errors: RealWeekImportError[] = [];
  const warnings = [...base.warnings];
  const columnIndex = base.columnIndex;

  if (columnIndex.date === undefined) {
    errors.push({
      code: "coluna-data-ausente",
      message: "Nao encontrei a coluna de data. Procurei por: Data, Date.",
      hint: accountHint
    });
  }
  const hasMetric =
    columnIndex.accountReach !== undefined || columnIndex.followersTotal !== undefined || columnIndex.newFollowers !== undefined;
  if (!hasMetric) {
    errors.push({
      code: "metrica-conta-ausente",
      message:
        "Nao encontrei nenhuma metrica de conta. Procurei por: Alcance/Reach, Seguidores/Followers, Novos seguidores/New followers.",
      hint: accountHint
    });
  }
  if (errors.length > 0) {
    return { ok: false, headerLanguage: base.headerLanguage, days: [], errors, warnings, ignoredRowCount: 0 };
  }

  const dayMonthOrder = detectDayMonthOrder(
    base.dataRows.map((row) => row[columnIndex.date!] ?? ""),
    base.headerLanguage,
    warnings
  );

  const days: MetaDailyRow[] = [];
  let ignoredRowCount = 0;
  for (const row of base.dataRows) {
    const date = parseMetaDate(row[columnIndex.date!] ?? "", dayMonthOrder);
    if (!date) {
      ignoredRowCount += 1;
      continue;
    }
    days.push({
      date,
      accountReach: parseMetaNumber(readCell(row, columnIndex.accountReach), base.headerLanguage),
      followersTotal: parseMetaNumber(readCell(row, columnIndex.followersTotal), base.headerLanguage),
      newFollowers: parseMetaNumber(readCell(row, columnIndex.newFollowers), base.headerLanguage)
    });
  }

  if (ignoredRowCount > 0) {
    warnings.push(`${ignoredRowCount} linha(s) sem data valida foram ignoradas.`);
  }

  days.sort((a, b) => a.date.localeCompare(b.date));
  return { ok: true, headerLanguage: base.headerLanguage, days, errors: [], warnings, ignoredRowCount };
}

type MetaTableBase = {
  headerLanguage: MetaHeaderLanguage;
  columnIndex: Record<string, number | undefined>;
  dataRows: string[][];
  errors: RealWeekImportError[];
  warnings: string[];
};

function parseMetaTable(
  rawText: string,
  columns: ColumnSpec[],
  knownIgnored: ColumnSpec[],
  hint: string
): MetaTableBase {
  const text = rawText.replace(/^﻿/, "").trim();
  if (!text) {
    return {
      headerLanguage: "pt",
      columnIndex: {},
      dataRows: [],
      errors: [
        {
          code: "arquivo-vazio",
          message: "O arquivo esta vazio. Cole ou envie o CSV exportado do Meta Business Suite.",
          hint
        }
      ],
      warnings: []
    };
  }

  const delimiter = detectDelimiter(text);
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headers = splitDelimitedLine(lines[0], delimiter).map((header) => cleanText(header));
  const dataRows = lines.slice(1).map((line) => splitDelimitedLine(line, delimiter).map((cell) => cleanText(cell)));

  const columnIndex: Record<string, number | undefined> = {};
  let ptMatches = 0;
  let enMatches = 0;
  const unknownHeaders: string[] = [];

  headers.forEach((header, index) => {
    const normalized = normalizeHeaderLoose(header);
    const column = columns.find(
      (item) => item.ptAliases.some((alias) => normalized === alias) || item.enAliases.some((alias) => normalized === alias)
    );
    if (column) {
      if (columnIndex[column.key] === undefined) columnIndex[column.key] = index;
      if (column.ptAliases.some((alias) => normalized === alias)) ptMatches += 1;
      else enMatches += 1;
      return;
    }
    const ignored = knownIgnored.find(
      (item) => item.ptAliases.some((alias) => normalized === alias) || item.enAliases.some((alias) => normalized === alias)
    );
    if (ignored) {
      if (ignored.ptAliases.some((alias) => normalized === alias)) ptMatches += 1;
      else enMatches += 1;
      return;
    }
    if (header) unknownHeaders.push(header);
  });

  const recognizedCount = ptMatches + enMatches;
  if (recognizedCount === 0) {
    return {
      headerLanguage: "pt",
      columnIndex: {},
      dataRows: [],
      errors: [
        {
          code: "formato-nao-reconhecido",
          message: `Este arquivo nao parece um export do Meta Business Suite: nenhuma coluna conhecida foi encontrada. Colunas do arquivo: ${headers
            .filter(Boolean)
            .slice(0, 8)
            .join(", ")}.`,
          hint
        }
      ],
      warnings: []
    };
  }

  const warnings: string[] = [];
  if (unknownHeaders.length > 0) {
    warnings.push(`Colunas nao reconhecidas foram ignoradas: ${unknownHeaders.slice(0, 6).join(", ")}.`);
  }

  return {
    headerLanguage: enMatches > ptMatches ? "en" : "pt",
    columnIndex,
    dataRows,
    errors: [],
    warnings
  };
}

function detectDayMonthOrder(
  dateValues: string[],
  language: MetaHeaderLanguage,
  warnings: string[]
): "dm" | "md" {
  let dayFirstEvidence = 0;
  let monthFirstEvidence = 0;
  for (const value of dateValues) {
    const match = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!match) continue;
    const first = Number(match[1]);
    const second = Number(match[2]);
    if (first > 12 && second <= 12) dayFirstEvidence += 1;
    if (second > 12 && first <= 12) monthFirstEvidence += 1;
  }

  if (dayFirstEvidence > 0 && monthFirstEvidence === 0) return "dm";
  if (monthFirstEvidence > 0 && dayFirstEvidence === 0) return "md";
  if (dayFirstEvidence > 0 && monthFirstEvidence > 0) {
    warnings.push("As datas do arquivo estao inconsistentes entre dia/mes e mes/dia. Foi usada a convencao com mais ocorrencias.");
    return dayFirstEvidence >= monthFirstEvidence ? "dm" : "md";
  }

  const hasSlashDates = dateValues.some((value) => /\d{1,2}\/\d{1,2}\/\d{4}/.test(value));
  if (hasSlashDates) {
    warnings.push(
      language === "pt"
        ? "Nao deu para confirmar se as datas sao dia/mes ou mes/dia. Assumi dia/mes, o padrao dos exports em portugues."
        : "Nao deu para confirmar se as datas sao dia/mes ou mes/dia. Assumi mes/dia, o padrao dos exports em ingles."
    );
  }
  return language === "pt" ? "dm" : "md";
}

export function parseMetaDate(value: string, dayMonthOrder: "dm" | "md"): string | null {
  const text = cleanText(value);
  if (!text) return null;

  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return buildIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const slash = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slash) {
    const first = Number(slash[1]);
    const second = Number(slash[2]);
    const year = Number(slash[3]);
    const [day, month] = dayMonthOrder === "dm" ? [first, second] : [second, first];
    return buildIsoDate(year, month, day);
  }

  return null;
}

function buildIsoDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseMetaNumber(value: string | undefined, language: MetaHeaderLanguage): number | null {
  const text = cleanText(value);
  if (!text || text === "-" || text === "—") return null;
  if (language === "en" && /^-?\d{1,3}(,\d{3})+$/.test(text)) {
    return Number(text.replace(/,/g, ""));
  }
  const parsed = parseNumber(text);
  return parsed === undefined ? null : parsed;
}

export function normalizePostType(value: string | undefined): string {
  const text = normalizeHeaderLoose(value ?? "");
  if (!text) return "outro";
  if (text.includes("reel")) return "reel";
  if (text.includes("carross") || text.includes("carousel")) return "carrossel";
  if (text.includes("imagem") || text.includes("image") || text.includes("foto") || text.includes("photo")) return "imagem";
  if (text.includes("video")) return "video";
  if (text.includes("story") || text.includes("stories")) return "story";
  return text;
}

function readCell(row: string[], index: number | undefined): string | undefined {
  if (index === undefined) return undefined;
  return row[index];
}

function normalizeHeaderLoose(header: string): string {
  return normalizeHeader(header)
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function spec(key: string, label: string, ptAliases: string[], enAliases: string[]): ColumnSpec {
  return { key, label, searchedFor: "", ptAliases, enAliases };
}
