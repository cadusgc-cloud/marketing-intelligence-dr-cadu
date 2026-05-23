import { DR_CADU_EDITORIAL_PROFILE, type EditorialChannel } from "@/lib/drCaduEditorialProfile";

export type ContentFunction = "autoridade" | "confianca" | "educacao" | "desejo" | "conversao" | "distribuicao";
export type ContentStatus = "planejado" | "roteirizado" | "revisar" | "pronto_para_uso_manual";
export type ContentPriority = "baixa" | "media" | "alta";
export type ContentEffort = "baixo" | "medio" | "alto";
export type MetricTrend = "up" | "down" | "flat" | "missing";

export type LocalMarketingMetric = {
  id: string;
  channel: EditorialChannel;
  period: string;
  contentTitle: string;
  format: string;
  pillar: string;
  contentFunction: ContentFunction;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  retentionRate: number | null;
  watchTimeSeconds: number | null;
  followersGained: number;
  engagementRate: number;
  internalScore: number;
  observations: string;
};

export type WeeklyMetricSnapshot = {
  reach: number;
  impressions: number;
  interactions: number;
  followersGained: number;
  profileVisits: number;
  contentPublished: number;
  storiesPublished: number;
  leads: number;
  conversionRelatedNotes: string;
};

export type MetricComparison = {
  label: string;
  current: number | null;
  previous: number | null;
  delta: number | null;
  percent: number | null;
  trend: MetricTrend;
  interpretation: string;
};

export type CommandCenterAnalysis = {
  statusBadge: string;
  executiveSummary: string;
  whatImproved: string[];
  whatWorsened: string[];
  inconclusive: string[];
  needsAttention: string[];
  coreMetrics: MetricComparison[];
  cadenceQuality: {
    status: string;
    explanation: string;
    cadenceProblem: boolean;
    qualityProblem: boolean;
  };
  signals: Array<{ type: "positive" | "warning" | "anomaly" | "insufficient_data"; title: string; detail: string }>;
  bestContent: LocalMarketingMetric[];
  lowPerformanceContent: LocalMarketingMetric[];
  bestFormats: string[];
  bestChannels: string[];
  themesWithPotential: string[];
  recommendations: string[];
  editorialMix: Array<{ functionName: ContentFunction; target: string; reason: string }>;
};

export type StoryFrame = {
  order: number;
  type: "bastidor" | "educativo" | "conexao" | "interacao" | "cta";
  text: string;
  visualSuggestion: string;
  objective: string;
  interaction?: string;
  cta?: string;
  artPrompt: string;
  reviewPrompt: string;
};

export type ContentPackage = {
  id: string;
  day: string;
  dateLabel: string;
  title: string;
  objective: string;
  primaryChannel: EditorialChannel;
  derivedChannels: EditorialChannel[];
  pillar: string;
  contentFunction: ContentFunction;
  format: string;
  status: ContentStatus;
  priority: ContentPriority;
  strategy: {
    audience: string;
    painOrInterest: string;
    safeEditorialPromise: string;
    hook: string;
    cta: string;
    effort: ContentEffort;
    recordingNotes: string;
  };
  feed: {
    caption: string;
    shortVersion: string;
    humanVersion: string;
    hashtags: string[];
    cta: string;
    visualSuggestion: string;
    artPrompt: string;
    reviewPrompt: string;
  };
  carousel: {
    title: string;
    slides: string[];
    caption: string;
    hashtags: string[];
    cta: string;
    artPrompt: string;
    designNote: string;
  };
  stories: StoryFrame[];
  shortVideo: {
    hook3s: string;
    script: string;
    naturalSpeech: string;
    onScreenText: string[];
    suggestedCuts: string[];
    caption: string;
    hashtags: string[];
    cta: string;
    scriptPrompt: string;
    coverPrompt: string;
  };
  youtubeLong: {
    idea: string;
    title: string;
    alternativeTitles: string[];
    description: string;
    blockScript: string[];
    opening: string;
    development: string[];
    closing: string;
    cta: string;
    chapters: string[];
    tags: string[];
    thumbnailSuggestion: string;
    thumbnailPrompt: string;
    expansionPrompt: string;
  };
  repurposing: string[];
  ethicalChecklist: string[];
  productionNotes: string;
};

export type WeeklyContentDay = {
  id: string;
  day: string;
  dateLabel: string;
  theme: string;
  objective: string;
  primaryContentId: string;
  contentIds: string[];
  stories: StoryFrame[];
  priority: ContentPriority;
  status: ContentStatus;
  productionNotes: string;
};

export type WeeklyContentPlan = {
  id: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  days: WeeklyContentDay[];
  packages: ContentPackage[];
  channels: EditorialChannel[];
  safetyChecklist: string[];
};

export type PromptLibraryItem = {
  id: string;
  title: string;
  category: "legenda" | "carrossel" | "stories" | "video" | "arte" | "revisao" | "calendario" | "performance";
  prompt: string;
};

