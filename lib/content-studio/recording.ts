import { CONTENT_STUDIO_THEMES, findContentStudioPillar } from "@/lib/content-studio/library";
import { evaluateMarketingContentQuality } from "@/lib/content-studio/quality";
import type { RecordingSession, RecordingShot, RecordingTopic } from "@/lib/content-studio/types";

const defaultRecordingThemes = [
  "cirurgia plastica nao combina com pressa",
  "naturalidade tambem e planejamento",
  "consulta nao e venda",
  "cicatrizacao exige paciencia",
  "o que o marketing nao mostra",
  "resultado bonito precisa fazer sentido",
  "antes de decidir entenda limites",
  "expectativa realista evita frustracao",
  "seguranca vem antes da pressa",
  "estetica natural e identidade"
];

export function generateRecordingSession(themes: string[] = defaultRecordingThemes): RecordingSession {
  const safeThemes = normalizeTopics(themes);
  const topics = safeThemes.map((theme, index) => buildRecordingTopic(theme, index + 1));
  const editorBatchBriefing = buildEditorBatchBriefing(topics);
  const session: Omit<RecordingSession, "exportText"> = {
    id: "recording-session-v5-cirurgia-sem-promessa",
    title: "Gravacao mensal - Cirurgia plastica sem promessa",
    objective: "Gravar 8 a 10 videos curtos com linguagem humana, educativa e sem promessa.",
    dateHint: "Tarde de gravacao local, sem indicar local real e sem mostrar pacientes ou documentos.",
    topics,
    beforeChecklist: [
      "Separar fundo simples e neutro.",
      "Conferir que nao aparece agenda, tela, prontuario, paciente, endereco ou placa.",
      "Gravar em blocos curtos, uma ideia por video.",
      "Evitar roupa, fala ou enquadramento que pareca campanha publicitaria.",
      "Manter falas editaveis e sem contexto em tempo real."
    ],
    afterChecklist: [
      "Revisar se nenhum take revela local ou dado sensivel.",
      "Enviar briefing ao editor apenas como texto manual.",
      "Separar cortes para Reels, TikTok e Shorts.",
      "Transformar cada video em stories e carrossel quando fizer sentido.",
      "Rodar QA antes de qualquer publicacao manual."
    ],
    editorBatchBriefing
  };
  return {
    ...session,
    exportText: buildRecordingSessionExport(session)
  };
}

export function buildRecordingTopic(theme: string, order = 1): RecordingTopic {
  const pillar = findContentStudioPillar(pillarIdForTheme(theme));
  const mainLine = `Tema ${order}: ${theme}. Falar com calma, usando uma ideia central e sem prometer resultado.`;
  const shortScript = [
    `Abrir com: "${theme}."`,
    "Explicar em linguagem simples por que esse tema merece criterio.",
    "Trazer um limite ou cuidado sem assustar.",
    "Fechar lembrando que a decisao deve ser individual e revisada em consulta."
  ].join(" ");
  const quality = evaluateMarketingContentQuality(shortScript);
  return {
    id: `recording-topic-${order}-${slug(theme)}`,
    order,
    theme,
    pillar: pillar.name,
    mainLine,
    shortScript,
    shots: buildShots(order),
    mediaChecklist: ["video curto falando para camera", "fundo simples", "capa simples para reel", "imagem neutra de apoio"],
    repurposing: ["Reel principal", "Shorts/TikTok", "3 stories espontaneos", "carrossel educativo", "legenda curta"],
    safetyNote: quality.blocked ? "Revisar antes de gravar: tema contem risco." : "Nao citar paciente, local, cirurgia do dia, antes/depois ou promessa."
  };
}

function normalizeTopics(themes: string[]): string[] {
  const base = themes.length ? themes : defaultRecordingThemes;
  const selected = base.slice(0, 10);
  while (selected.length < 8) {
    selected.push(CONTENT_STUDIO_THEMES[selected.length % CONTENT_STUDIO_THEMES.length]);
  }
  return selected.slice(0, 10);
}

function buildShots(order: number): RecordingShot[] {
  return [
    {
      id: `shot-${order}-camera`,
      label: "fala principal",
      guidance: "Video vertical curto falando para camera, sem mostrar local identificavel.",
      safetyNote: "Conferir fundo, tela, agenda e documentos antes de gravar."
    },
    {
      id: `shot-${order}-apoio`,
      label: "take de apoio",
      guidance: "Imagem neutra de mesa, livro, anotacao sem dados ou fundo simples.",
      safetyNote: "Nao mostrar prontuario, paciente, login, endereco ou placa."
    }
  ];
}

function buildEditorBatchBriefing(topics: RecordingTopic[]): string {
  return [
    "# Briefing para editor - lote V5",
    "",
    "Objetivo: transformar 8 a 10 videos curtos em Reels, Shorts, TikToks e cortes para stories, mantendo sobriedade medica.",
    "",
    ...topics.map((topic) => [
      `## ${topic.order}. ${topic.theme}`,
      `- Pilar: ${topic.pillar}`,
      `- Fala principal: ${topic.mainLine}`,
      `- Cortes: abertura curta, explicacao, limite, fechamento seguro`,
      "- Evitar: promessa, antes/depois, paciente, local, urgencia artificial"
    ].join("\n")),
    "",
    "Publicacao sempre manual. Nenhum arquivo deve ser enviado automaticamente por este sistema."
  ].join("\n");
}

function buildRecordingSessionExport(session: Omit<RecordingSession, "exportText">): string {
  return [
    `# ${session.title}`,
    "",
    session.objective,
    "",
    "## Antes de gravar",
    ...session.beforeChecklist.map((item) => `- ${item}`),
    "",
    "## Ordem de gravacao",
    ...session.topics.map((topic) => [
      `${topic.order}. ${topic.theme}`,
      `   - Fala: ${topic.mainLine}`,
      `   - Midia: ${topic.mediaChecklist.join(", ")}`,
      `   - Reaproveitar: ${topic.repurposing.join(", ")}`
    ].join("\n")),
    "",
    "## Depois de gravar",
    ...session.afterChecklist.map((item) => `- ${item}`),
    "",
    session.editorBatchBriefing
  ].join("\n");
}

function pillarIdForTheme(theme: string): string {
  const value = theme.toLowerCase();
  if (value.includes("natural")) return "estetica_natural";
  if (value.includes("consulta")) return "consulta_nao_e_venda";
  if (value.includes("seguranca")) return "seguranca";
  if (value.includes("cicatriz") || value.includes("recuperacao")) return "recuperacao_cicatrizacao";
  if (value.includes("marketing")) return "cirurgia_sem_promessa";
  return "expectativa_realista";
}

function slug(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
