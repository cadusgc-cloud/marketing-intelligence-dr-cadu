import type { AdaptiveCalendarDay, LearningLoopReport, StrategyRoadmap } from "@/lib/marketing-intelligence/types";
import { pillarLabels } from "@/lib/marketing-intelligence/normalization";

const weekdays = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function weekday(date: string) {
  const value = new Date(`${date}T12:00:00.000Z`);
  return weekdays[value.getUTCDay()];
}

export function generateAdaptiveCalendar(report: LearningLoopReport, startDate = "2026-05-31"): AdaptiveCalendarDay[] {
  const topics = report.topicInsights.slice(0, 7);
  return Array.from({ length: 7 }, (_, index) => {
    const topic = topics[index % topics.length];
    const date = addDays(startDate, index);
    const format = index === 0 || index === 6 ? "story" : index % 3 === 0 ? "reel" : index % 3 === 1 ? "carrossel" : "post";
    const day: AdaptiveCalendarDay = {
      date,
      weekday: weekday(date),
      theme: topic.theme,
      pillar: topic.pillar,
      format,
      rationale: `${pillarLabels[topic.pillar]} mostrou sinal agregado; repetir com variacao segura e revisao humana.`,
      safety: "baixo",
      exportText: [
        `Titulo: Conteudo Dr. Cadu - ${topic.theme}`,
        "",
        "Descricao:",
        `- Data: ${date} (${weekday(date)})`,
        `- Pilar: ${pillarLabels[topic.pillar]}`,
        `- Formato: ${format}`,
        "- Seguranca: sem promessa, sem paciente, sem localizacao e sem publicacao automatica",
        "- Acao: gerar pacote no Content Studio e revisar antes de postar manualmente"
      ].join("\n")
    };
    return day;
  });
}

export function generateStrategyRoadmap(report: LearningLoopReport): StrategyRoadmap {
  const topPillars = report.pillarInsights.slice(0, 3).map((pillar) => pillar.label);
  const topFormats = report.formatInsights.slice(0, 3).map((format) => format.label);
  const adaptiveCalendar = generateAdaptiveCalendar(report);
  const thirtyDays = [
    `Executar 7 dias adaptativos com foco em ${topPillars.join(", ")}.`,
    `Gerar pacotes no Content Studio para os 5 temas com maior potencial.`,
    "Manter entrada manual de metricas ao fim de cada semana.",
    "Priorizar stories diarios leves e reels educativos curtos."
  ];
  const sixtyDays = [
    `Consolidar os formatos ${topFormats.join(", ")} como rotina editorial.`,
    "Transformar temas fortes em series, sem promessa e sem urgencia artificial.",
    "Revisar pilares subutilizados com testes de baixo risco.",
    "Usar gravacao em lote para reduzir esforco de conteudos fortes."
  ];
  const ninetyDays = [
    "Construir biblioteca de autoridade com temas de seguranca, expectativa e estetica natural.",
    "Criar ciclos mensais de aprendizado: medir, interpretar, testar, ajustar.",
    "Manter separacao entre inteligencia interna e decisao humana.",
    "Preparar futuras integracoes apenas depois de validar o processo manual."
  ];
  const risks = [
    "Interpretar alcance isolado como sucesso pode distorcer prioridade.",
    "Aumentar volume sem midia natural pode deixar o conteudo artificial.",
    "Metricas manuais precisam permanecer agregadas e sem dado sensivel."
  ];
  const productionRecommendations = report.recommendations.slice(0, 5).map((action) => `${action.title}: ${action.suggestedFormat}, esforco ${action.effort}.`);
  const exportText = [
    "# Roadmap estrategico - Marketing OS v6",
    "",
    "## 30 dias",
    ...thirtyDays.map((item) => `- ${item}`),
    "",
    "## 60 dias",
    ...sixtyDays.map((item) => `- ${item}`),
    "",
    "## 90 dias",
    ...ninetyDays.map((item) => `- ${item}`),
    "",
    "## Proximos 7 dias",
    ...adaptiveCalendar.map((day) => `- ${day.date} ${day.weekday}: ${day.theme} (${day.format})`),
    "",
    "Publicacao sempre manual e revisada por pessoa."
  ].join("\n");

  return {
    summary: "Roadmap adaptativo local baseado em metricas manuais ficticias, sem API externa e sem decisao automatica.",
    thirtyDays,
    sixtyDays,
    ninetyDays,
    priorities: [...topPillars, ...topFormats],
    risks,
    productionRecommendations,
    adaptiveCalendar,
    nextBestActions: report.recommendations,
    exportText
  };
}