const HASHTAGS = ["#DrCaduGazzinelli", "#CirurgiaPlasticaResponsavel", "#EsteticaNatural", "#SegurancaEmCirurgia", "#PlasticaEmEvidencia"];

export const LOCAL_MARKETING_DEMO_METRICS: LocalMarketingMetric[] = [
  {
    id: "metric-professor-bastidor",
    channel: "Instagram Stories",
    period: "Semana atual",
    contentTitle: "Bastidor de rotina como professor",
    format: "stories",
    pillar: "rotina como professor",
    contentFunction: "confianca",
    reach: 12600,
    impressions: 18400,
    likes: 0,
    comments: 0,
    shares: 38,
    saves: 44,
    clicks: 96,
    retentionRate: 0.64,
    watchTimeSeconds: null,
    followersGained: 42,
    engagementRate: 0.042,
    internalScore: 86,
    observations: "Bastidor educativo gerou respostas qualificadas sem depender de exposicao sensivel."
  },
  {
    id: "metric-naturalidade-reels",
    channel: "Instagram Reels",
    period: "Semana atual",
    contentTitle: "Naturalidade nao e resultado sem impacto",
    format: "reels",
    pillar: "estetica natural",
    contentFunction: "desejo",
    reach: 22100,
    impressions: 27800,
    likes: 920,
    comments: 64,
    shares: 210,
    saves: 386,
    clicks: 122,
    retentionRate: 0.57,
    watchTimeSeconds: 41,
    followersGained: 118,
    engagementRate: 0.071,
    internalScore: 92,
    observations: "Gancho de naturalidade funcionou bem e preservou tom medico responsavel."
  },
  {
    id: "metric-carrossel-seguranca",
    channel: "Instagram Carrossel",
    period: "Semana atual",
    contentTitle: "5 perguntas antes de pensar em cirurgia plastica",
    format: "carrossel",
    pillar: "seguranca em cirurgia plastica",
    contentFunction: "educacao",
    reach: 9800,
    impressions: 13100,
    likes: 410,
    comments: 22,
    shares: 88,
    saves: 520,
    clicks: 44,
    retentionRate: null,
    watchTimeSeconds: null,
    followersGained: 31,
    engagementRate: 0.106,
    internalScore: 88,
    observations: "Alto salvamento indica utilidade educativa e potencial de reaproveitamento."
  },
  {
    id: "metric-youtube-longo",
    channel: "YouTube video longo",
    period: "Semana atual",
    contentTitle: "Como pensar em cirurgia plastica com seguranca",
    format: "video longo",
    pillar: "explicacao simples de temas complexos",
    contentFunction: "autoridade",
    reach: 4300,
    impressions: 7600,
    likes: 156,
    comments: 18,
    shares: 24,
    saves: 0,
    clicks: 36,
    retentionRate: 0.39,
    watchTimeSeconds: 412,
    followersGained: 26,
    engagementRate: 0.047,
    internalScore: 74,
    observations: "Bom tema de autoridade, mas precisa cortes curtos e thumbnail mais objetiva."
  },
  {
    id: "metric-tiktok-mito",
    channel: "TikTok",
    period: "Semana atual",
    contentTitle: "Lipoaspiracao nao substitui emagrecimento",
    format: "video curto",
    pillar: "esclarecimento de mitos",
    contentFunction: "distribuicao",
    reach: 18400,
    impressions: 23900,
    likes: 510,
    comments: 41,
    shares: 132,
    saves: 171,
    clicks: 28,
    retentionRate: 0.43,
    watchTimeSeconds: 31,
    followersGained: 54,
    engagementRate: 0.047,
    internalScore: 77,
    observations: "Distribui bem, mas exige cuidado para nao simplificar demais."
  }
];

export const CURRENT_WEEK_SNAPSHOT: WeeklyMetricSnapshot = {
  reach: 67200,
  impressions: 90800,
  interactions: 3684,
  followersGained: 271,
  profileVisits: 1840,
  contentPublished: 18,
  storiesPublished: 63,
  leads: 42,
  conversionRelatedNotes: "Leads agregados registrados manualmente; sem DMs, nomes ou dados pessoais."
};

export const PREVIOUS_VALID_WEEK_SNAPSHOT: WeeklyMetricSnapshot = {
  reach: 58600,
  impressions: 80100,
  interactions: 3090,
  followersGained: 224,
  profileVisits: 1620,
  contentPublished: 20,
  storiesPublished: 71,
  leads: 39,
  conversionRelatedNotes: "Semana valida anterior; dezembro/2025 permanece excluido de benchmark."
};

export const SAFETY_CHECKLIST = [
  "nao promete resultado",
  "nao diagnostica caso individual",
  "nao prescreve conduta",
  "nao expoe paciente",
  "nao usa dado sensivel",
  "nao contem afirmacao medica excessiva",
  "nao usa medo como venda",
  "nao apresenta antes/depois indevido",
  "nao parece propaganda enganosa",
  "exige revisao humana antes de publicacao real"
];

