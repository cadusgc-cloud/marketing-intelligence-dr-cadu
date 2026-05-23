import {
  SAFE_STORY_PHRASES,
  STORYOPS_INITIAL_THEMES,
  STORYOPS_MEDIA_SUGGESTIONS,
  STORYOPS_RISK_PHRASES,
  STORY_EDITORIAL_LINES
} from "@/lib/storyops/data";
import type {
  StoryEditorialLine,
  StoryExportFormat,
  StoryItem,
  StoryMediaCategory,
  StoryOpsInput,
  StoryRiskLevel,
  StorySafetyCategory,
  StorySafetyCheck,
  StorySequence,
  StoryTheme
} from "@/lib/storyops/types";

export * from "@/lib/storyops/types";
export { SAFE_STORY_PHRASES, STORYOPS_INITIAL_THEMES, STORYOPS_MEDIA_SUGGESTIONS, STORYOPS_RISK_PHRASES, STORY_EDITORIAL_LINES };

const maxStoryTextLength = 92;

const linePhraseBuckets: Record<StoryEditorialLine, keyof typeof SAFE_STORY_PHRASES> = {
  bastidor_leve: "bastidor_neutro",
  educacao_medica_simples: "educativo",
  estetica_natural: "estetica_natural",
  expectativa_realista: "expectativa_realista",
  rotina_profissional_neutra: "bastidor_neutro",
  reflexao_fim_de_dia: "reflexivo",
  ciencia_e_estudo: "cientifico_simples",
  plastica_em_evidencia: "anti_marketing_elegante",
  clareza_tecnica_medica: "cientifico_simples"
};

const lineMediaFlow: Record<StoryEditorialLine, StoryMediaCategory[]> = {
  bastidor_leve: ["mesa_agenda_cafe", "bastidor_nao_identificavel", "fundo_simples", "video_curto_falando", "selfie_neutra", "ceu_fim_de_dia"],
  educacao_medica_simples: ["video_curto_falando", "livro_artigo", "fundo_simples", "selfie_neutra", "mesa_agenda_cafe", "arte_simples_inevitavel"],
  estetica_natural: ["fundo_simples", "video_curto_falando", "mesa_agenda_cafe", "livro_artigo", "selfie_neutra", "ceu_fim_de_dia"],
  expectativa_realista: ["selfie_neutra", "fundo_simples", "mesa_agenda_cafe", "video_curto_falando", "print_post_antigo", "ceu_fim_de_dia"],
  rotina_profissional_neutra: ["mesa_agenda_cafe", "livro_artigo", "bastidor_nao_identificavel", "fundo_simples", "video_curto_falando", "ceu_fim_de_dia"],
  reflexao_fim_de_dia: ["ceu_fim_de_dia", "mesa_agenda_cafe", "fundo_simples", "selfie_neutra", "video_curto_falando", "bastidor_nao_identificavel"],
  ciencia_e_estudo: ["livro_artigo", "mesa_agenda_cafe", "video_curto_falando", "fundo_simples", "selfie_neutra", "arte_simples_inevitavel"],
  plastica_em_evidencia: ["video_curto_falando", "print_post_antigo", "fundo_simples", "livro_artigo", "selfie_neutra", "arte_simples_inevitavel"],
  clareza_tecnica_medica: ["livro_artigo", "mesa_agenda_cafe", "fundo_simples", "video_curto_falando", "selfie_neutra", "arte_simples_inevitavel"]
};

const storyRoles = [
  "presenca",
  "gancho",
  "explicacao",
  "reflexao",
  "interacao",
  "fechamento"
] as const;

const defaultInput: StoryOpsInput = {
  date: "2026-05-23",
  theme: "expectativa realista em cirurgia plastica",
  editorialLine: "expectativa_realista",
  neutralContext: ""
};

