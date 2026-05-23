import type { ExperimentPlan, LearningLoopReport, ManualMetricFormat } from "@/lib/marketing-intelligence/types";

const safetyChecklist = [
  "Sem promessa de resultado",
  "Sem antes/depois",
  "Sem paciente ou localizacao",
  "Sem diagnostico ou prescricao",
  "Sem urgencia artificial",
  "Publicacao sempre manual apos revisao humana"
];

function exportExperiment(plan: Omit<ExperimentPlan, "exportText">) {
  return [
    `# Experimento editorial - ${plan.title}`,
    `Hipotese: ${plan.hypothesis}`,
    `Metrica primaria: ${plan.primaryMetric}`,
    `Metrica secundaria: ${plan.secondaryMetric}`,
    `Duracao: ${plan.suggestedDuration}`,
    `Criterio de sucesso: ${plan.successCriteria}`,
    `Risco: ${plan.risk}`,
    "",
    "Variantes:",
    ...plan.variants.map((variant) => `- ${variant.label}: ${variant.description} (${variant.format})`),
    "",
    "Checklist:",
    ...plan.safetyChecklist.map((item) => `- ${item}`),
    "",
    `Recomendacao: ${plan.recommendation}`
  ].join("\n");
}

function makePlan(input: Omit<ExperimentPlan, "exportText">): ExperimentPlan {
  return { ...input, exportText: exportExperiment(input) };
}