export const CONTENT_PROMPTS: PromptLibraryItem[] = [
  prompt("gerar-legenda", "Gerar legenda", "legenda", "Escreva uma legenda para o perfil do Dr. Cadu Gazzinelli com tom humano, professoral e responsavel. Tema: [tema]. Evite promessa de resultado, sensacionalismo, antes/depois e orientacao individual. Inclua CTA leve e hashtags sobrias."),
  prompt("revisar-legenda", "Revisar legenda", "revisao", "Revise a legenda abaixo para marketing medico responsavel. Aponte riscos, remova promessa de resultado, deixe o texto mais claro e mantenha tom educativo. Texto: [colar legenda]."),
  prompt("gerar-carrossel", "Gerar carrossel", "carrossel", "Crie um carrossel de Instagram para o Dr. Cadu com 7 slides, tema [tema], linguagem simples, postura de professor e sem promessa clinica. Traga titulo, texto de cada slide, legenda e CTA leve."),
  prompt("gerar-stories", "Gerar stories", "stories", "Crie uma sequencia de 7 stories para presenca diaria do Dr. Cadu. Misture bastidor neutro, explicacao educativa, pergunta interativa e CTA leve. Nao invente local real nem use paciente."),
  prompt("roteiro-reels", "Gerar roteiro de Reels", "video", "Crie um roteiro de Reels de 45 segundos para [tema], com gancho de 3 segundos, fala natural, texto na tela, cortes sugeridos e CTA. Mantenha linguagem medica responsavel."),
  prompt("roteiro-tiktok", "Gerar roteiro de TikTok", "video", "Adapte o tema [tema] para TikTok com linguagem direta, sem exagero, sem promessa e sem medo como venda. Inclua gancho, fala natural, cortes e legenda."),
  prompt("gerar-shorts", "Gerar YouTube Shorts", "video", "Transforme o tema [tema] em Shorts de ate 60 segundos, mantendo clareza, autoridade e cautela medica. Inclua gancho, roteiro, texto na tela e CTA leve."),
  prompt("video-longo", "Gerar video longo", "video", "Monte um roteiro de video longo para YouTube sobre [tema], com abertura, blocos de desenvolvimento, exemplos educativos gerais, fechamento e CTA seguro. Nao substitua consulta."),
  prompt("thumbnail", "Gerar thumbnail", "arte", "Crie um prompt para thumbnail sobria de YouTube sobre [tema], com Dr. Cadu em contexto educativo, sem choque visual, sem antes/depois e sem promessa de resultado."),
  prompt("cortes-video-longo", "Transformar video longo em cortes", "video", "A partir do roteiro abaixo, extraia 5 cortes para Reels/TikTok/Shorts. Cada corte deve ter gancho, fala central, texto na tela e CTA leve. Roteiro: [colar roteiro]."),
  prompt("tom-humano", "Adaptar para tom mais humano", "legenda", "Reescreva o texto abaixo para ficar mais humano, claro e proximo, sem perder responsabilidade medica. Texto: [colar texto]."),
  prompt("tom-professoral", "Adaptar para tom professoral", "legenda", "Reescreva o texto abaixo com postura de professor, linguagem acessivel e sem arrogancia. Texto: [colar texto]."),
  prompt("risco-etico", "Revisar riscos eticos", "revisao", "Audite o conteudo abaixo para riscos de marketing medico: promessa, diagnostico individual, prescricao, antes/depois, exposicao de paciente, medo como venda e captacao agressiva. Conteudo: [colar conteudo]."),
  prompt("promessa-indevida", "Revisar promessa medica indevida", "revisao", "Identifique qualquer frase que possa soar como promessa medica indevida e sugira uma versao segura, educativa e condicional. Texto: [colar texto]."),
  prompt("revisar-hashtags", "Revisar hashtags", "revisao", "Revise as hashtags abaixo para evitar sensacionalismo, promessa, antes/depois ou captacao agressiva. Sugira hashtags sobrias. Hashtags: [colar hashtags]."),
  prompt("calendario-semanal", "Montar calendario semanal", "calendario", "Monte um calendario semanal para Dr. Cadu com 7 dias, stories diarios, 1 conteudo principal por dia, 2 videos curtos e 1 video longo, mantendo tom educativo e seguro."),
  prompt("performance-para-plano", "Transformar desempenho em plano", "performance", "A partir dos dados agregados abaixo, gere um plano de conteudo para a proxima semana. Separe repetir, ajustar, testar e evitar. Nao use dados pessoais. Dados: [colar metricas agregadas].")
];