export function buildStoryOpsSequence(input: Partial<StoryOpsInput> = {}): StorySequence {
  const normalizedInput = normalizeStoryOpsInput(input);
  const selectedTheme = findStoryTheme(normalizedInput.theme);
  const dayName = getDayName(normalizedInput.date);
  const items = buildStoryItems(normalizedInput, selectedTheme, dayName);
  const safetyChecks = buildStorySafetyChecks(normalizedInput, items, dayName);
  const safetyStatus = getStoryOpsSafetyStatus(safetyChecks);
  const safetyScore = calculateStoryOpsSafetyScore(safetyChecks);
  const sequence: Omit<StorySequence, "exportText"> = {
    id: `storyops-${normalizedInput.date}-${slugify(normalizedInput.theme || "tema")}`,
    date: normalizedInput.date,
    dayName,
    theme: normalizedInput.theme.trim() || "tema a definir",
    editorialLine: normalizedInput.editorialLine,
    editorialLineLabel: storyEditorialLineLabel(normalizedInput.editorialLine),
    neutralContext: normalizedInput.neutralContext?.trim() ?? "",
    dayGuidance: buildDayGuidance(dayName),
    items,
    safetyChecks,
    safetyStatus,
    safetyScore,
    createdAt: new Date("2026-05-23T12:00:00.000Z")
  };

  return {
    ...sequence,
    exportText: exportStorySequence(sequence)
  };
}

export function normalizeStoryOpsInput(input: Partial<StoryOpsInput>): StoryOpsInput {
  const editorialLine = isStoryEditorialLine(input.editorialLine) ? input.editorialLine : defaultInput.editorialLine;
  return {
    date: normalizeDate(input.date || defaultInput.date),
    theme: input.theme ?? defaultInput.theme,
    editorialLine,
    neutralContext: input.neutralContext ?? ""
  };
}

export function findStoryTheme(labelOrId: string): StoryTheme | null {
  const normalized = normalizeText(labelOrId);
  if (!normalized) return null;
  return (
    STORYOPS_INITIAL_THEMES.find((theme) => theme.id === normalized || normalizeText(theme.label) === normalized) ??
    STORYOPS_INITIAL_THEMES.find((theme) => theme.keywords.some((keyword) => normalized.includes(normalizeText(keyword)))) ??
    null
  );
}

export function buildStoryItems(input: StoryOpsInput, theme: StoryTheme | null = findStoryTheme(input.theme), dayName = getDayName(input.date)): StoryItem[] {
  const line = input.editorialLine;
  const bucket = linePhraseBuckets[line];
  const phraseSet = SAFE_STORY_PHRASES[bucket];
  const mediaFlow = lineMediaFlow[line];
  const themeLabel = normalizeDisplayTheme(input.theme, theme);
  const sunday = isSunday(input.date);

  return storyRoles.map((role, index) => {
    const order = index + 1;
    const textOnScreen = buildStoryText(role, themeLabel, phraseSet[index % phraseSet.length], line, sunday);
    const mediaSuggestion = STORYOPS_MEDIA_SUGGESTIONS[mediaFlow[index]];
    const editorialRisk = calculateItemRisk(textOnScreen, input);

    return {
      order,
      mediaSuggestion,
      textOnScreen,
      safetyNote: buildSafetyNote(role, mediaSuggestion.category),
      tone: buildTone(role, line, dayName),
      editorialRisk,
      recommendationReason: buildRecommendationReason(role, line),
      editableNote: "Editavel manualmente antes de publicar; manter frase curta e contexto neutro."
    };
  });
}

