import type { WeeklyGroupSummary, WeeklyLearning, WeeklyMetricSummary, WeeklyRecommendation } from "@/lib/weekly-review/types";

export function generateWeeklyLearnings(args: {
  summary: WeeklyMetricSummary;
  formatSummaries: WeeklyGroupSummary[];
  pillarSummaries: WeeklyGroupSummary[];
  themeSummaries: WeeklyGroupSummary[];
}): WeeklyLearning[] {
  const topTheme = args.themeSummaries[0];
  const weakTheme = [...args.themeSummaries].reverse()[0];
  const topPillar = args.pillarSummaries[0];
  const topFormat = args.formatSummaries[0];
  const learnings: WeeklyLearning[] = [];

  if (topTheme) {
    learnings.push({
      type: "repetir",
      title: `Repetir ${topTheme.label} com variacao`,
      rationale: `Tema liderou o score semanal (${topTheme.score}/100), principalmente por salvamentos, compartilhamentos ou conversa.`,
      relatedTheme: topTheme.key,
      confidence: topTheme.records >= 2 ? "moderado" : "baixo"
    });
  }
  if (topPillar) {
    learnings.push({
      type: "gravar",
      title: `Gravar novos cortes sobre ${topPillar.label}`,
      rationale: `Pilar com melhor combinacao de alcance e utilidade editorial.`,
      relatedTheme: topPillar.key,
      confidence: topPillar.records >= 3 ? "alto" : "moderado"
    });
  }
  if (topFormat) {
    learnings.push({
      type: "transformar",
      title: `Transformar formato ${topFormat.label} em serie`,
      rationale: `Formato ficou acima dos demais no score consolidado.`,
      confidence: topFormat.records >= 3 ? "alto" : "moderado"
    });
  }
  if (weakTheme && weakTheme.score < 55) {
    learnings.push({
      type: "pausar",
      title: `Pausar ou simplificar ${weakTheme.label}`,
      rationale: `Tema teve baixo retorno relativo ou esforco alto para pouco sinal.`,
      relatedTheme: weakTheme.key,
      confidence: weakTheme.records >= 2 ? "moderado" : "baixo"
    });
  }
  if (args.summary.saveShareRate > 0.01) {
    learnings.push({
      type: "testar",
      title: "Testar carrossel educativo com o tema vencedor",
      rationale: "Salvamentos e compartilhamentos justificam uma variacao mais didatica.",
      confidence: "moderado"
    });
  }

  return learnings;
}

export function generateWeeklyRecommendations(learnings: WeeklyLearning[]): WeeklyRecommendation[] {
  return learnings.map((learning, index) => ({
    ...learning,
    priority: index < 2 ? "alta" : index < 4 ? "media" : "baixa",
    action: actionForLearning(learning),
    exportText: [
      `Acao: ${actionForLearning(learning)}`,
      `Tipo: ${learning.type}`,
      `Justificativa: ${learning.rationale}`,
      "Uso: revisar internamente antes de publicar manualmente."
    ].join("\n")
  }));
}

function actionForLearning(learning: WeeklyLearning): string {
  if (learning.type === "repetir") return "criar nova versao com hook mais simples e CTA educativo";
  if (learning.type === "gravar") return "reservar bloco de gravacao curta para o tema";
  if (learning.type === "pausar") return "pausar por uma semana e revisar linguagem ou formato";
  if (learning.type === "transformar") return "converter em stories, reel curto e carrossel";
  if (learning.type === "testar") return "rodar experimento seguro A/B manual";
  if (learning.type === "revisar") return "revisar risco medico-publicitario antes de usar";
  return "variar o conteudo mantendo a mensagem central";
}