const packageBlueprints = [
  {
    id: "segunda-bastidor-professor",
    day: "Segunda-feira",
    dateLabel: "Dia 1",
    title: "Bastidor de professor: como transformar duvida em conteudo seguro",
    theme: "bastidores profissionais e rotina como professor",
    pillar: "rotina como professor",
    contentFunction: "confianca" as ContentFunction,
    format: "stories + feed",
    primaryChannel: "Instagram Stories" as EditorialChannel,
    derivedChannels: ["Instagram Feed", "Facebook", "Google Perfil da Empresa"] as EditorialChannel[],
    hook: "Nem toda duvida que aparece no consultorio vira resposta simples no Instagram.",
    objective: "Abrir a semana com presenca humana, criterio e tom professoral."
  },
  {
    id: "terca-seguranca-consulta",
    day: "Terca-feira",
    dateLabel: "Dia 2",
    title: "5 perguntas antes de pensar em cirurgia plastica",
    theme: "seguranca em cirurgia plastica",
    pillar: "seguranca em cirurgia plastica",
    contentFunction: "educacao" as ContentFunction,
    format: "carrossel + feed",
    primaryChannel: "Instagram Carrossel" as EditorialChannel,
    derivedChannels: ["Instagram Feed", "Facebook", "Instagram Stories"] as EditorialChannel[],
    hook: "Antes de pensar em tecnica, existe uma pergunta mais importante: isso faz sentido para voce?",
    objective: "Educar e qualificar expectativa sem substituir avaliacao."
  },
  {
    id: "quarta-naturalidade-reels",
    day: "Quarta-feira",
    dateLabel: "Dia 3",
    title: "Naturalidade nao significa ausencia de tecnica",
    theme: "estetica natural",
    pillar: "estetica natural",
    contentFunction: "desejo" as ContentFunction,
    format: "reels + shorts + TikTok",
    primaryChannel: "Instagram Reels" as EditorialChannel,
    derivedChannels: ["TikTok", "YouTube Shorts", "Instagram Stories"] as EditorialChannel[],
    hook: "Naturalidade nao e falta de resultado. E planejamento.",
    objective: "Reforcar posicionamento de naturalidade com linguagem simples."
  },
  {
    id: "quinta-mito-lipo",
    day: "Quinta-feira",
    dateLabel: "Dia 4",
    title: "Lipoaspiracao nao substitui emagrecimento",
    theme: "esclarecimento de mitos",
    pillar: "esclarecimento de mitos",
    contentFunction: "distribuicao" as ContentFunction,
    format: "TikTok + Reels + Shorts",
    primaryChannel: "TikTok" as EditorialChannel,
    derivedChannels: ["Instagram Reels", "YouTube Shorts", "Instagram Stories"] as EditorialChannel[],
    hook: "Se a promessa parece simples demais, vale pausar e entender melhor.",
    objective: "Corrigir expectativa comum sem linguagem de medo."
  },
  {
    id: "sexta-plastica-evidencia",
    day: "Sexta-feira",
    dateLabel: "Dia 5",
    title: "Plastica em Evidencia: o que uma boa indicacao precisa respeitar",
    theme: "Plastica em Evidencia e seguranca",
    pillar: "Plastica em Evidencia",
    contentFunction: "autoridade" as ContentFunction,
    format: "video longo + cortes",
    primaryChannel: "YouTube video longo" as EditorialChannel,
    derivedChannels: ["YouTube Shorts", "Instagram Reels", "TikTok", "Instagram Stories"] as EditorialChannel[],
    hook: "A melhor conversa sobre cirurgia comeca antes da escolha da tecnica.",
    objective: "Criar conteudo de autoridade reaproveitavel em cortes."
  },
  {
    id: "sabado-reflexao-humana",
    day: "Sabado",
    dateLabel: "Dia 6",
    title: "O lado humano de explicar medicina com calma",
    theme: "reflexao humana leve",
    pillar: "reflexoes humanas leves",
    contentFunction: "confianca" as ContentFunction,
    format: "stories + feed",
    primaryChannel: "Instagram Feed" as EditorialChannel,
    derivedChannels: ["Instagram Stories", "Facebook"] as EditorialChannel[],
    hook: "Clareza tambem e uma forma de cuidado.",
    objective: "Humanizar sem expor vida privada sensivel."
  },
  {
    id: "domingo-planejamento-semana",
    day: "Domingo",
    dateLabel: "Dia 7",
    title: "Planejamento da semana: estudar, revisar e comunicar melhor",
    theme: "planejamento, estudo e resumo",
    pillar: "bastidores de estudo e atualizacao",
    contentFunction: "conversao" as ContentFunction,
    format: "stories + post curto",
    primaryChannel: "Instagram Stories" as EditorialChannel,
    derivedChannels: ["Instagram Feed", "Google Perfil da Empresa"] as EditorialChannel[],
    hook: "Uma semana boa de conteudo comeca antes da camera ligar.",
    objective: "Preparar audiencia para a semana seguinte e organizar a execucao."
  }
];