export function buildStorySafetyChecks(input: StoryOpsInput, items: StoryItem[] = buildStoryItems(input), dayName = getDayName(input.date)): StorySafetyCheck[] {
  const text = [input.theme, input.neutralContext, ...items.map((item) => item.textOnScreen)].join(" ");
  const normalized = normalizeText(text);
  const checks: StorySafetyCheck[] = [];

  if (!input.theme.trim()) {
    checks.push(check("theme-empty", "theme", "Tema vazio", "block", "Definir um tema antes de exportar os stories."));
  }

  addIfMatch(checks, normalized, ["resultado garantido", "transformacao completa", "corpo perfeito", "sem risco", "sem cicatriz", "recuperacao rapida garantida"], "promise", "Promessa medica", "block", "Remover promessa, absolutismo ou garantia de resultado.");
  addIfMatch(checks, normalized, ["diagnostico", "prescrev", "eu indico para voce", "voce precisa fazer", "tratamento ideal para voce"], "diagnosis_prescription", "Diagnostico ou prescricao", "block", "Nao sugerir conduta individual, diagnostico ou prescricao.");
  addIfMatch(checks, normalized, ["antes e depois", "antes/depois"], "before_after", "Antes/depois", "block", "Nao usar antes/depois como promessa ou prova visual.");
  addIfMatch(checks, normalized, ["agende agora", "ultimas vagas", "compre agora", "transforme seu corpo"], "aggressive_cta", "CTA agressivo", "review", "Trocar por convite leve e educativo.");
  addIfMatch(checks, normalized, ["melhor tecnica", "definitivo", "nunca", "sempre"], "commercial_language", "Linguagem absoluta", "attention", "Evitar absolutismos e linguagem publicitaria.");
  addIfMatch(checks, normalized, ["paciente de hoje", "caso de hoje", "paciente real", "nome da paciente"], "patient_privacy", "Paciente ou caso real", "block", "Remover qualquer caso real, nome ou material identificavel.");
  addIfMatch(checks, normalized, ["cirurgia de hoje", "no hospital agora", "aqui na clinica agora", "consultorio agora"], "specific_backstage", "Bastidor especifico", "block", "Nao afirmar bastidor especifico sem informacao e revisao humana.");
  addIfMatch(checks, normalized, ["hospital", "clinica", "endereco", "localizacao", "prontuario", "agenda"], "location_privacy", "Privacidade de local/dados", "review", "Conferir se a imagem/texto nao revela local, agenda, tela ou documento.");

  if ((input.editorialLine === "bastidor_leve" || input.editorialLine === "rotina_profissional_neutra") && !(input.neutralContext ?? "").trim()) {
    checks.push(check("neutral-context-missing", "specific_backstage", "Contexto neutro nao informado", "attention", "Usar frases editaveis como 'dia de organizar ideias', sem dizer que algo esta acontecendo agora."));
  }

  const longItems = items.filter((item) => item.textOnScreen.length > maxStoryTextLength || countSentences(item.textOnScreen) > 1);
  if (longItems.length > 0) {
    checks.push(check("story-text-long", "language_length", "Texto longo demais", "review", "Cada story deve ter uma frase principal curta e com cara de sticker nativo."));
  }

  if (dayName === "Domingo") {
    checks.push(check("sunday-light-line", "medical_governance", "Domingo pede tom leve", "low", "Priorizar reflexao, organizacao da semana e presenca neutra, sem afirmar agenda real."));
  }

  checks.push(check("manual-only", "medical_governance", "Publicacao manual", "low", "Modulo interno: nao publica, nao chama APIs externas e exige revisao humana."));

  return uniqueChecks(checks);
}

export function exportStorySequence(sequence: Pick<StorySequence, "items">, format: StoryExportFormat = "plain_text"): string {
  const blocks = sequence.items.map((item) => {
    const lines = [
      `Story ${item.order}:`,
      `- foto/vídeo sugerido: ${item.mediaSuggestion.label} - ${item.mediaSuggestion.description}`,
      `- texto curto na tela: ${item.textOnScreen}`,
      `- observação de segurança: ${item.safetyNote}`
    ];
    return lines.join("\n");
  });

  if (format === "markdown") return blocks.join("\n\n");
  return blocks.join("\n\n");
}

export function getStoryOpsSafetyStatus(checks: StorySafetyCheck[]): StoryRiskLevel {
  if (checks.some((item) => item.status === "block")) return "block";
  if (checks.some((item) => item.status === "review")) return "review";
  if (checks.some((item) => item.status === "attention")) return "attention";
  return "low";
}

