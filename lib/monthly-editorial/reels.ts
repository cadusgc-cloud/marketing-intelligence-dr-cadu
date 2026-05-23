import type { EditorialPillar, ReelPlan } from "@/lib/monthly-editorial/types";
import { runMonthlySafetyGate } from "@/lib/monthly-editorial/safety";

const safeHooks = [
  "Uma coisa que muita gente esquece antes de pensar em cirurgia plastica...",
  "Nem sempre o que chama atencao e o que mais importa.",
  "Antes de decidir, vale entender uma coisa simples.",
  "Cirurgia plastica nao combina com pressa.",
  "Naturalidade tambem e planejamento.",
  "Expectativa bem alinhada evita muita frustracao."
];

export function buildReelPlan(date: string, dayNumber: number, theme: string, pillar: EditorialPillar): ReelPlan {
  const hook = safeHooks[(dayNumber - 1) % safeHooks.length];
  const title = `Reel curto - ${theme}`;
  const shortScript = [
    hook,
    `Quando o tema e ${theme}, a conversa precisa ser clara e sem promessa.`,
    `O ponto principal e entender limites, riscos e contexto antes de transformar referencia em decisao.`,
    "Conteudo educativo ajuda, mas nao substitui avaliacao individual."
  ];
  const spoken = shortScript.join(" ");
  const onScreenText = [
    "antes de decidir, entenda o contexto",
    "referencia nao e promessa",
    "conversa clara ajuda mais"
  ];
  const exportText = [
    `Reel - ${date}`,
    `Titulo interno: ${title}`,
    `Gancho: ${hook}`,
    "Roteiro curto:",
    ...shortScript.map((line) => `- ${line}`),
    `Texto falado sugerido: ${spoken}`,
    `Texto na tela: ${onScreenText.join(" | ")}`,
    "Cena sugerida: video curto falando para camera, fundo neutro, sem local identificavel.",
    "Duracao estimada: 45 segundos",
    "Observacao de seguranca: nao usar promessa, comparacao visual indevida, caso real ou conduta individual."
  ].join("\n");
  const safetyGate = runMonthlySafetyGate(exportText, "reel");

  return {
    id: `reel-${date}-${dayNumber}`,
    title,
    openingHook: hook,
    shortScript,
    suggestedSpokenText: spoken,
    onScreenText,
    sceneSuggestion: "Video curto falando para camera, fundo neutro, corte simples e legenda nativa.",
    estimatedDurationSeconds: 45,
    safetyNote: "Revisar para manter tom educativo e sem promessa de resultado.",
    editorialRisk: safetyGate.classification,
    exportText
  };
}