export function getWeeklyContentPlan(): WeeklyContentPlan {
  const packages = packageBlueprints.map(buildContentPackage);
  const days = packages.map((pkg) => ({
    id: `day-${pkg.id}`,
    day: pkg.day,
    dateLabel: pkg.dateLabel,
    theme: packageBlueprints.find((item) => item.id === pkg.id)?.theme ?? pkg.pillar,
    objective: pkg.objective,
    primaryContentId: pkg.id,
    contentIds: [pkg.id],
    stories: pkg.stories,
    priority: pkg.priority,
    status: pkg.status,
    productionNotes: pkg.productionNotes
  }));

  return {
    id: "dr-cadu-weekly-content-plan-local",
    weekLabel: "Semana interna demo - Dr. Cadu",
    startDate: "semana local",
    endDate: "semana local",
    days,
    packages,
    channels: DR_CADU_EDITORIAL_PROFILE.priorityChannels,
    safetyChecklist: SAFETY_CHECKLIST
  };
}

export function getContentPackageById(id: string | undefined): ContentPackage | null {
  if (!id) return null;
  return getWeeklyContentPlan().packages.find((pkg) => pkg.id === id) ?? null;
}

export function analyzeLocalMarketingDemoData(
  current: WeeklyMetricSnapshot = CURRENT_WEEK_SNAPSHOT,
  previous: WeeklyMetricSnapshot = PREVIOUS_VALID_WEEK_SNAPSHOT,
  metrics: LocalMarketingMetric[] = LOCAL_MARKETING_DEMO_METRICS
): CommandCenterAnalysis {
  const comparisons = [
    compareMetric("Alcance", current.reach, previous.reach, "up"),
    compareMetric("Impressoes", current.impressions, previous.impressions, "up"),
    compareMetric("Interacoes", current.interactions, previous.interactions, "up"),
    compareMetric("Seguidores", current.followersGained, previous.followersGained, "up"),
    compareMetric("Visitas ao perfil", current.profileVisits, previous.profileVisits, "up"),
    compareMetric("Conteudo publicado", current.contentPublished, previous.contentPublished, "contextual"),
    compareMetric("Stories", current.storiesPublished, previous.storiesPublished, "contextual"),
    compareMetric("Leads agregados", current.leads, previous.leads, "up")
  ];
  const top = [...metrics].sort((a, b) => b.internalScore - a.internalScore);
  const low = [...metrics].sort((a, b) => a.internalScore - b.internalScore);
  const cadenceDown = current.contentPublished < previous.contentPublished || current.storiesPublished < previous.storiesPublished;
  const performanceUp = current.reach > previous.reach && current.interactions > previous.interactions;
  const statusBadge = performanceUp && cadenceDown ? "Semana em crescimento com cadencia menor" : performanceUp ? "Semana em crescimento" : cadenceDown ? "Queda por cadencia" : "Semana estavel";

  return {
    statusBadge,
    executiveSummary:
      "A semana demo mostra crescimento em alcance, interacoes e seguidores, mesmo com menor volume de publicacoes. A leitura sugere que qualidade criativa e temas de naturalidade/seguranca tiveram peso maior que volume bruto.",
    whatImproved: ["Alcance agregado", "Interacoes", "Seguidores ganhos", "Salvamentos em carrossel educativo"],
    whatWorsened: cadenceDown ? ["Cadencia de posts e stories ficou abaixo da semana valida anterior"] : [],
    inconclusive: ["Leads sao agregados e manuais; ainda precisam de conferencia semanal consistente"],
    needsAttention: ["Nao transformar bom desempenho em promessa de resultado", "Manter stories diarios para preservar presenca"],
    coreMetrics: comparisons,
    cadenceQuality: {
      status: cadenceDown && performanceUp ? "performance melhorou apesar de menor cadencia" : cadenceDown ? "possivel problema de cadencia" : "cadencia adequada",
      explanation: cadenceDown && performanceUp
        ? "A queda de cadencia nao derrubou resultado; repetir criativos fortes e recuperar presenca diaria."
        : "Manter comparacao semanal para separar volume de qualidade criativa.",
      cadenceProblem: cadenceDown,
      qualityProblem: !performanceUp && !cadenceDown
    },
    signals: [
      { type: "positive", title: "Naturalidade gerou tracao", detail: "Reels sobre naturalidade teve maior score interno e bom salvamento." },
      { type: "warning", title: "Stories abaixo da semana anterior", detail: "Presenca diaria precisa voltar ao alvo de 7 dias com sequencias curtas e humanas." },
      { type: "insufficient_data", title: "Conversao ainda manual", detail: "Leads agregados existem, mas devem ser auditados sem nomes, DMs ou dados pessoais." },
      { type: "anomaly", title: "Dezembro/2025 excluido", detail: "A anomalia operacional por hackeamento nao entra em medias, benchmarks ou recomendacoes." }
    ],
    bestContent: top.slice(0, 3),
    lowPerformanceContent: low.slice(0, 2),
    bestFormats: ["Reels educativo", "Carrossel professoral", "Stories de bastidor"],
    bestChannels: ["Instagram Reels", "Instagram Stories", "Instagram Carrossel"],
    themesWithPotential: ["estetica natural", "seguranca em cirurgia plastica", "rotina como professor", "Plastica em Evidencia"],
    recommendations: [
      "Repetir o eixo naturalidade + criterio tecnico em novo Reels.",
      "Transformar carrossel de seguranca em stories diarios e post de feed.",
      "Usar o video longo de sexta como fonte para Shorts, TikTok e Reels.",
      "Recuperar cadencia de stories sem inventar bastidores reais.",
      "Registrar apenas metricas agregadas na proxima coleta."
    ],
    editorialMix: [
      { functionName: "autoridade", target: "1 video longo e 1 corte professoral", reason: "Fortalece criterio medico." },
      { functionName: "confianca", target: "stories de bastidor todos os dias", reason: "Sustenta presenca real sem exposicao sensivel." },
      { functionName: "educacao", target: "2 carrosseis ou posts explicativos", reason: "Aumenta salvamentos e qualifica duvidas." },
      { functionName: "desejo", target: "1 tema de naturalidade", reason: "Conecta aspiracao estetica com sobriedade." },
      { functionName: "conversao", target: "CTAs leves e claros", reason: "Mantem proximo passo sem captacao agressiva." },
      { functionName: "distribuicao", target: "2 videos curtos multicanal", reason: "Leva mensagens educativas a novos publicos." }
    ]
  };
}