export function calculateStoryOpsSafetyScore(checks: StorySafetyCheck[]): number {
  const penalty = checks.reduce((total, item) => {
    if (item.status === "block") return total + 35;
    if (item.status === "review") return total + 18;
    if (item.status === "attention") return total + 8;
    return total;
  }, 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

export function storyOpsSafetyStatusLabel(status: StoryRiskLevel): string {
  return {
    low: "Seguro",
    attention: "Atencao",
    review: "Revisar antes de postar",
    block: "Bloquear"
  }[status];
}

export function storyEditorialLineLabel(line: StoryEditorialLine): string {
  return STORY_EDITORIAL_LINES.find((item) => item.id === line)?.label ?? line;
}

export function isStoryEditorialLine(value: unknown): value is StoryEditorialLine {
  return typeof value === "string" && STORY_EDITORIAL_LINES.some((item) => item.id === value);
}

export function getDayName(date: string): string {
  const parsed = parseDateAsLocal(date);
  if (!parsed) return "Dia a definir";
  return ["Domingo", "Segunda-feira", "Terca-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sabado"][parsed.getDay()];
}

export function isSunday(date: string): boolean {
  return getDayName(date) === "Domingo";
}

function buildStoryText(
  role: (typeof storyRoles)[number],
  themeLabel: string,
  phrase: string,
  line: StoryEditorialLine,
  sunday: boolean
): string {
  if (role === "presenca") return sunday ? "domingo combina com organizar ideias" : phrase;
  if (role === "gancho") return line === "plastica_em_evidencia" ? "um tema que merece calma antes de viralizar" : oneLineThemeHook(themeLabel);
  if (role === "explicacao") return explanationForTheme(themeLabel, line);
  if (role === "reflexao") return phrase;
  if (role === "interacao") return questionForTheme(themeLabel);
  return closingForLine(line);
}

function oneLineThemeHook(themeLabel: string): string {
  const normalized = normalizeText(themeLabel);
  if (normalized.includes("expectativa")) return "expectativa realista tambem e cuidado";
  if (normalized.includes("natural")) return "naturalidade precisa de criterio";
  if (normalized.includes("consulta")) return "avaliacao boa organiza melhor a decisao";
  if (normalized.includes("cicatriz")) return "cicatrizacao nao cabe em promessa";
  if (normalized.includes("recuperacao")) return "recuperacao precisa ser combinada antes";
  if (normalized.includes("seguranca")) return "seguranca vem antes da pressa";
  if (normalized.includes("pericia")) return "clareza tecnica ajuda a separar fatos de opinioes";
  return "uma coisa que vale pensar sobre " + trimToLength(themeLabel, 42);
}

function explanationForTheme(themeLabel: string, line: StoryEditorialLine): string {
  const normalized = normalizeText(themeLabel);
  if (line === "ciencia_e_estudo") return "estudo ajuda a explicar melhor sem simplificar demais";
  if (normalized.includes("mama") || normalized.includes("mastopexia")) return "mama, pele e expectativa precisam ser avaliadas juntas";
  if (normalized.includes("lipo")) return "lipo conversa com contorno, nao com promessa";
  if (normalized.includes("abdome")) return "abdome exige conversa sobre pele, musculo e recuperacao";
  if (normalized.includes("pericia")) return "a leitura tecnica precisa ser clara e revisavel";
  return "cada decisao precisa respeitar limites, riscos e contexto";
}

function questionForTheme(themeLabel: string): string {
  const normalized = normalizeText(themeLabel);
  if (normalized.includes("mama")) return "essa diferenca ja foi duvida sua?";
  if (normalized.includes("lipo")) return "voce ja ouviu isso de outro jeito?";
  if (normalized.includes("recuperacao")) return "qual parte da recuperacao gera mais duvida?";
  if (normalized.includes("seguranca")) return "qual tema de seguranca voce quer entender?";
  return "isso ja apareceu como duvida para voce?";
}

function closingForLine(line: StoryEditorialLine): string {
  if (line === "reflexao_fim_de_dia") return "amanha da para continuar essa conversa com calma";
  if (line === "bastidor_leve" || line === "rotina_profissional_neutra") return "vou guardar essa ideia para explicar melhor depois";
  if (line === "plastica_em_evidencia") return "vale olhar para esse tema sem pressa";
  return "salve essa ideia para lembrar antes de decidir";
}

function buildSafetyNote(role: (typeof storyRoles)[number], category: StoryMediaCategory): string {
  if (role === "interacao") return "Usar caixa/enquete apenas para duvidas gerais; nao pedir foto, DM clinica ou caso individual.";
  if (category === "print_post_antigo") return "Cortar nomes, comentarios, metricas privadas e qualquer identificacao de terceiros.";
  if (category === "bastidor_nao_identificavel") return "Nao mostrar placa, agenda, tela, equipe, paciente ou local reconhecivel.";
  if (category === "arte_simples_inevitavel") return "Manter com cara de sticker nativo; evitar layout de campanha.";
  return "Conferir que a imagem nao mostra local, paciente, agenda, tela ou dado sensivel.";
}

function buildTone(role: (typeof storyRoles)[number], line: StoryEditorialLine, dayName: string): string {
  const base = storyEditorialLineLabel(line).toLowerCase();
  if (role === "interacao") return `conversa curta, ${base}`;
  if (role === "fechamento") return dayName === "Domingo" ? "leve e reflexivo" : `fechamento discreto, ${base}`;
  return `natural, ${base}`;
}

function buildRecommendationReason(role: (typeof storyRoles)[number], line: StoryEditorialLine): string {
  if (role === "presenca") return "Abre a sequencia com presenca sem parecer campanha montada.";
  if (role === "interacao") return "Cria resposta simples sem pedir dado pessoal ou caso clinico.";
  if (role === "fechamento") return "Fecha com convite leve e revisavel antes da publicacao manual.";
  return `Mantem a linha ${storyEditorialLineLabel(line).toLowerCase()} com uma ideia por story.`;
}

function calculateItemRisk(textOnScreen: string, input: StoryOpsInput): StoryRiskLevel {
  const normalized = normalizeText([textOnScreen, input.theme, input.neutralContext].join(" "));
  if (["resultado garantido", "antes e depois", "sem risco", "paciente de hoje", "cirurgia de hoje", "voce precisa fazer"].some((term) => normalized.includes(term))) return "block";
  if (["agende agora", "ultimas vagas", "hospital", "clinica", "prontuario", "agenda"].some((term) => normalized.includes(term))) return "review";
  if (textOnScreen.length > maxStoryTextLength) return "attention";
  return "low";
}

function buildDayGuidance(dayName: string): string {
  if (dayName === "Domingo") return "Domingo: usar tom mais leve, reflexivo e de organizacao, sem fingir rotina acontecendo agora.";
  if (dayName === "Sabado") return "Sabado: manter leveza e presenca, sem transformar story em campanha.";
  return "Dia util: uma ideia por story, frase curta e contexto neutro.";
}

function normalizeDisplayTheme(inputTheme: string, theme: StoryTheme | null): string {
  return (inputTheme.trim() || theme?.label || "tema a definir").replace(/\s+/g, " ");
}

function addIfMatch(
  checks: StorySafetyCheck[],
  normalizedText: string,
  terms: string[],
  category: StorySafetyCategory,
  label: string,
  status: StoryRiskLevel,
  message: string
) {
  const normalizedTerms = terms.map(normalizeText);
  const found = normalizedTerms.find((term) => normalizedText.includes(term));
  if (found) checks.push(check(`${category}-${slugify(found)}`, category, label, status, message));
}

function check(id: string, category: StorySafetyCategory, label: string, status: StoryRiskLevel, message: string): StorySafetyCheck {
  return { id, category, label, status, message };
}

function uniqueChecks(checks: StorySafetyCheck[]): StorySafetyCheck[] {
  const seen = new Set<string>();
  return checks.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function normalizeDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return defaultInput.date;
}

function parseDateAsLocal(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value: string): string {
  return normalizeText(value).replace(/\s+/g, "-") || "storyops";
}

function trimToLength(value: string, maxLength: number): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trim()}`;
}

function countSentences(value: string): number {
  return value.split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;
}