export function generateExperimentPlans(report: LearningLoopReport): ExperimentPlan[] {
  const first = report.topicInsights[0];
  const second = report.topicInsights[1] ?? first;
  const strongFormat = report.formatInsights[0]?.format ?? "reel";
  const safeMetric = "salvamentos + compartilhamentos ponderados";

  return [
    makePlan({
      id: "exp-tema-a-b",
      title: "Tema A vs tema B",
      hypothesis: `Comparar ${first.theme} com ${second.theme} para entender qual gera mais aprendizado editorial sem apelo comercial.`,
      variants: [
        { id: "a", label: first.theme, description: "Abordagem educativa curta com foco em clareza.", format: strongFormat as ManualMetricFormat, safetyNotes: safetyChecklist },
        { id: "b", label: second.theme, description: "Abordagem reflexiva, sem promessa e sem caso real.", format: strongFormat as ManualMetricFormat, safetyNotes: safetyChecklist }
      ],
      primaryMetric: safeMetric,
      secondaryMetric: "respostas agregadas e visitas ao perfil",
      suggestedDuration: "7 dias",
      successCriteria: "Vence a variante com maior score de salvamento/compartilhamento sem aumento de risco editorial.",
      risk: "baixo",
      safetyChecklist,
      recommendation: "Executar como teste manual e comparar apenas metricas agregadas."
    }),
    makePlan({
      id: "exp-hook-a-b",
      title: "Hook simples vs hook reflexivo",
      hypothesis: "Um hook mais simples pode aumentar compreensao sem parecer campanha.",
      variants: [
        { id: "hook-a", label: "Antes de decidir, vale entender uma coisa simples.", description: "Hook educativo direto.", format: "reel", safetyNotes: safetyChecklist },
        { id: "hook-b", label: "Cirurgia plastica nao combina com pressa.", description: "Hook reflexivo e anti-marketing.", format: "reel", safetyNotes: safetyChecklist }
      ],
      primaryMetric: "retencao estimada + salvamentos",
      secondaryMetric: "compartilhamentos",
      suggestedDuration: "2 publicacoes em 10 dias",
      successCriteria: "Manter o hook com melhor retencao e sem CTA agressivo.",
      risk: "baixo",
      safetyChecklist,
      recommendation: "Usar no Content Studio e gravar em lote."
    }),
    makePlan({
      id: "exp-formato-story-reel",
      title: "Story vs reel",
      hypothesis: "O mesmo tema pode funcionar como presenca diaria em story e como ensino curto em reel.",
      variants: [
        { id: "story", label: "Story espontaneo", description: "Sequencia curta com cara de sticker nativo.", format: "story", safetyNotes: safetyChecklist },
        { id: "reel", label: "Reel educativo", description: "Fala curta e natural, sem viral apelativo.", format: "reel", safetyNotes: safetyChecklist }
      ],
      primaryMetric: "respostas agregadas",
      secondaryMetric: "salvamentos e compartilhamentos",
      suggestedDuration: "1 semana",
      successCriteria: "Escolher o formato que combina resposta segura e menor esforco.",
      risk: "baixo",
      safetyChecklist,
      recommendation: "Nao transformar resposta em conversao medica automatica."
    }),
    makePlan({
      id: "exp-carrossel-post",
      title: "Carrossel educativo vs post estatico",
      hypothesis: "Temas de seguranca podem gerar mais salvamentos quando explicados em cards curtos.",
      variants: [
        { id: "carousel", label: "Carrossel educativo", description: "5 a 7 cards curtos.", format: "carrossel", safetyNotes: safetyChecklist },
        { id: "post", label: "Post estatico", description: "Uma frase clara e legenda curta.", format: "post", safetyNotes: safetyChecklist }
      ],
      primaryMetric: "salvamentos",
      secondaryMetric: "compartilhamentos",
      suggestedDuration: "14 dias",
      successCriteria: "Manter formato que gere mais utilidade pratica com risco baixo.",
      risk: "baixo",
      safetyChecklist,
      recommendation: "Usar para temas de seguranca, expectativa e cicatrizacao."
    }),
    makePlan({
      id: "exp-tom-reflexivo-tecnico",
      title: "Tom reflexivo vs tecnico simples",
      hypothesis: "Tom reflexivo pode gerar conexao; tecnico simples pode gerar salvamento.",
      variants: [
        { id: "reflexivo", label: "Reflexivo", description: "Mensagem humana e cautelosa.", format: "reflexao", safetyNotes: safetyChecklist },
        { id: "tecnico", label: "Tecnico simples", description: "Explicacao curta com linguagem acessivel.", format: "carrossel", safetyNotes: safetyChecklist }
      ],
      primaryMetric: "salvamentos + respostas",
      secondaryMetric: "compartilhamentos",
      suggestedDuration: "2 semanas",
      successCriteria: "Manter ambos se cumprirem papeis diferentes sem risco.",
      risk: "baixo",
      safetyChecklist,
      recommendation: "Nao usar linguagem de pressao, urgencia ou promessa."
    }),
    makePlan({
      id: "exp-inicio-fim-semana",
      title: "Inicio de semana vs fim de semana",
      hypothesis: "Inicio de semana favorece decisao consciente; fim de semana favorece reflexao leve.",
      variants: [
        { id: "segunda", label: "Inicio de semana", description: "Organizacao e decisao consciente.", format: "story", safetyNotes: safetyChecklist },
        { id: "domingo", label: "Fim de semana", description: "Reflexao leve sem dizer que algo acontece agora.", format: "story", safetyNotes: safetyChecklist }
      ],
      primaryMetric: "respostas agregadas",
      secondaryMetric: "salvamentos",
      suggestedDuration: "2 fins de semana",
      successCriteria: "Escolher o tom que gera conversa segura e natural.",
      risk: "baixo",
      safetyChecklist,
      recommendation: "Manter linguagem neutra e editavel."
    }),
    makePlan({
      id: "exp-curto-explicativo",
      title: "Conteudo curto vs levemente explicativo",
      hypothesis: "A concisao pode melhorar consumo, mas temas complexos podem precisar de uma explicacao a mais.",
      variants: [
        { id: "curto", label: "Curto", description: "Uma ideia por vez.", format: "post", safetyNotes: safetyChecklist },
        { id: "explicativo", label: "Levemente explicativo", description: "3 pontos simples sem prescrever conduta.", format: "carrossel", safetyNotes: safetyChecklist }
      ],
      primaryMetric: "salvamentos",
      secondaryMetric: "tempo de retencao estimado",
      suggestedDuration: "14 dias",
      successCriteria: "Preferir a versao que melhora utilidade sem parecer aula longa ou campanha.",
      risk: "baixo",
      safetyChecklist,
      recommendation: "Usar em temas de cicatrizacao, seguranca e expectativa realista."
    })
  ];
}