export function buildWeeklyContentMarkdown(plan: WeeklyContentPlan = getWeeklyContentPlan()): string {
  return [
    `# ${plan.weekLabel}`,
    "",
    "Uso interno local. Revisar antes de qualquer publicacao manual.",
    "",
    ...plan.days.flatMap((day) => {
      const pkg = getContentPackageById(day.primaryContentId);
      return [
        `## ${day.day} - ${pkg?.title ?? day.theme}`,
        `Objetivo: ${day.objective}`,
        `Canal principal: ${pkg?.primaryChannel ?? ""}`,
        `Derivados: ${pkg?.derivedChannels.join(", ") ?? ""}`,
        `CTA: ${pkg?.strategy.cta ?? ""}`,
        "",
        "Stories:",
        ...day.stories.map((story) => `- Story ${story.order}: ${story.text}`),
        ""
      ];
    }),
    "## Checklist etico",
    ...plan.safetyChecklist.map((item) => `- ${item}`)
  ].join("\n");
}

export function buildContentPackageMarkdown(pkg: ContentPackage): string {
  return [
    `# ${pkg.title}`,
    "",
    `Dia: ${pkg.day}`,
    `Objetivo: ${pkg.objective}`,
    `Canal principal: ${pkg.primaryChannel}`,
    `Canais derivados: ${pkg.derivedChannels.join(", ")}`,
    "",
    "## Legenda",
    pkg.feed.caption,
    "",
    "## Hashtags",
    pkg.feed.hashtags.join(" "),
    "",
    "## Roteiro curto",
    pkg.shortVideo.script,
    "",
    "## YouTube video longo",
    pkg.youtubeLong.blockScript.map((block) => `- ${block}`).join("\n"),
    "",
    "## Checklist etico",
    pkg.ethicalChecklist.map((item) => `- ${item}`).join("\n")
  ].join("\n");
}

export function buildPromptLibraryMarkdown(prompts: PromptLibraryItem[] = CONTENT_PROMPTS): string {
  return prompts.map((item) => `## ${item.title}\n\n${item.prompt}`).join("\n\n");
}

export function buildWeeklyContentJson(plan: WeeklyContentPlan = getWeeklyContentPlan()): string {
  return JSON.stringify(plan, null, 2);
}

export function buildWeeklyContentCsv(plan: WeeklyContentPlan = getWeeklyContentPlan()): string {
  const header = ["dia", "titulo", "canal_principal", "derivados", "pilar", "status", "prioridade"].join(",");
  const rows = plan.packages.map((pkg) =>
    [pkg.day, pkg.title, pkg.primaryChannel, pkg.derivedChannels.join(" | "), pkg.pillar, pkg.status, pkg.priority]
      .map((value) => `"${value.replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header, ...rows].join("\n");
}

export function validateMedicalMarketingGuardrails(text: string): string[] {
  const blocked = [/resultado garantido/i, /\bgarante\b/i, /\bcura\b/i, /\bprescreve\b/i, /transformacao garantida/i, /compre agora/i, /antes e depois/i];
  return blocked.filter((pattern) => pattern.test(text)).map((pattern) => `Termo bloqueado: ${pattern.source}`);
}

function buildContentPackage(input: (typeof packageBlueprints)[number]): ContentPackage {
  const safePromise = `Explicar ${input.theme} com clareza, sem promessa de resultado e sem substituir avaliacao individual.`;
  const hashtags = unique([...HASHTAGS, tagFromPillar(input.pillar)]);

  return {
    id: input.id,
    day: input.day,
    dateLabel: input.dateLabel,
    title: input.title,
    objective: input.objective,
    primaryChannel: input.primaryChannel,
    derivedChannels: input.derivedChannels,
    pillar: input.pillar,
    contentFunction: input.contentFunction,
    format: input.format,
    status: input.id.includes("sexta") ? "roteirizado" : "pronto_para_uso_manual",
    priority: input.id.includes("quarta") || input.id.includes("sexta") ? "alta" : "media",
    strategy: {
      audience: "Pessoas que acompanham cirurgia plastica com interesse educativo e precisam de informacao responsavel.",
      painOrInterest: "Entender limites, criterios e caminhos seguros antes de tomar decisoes.",
      safeEditorialPromise: safePromise,
      hook: input.hook,
      cta: "Salve para rever com calma e leve essa pergunta para sua avaliacao.",
      effort: input.primaryChannel === "YouTube video longo" ? "alto" : input.primaryChannel === "Instagram Stories" ? "baixo" : "medio",
      recordingNotes: "Gravar em linguagem natural, sem citar caso individual, nome, DM, foto ou dado pessoal."
    },
    feed: {
      caption: `${input.hook}\n\n${safePromise}\n\nA ideia aqui e organizar a conversa com responsabilidade: contexto, indicacao, limites e seguranca importam tanto quanto tecnica.\n\n${"Salve para rever com calma e compartilhe com quem pesquisa o tema."}`,
      shortVersion: `${input.hook} Informacao medica boa deve ajudar a pensar, nao prometer conclusoes.`,
      humanVersion: `Uma coisa que tento explicar com calma: ${input.theme} precisa de contexto. No Instagram, a gente simplifica para comunicar melhor, mas a decisao real sempre pede avaliacao.`,
      hashtags,
      cta: "Salve para rever com calma.",
      visualSuggestion: "Foto ou video vertical sobrio do Dr. Cadu em contexto educativo, sem paciente ou imagem sensivel.",
      artPrompt: `Crie uma arte sobria para Instagram sobre "${input.title}", com tom medico educativo, fundo claro, sem paciente, sem antes/depois e sem promessa de resultado.`,
      reviewPrompt: `Revise esta legenda sobre "${input.title}" para remover promessa, exagero, captacao agressiva e qualquer tom de consulta individual.`
    },
    carousel: {
      title: input.title,
      slides: [
        input.hook,
        "1. O primeiro passo e entender contexto.",
        "2. Indicacao nao e receita pronta.",
        "3. Seguranca vem antes da pressa.",
        "4. Naturalidade depende de planejamento.",
        "5. O Instagram informa, mas nao substitui avaliacao.",
        "Salve para conversar melhor na sua consulta."
      ],
      caption: `Carrossel educativo: ${safePromise}`,
      hashtags,
      cta: "Salve e leve suas duvidas para uma avaliacao.",
      artPrompt: `Monte um carrossel de 7 slides para "${input.title}" com visual limpo, medico, professoral, sem sensacionalismo e sem imagens de paciente.`,
      designNote: "Usar hierarquia clara, pouco texto por slide, contraste bom e nenhuma promessa visual."
    },
    stories: buildStoriesForPackage(input),
    shortVideo: {
      hook3s: input.hook,
      script: `Comece com: "${input.hook}". Em seguida explique que o tema precisa de contexto, cite 2 criterios gerais e feche dizendo que informacao ajuda a preparar uma conversa melhor, sem substituir avaliacao.`,
      naturalSpeech: `Hoje queria explicar um ponto simples: ${input.theme} nao deve ser tratado como receita pronta. Existem criterios, limites e expectativas que precisam ser conversados com calma.`,
      onScreenText: ["Nao e receita pronta", "Contexto importa", "Seguranca antes da pressa", "Salve para rever"],
      suggestedCuts: ["Abrir em close falando o gancho", "Cortar para quadro com 3 criterios", "Fechar com CTA leve"],
      caption: `${input.hook} Um lembrete educativo para pesquisar com mais criterio.`,
      hashtags,
      cta: "Salve para rever antes de tomar decisoes.",
      scriptPrompt: `Dinamize este roteiro em 45 segundos, mantendo tom medico responsavel e sem promessa: ${input.hook}`,
      coverPrompt: `Crie capa vertical sobria para video curto com o tema "${input.title}", texto curto, sem paciente e sem promessa.`
    },
    youtubeLong: {
      idea: `Aprofundar ${input.theme} em formato de aula curta para YouTube.`,
      title: `${input.title} | explicacao responsavel com Dr. Cadu`,
      alternativeTitles: [
        `Como pensar em ${input.theme} com seguranca`,
        `${input.title}: o que observar antes de decidir`,
        `Guia educativo sobre ${input.theme}`
      ],
      description: `Video educativo para organizar duvidas sobre ${input.theme}. Nao substitui avaliacao individual e nao usa casos reais.`,
      blockScript: [
        "Abertura: apresentar o tema e dizer por que ele merece calma.",
        "Bloco 1: explicar o erro comum de simplificar demais.",
        "Bloco 2: listar criterios gerais de seguranca e planejamento.",
        "Bloco 3: mostrar como transformar duvida em boa conversa de consulta.",
        "Fechamento: reforcar revisao humana, contexto e CTA leve."
      ],
      opening: `Hoje vamos falar sobre ${input.theme} sem promessa facil e sem atalhos.`,
      development: [
        "Explique o conceito principal com exemplo geral, nao individual.",
        "Mostre onde a internet costuma simplificar demais.",
        "Organize perguntas que a pessoa pode levar para avaliacao."
      ],
      closing: "Informacao boa nao decide pelo paciente; ela ajuda a chegar melhor preparado para uma conversa segura.",
      cta: "Se o tema ajudou, salve, compartilhe e acompanhe os proximos conteudos educativos.",
      chapters: ["00:00 Introducao", "01:00 Erro comum", "03:00 Criterios gerais", "06:00 Perguntas para avaliacao", "08:00 Fechamento"],
      tags: ["cirurgia plastica", "Dr Cadu", "seguranca", "estetica natural", input.pillar],
      thumbnailSuggestion: "Imagem sobria do Dr. Cadu, texto curto e fundo claro.",
      thumbnailPrompt: `Crie uma thumbnail sobria para YouTube sobre "${input.title}", sem paciente, sem choque visual, sem antes/depois e sem promessa.`,
      expansionPrompt: `Expanda este roteiro sobre "${input.title}" em 8 minutos com tom professoral, educativo e responsavel.`
    },
    repurposing: [
      "Transformar a abertura do video longo em 1 Shorts.",
      "Transformar cada criterio em um story educativo.",
      "Transformar o carrossel em roteiro de Reels.",
      "Usar os comentarios recorrentes como pauta futura, sem expor pessoas.",
      "Gerar um post curto para Google Perfil da Empresa quando fizer sentido."
    ],
    ethicalChecklist: SAFETY_CHECKLIST,
    productionNotes: "Executar manualmente, revisar copy e registrar metricas agregadas depois."
  };
}

function buildStoriesForPackage(input: (typeof packageBlueprints)[number]): StoryFrame[] {
  const base = [
    ["bastidor", `Bom dia. Hoje a pauta interna e ${input.theme}, com foco em explicar sem simplificar demais.`, "Bastidor neutro de estudo ou mesa de trabalho"],
    ["educativo", input.hook, "Texto em tela com fundo limpo"],
    ["educativo", "Uma coisa importante: contexto muda a orientacao geral.", "Dr. Cadu falando para camera"],
    ["interacao", "Qual parte desse tema gera mais duvida para voce?", "Caixa de perguntas"],
    ["conexao", "Nem tudo que parece simples no Instagram e simples na medicina.", "Video curto em ambiente neutro"],
    ["educativo", "O objetivo do conteudo e ajudar a organizar perguntas, nao decidir por ninguem.", "Card com tres bullets"],
    ["cta", "Salve este tema para rever com calma.", "Tela final simples"]
  ] as const;

  return base.map((item, index) => ({
    order: index + 1,
    type: item[0],
    text: item[1],
    visualSuggestion: item[2],
    objective: index === 0 ? "abrir presenca do dia" : index === base.length - 1 ? "fechar com acao leve" : "educar e conectar",
    interaction: item[0] === "interacao" ? "caixa de pergunta ou enquete leve" : undefined,
    cta: item[0] === "cta" ? "Salvar e acompanhar proximos stories" : undefined,
    artPrompt: `Crie fundo de story sobrio para "${input.title}", sem paciente, sem local real inventado e sem promessa.`,
    reviewPrompt: `Revise esta sequencia de stories sobre "${input.title}" para tom medico responsavel.`
  }));
}

function compareMetric(label: string, current: number, previous: number, preferredDirection: "up" | "down" | "contextual"): MetricComparison {
  const delta = current - previous;
  const percent = previous === 0 ? null : Math.round((delta / previous) * 1000) / 10;
  const trend: MetricTrend = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const positive =
    preferredDirection === "contextual"
      ? "interpretar junto com qualidade"
      : preferredDirection === "up"
        ? trend === "up"
          ? "melhorou"
          : trend === "down"
            ? "piorou"
            : "estavel"
        : trend === "down"
          ? "melhorou"
          : trend === "up"
            ? "piorou"
            : "estavel";

  return {
    label,
    current,
    previous,
    delta,
    percent,
    trend,
    interpretation: positive
  };
}

function prompt(id: string, title: string, category: PromptLibraryItem["category"], text: string): PromptLibraryItem {
  return { id, title, category, prompt: text };
}

function tagFromPillar(pillar: string): string {
  const normalized = pillar
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
  return `#${normalized || "ConteudoMedicoResponsavel"}`;
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}
