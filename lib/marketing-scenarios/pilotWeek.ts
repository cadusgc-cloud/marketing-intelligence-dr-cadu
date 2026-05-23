import type { PilotDayDefinition } from "@/lib/marketing-scenarios/types";
import type { CampaignInput } from "@/lib/monthly-editorial";

export const PILOT_WEEK_START_DATE = "2026-05-24";
export const PILOT_WEEK_END_DATE = "2026-05-30";
export const PILOT_WEEK_CAMPAIGN_NAME = "Semana Piloto - Cirurgia Plastica Sem Promessa";

export const PILOT_WEEK_CAMPAIGN_INPUT: CampaignInput = {
  name: PILOT_WEEK_CAMPAIGN_NAME,
  startDate: PILOT_WEEK_START_DATE,
  durationDays: 7,
  objective: "Gerar presenca diaria sem improviso, reforcar estetica natural, alinhar expectativas e evitar promessas.",
  targetAudience: "Pessoas que estao pensando em cirurgia plastica e precisam de informacao clara antes de decidir.",
  tone: "humano, espontaneo, cientifico simples, anti-marketing elegante e natural",
  intensity: "padrao",
  priorityPillars: [
    "expectativa_realista",
    "decisao_consciente",
    "naturalidade_sem_promessa",
    "comunicacao_medico_paciente",
    "recuperacao_cicatrizacao",
    "sem_marketing_exagerado",
    "estetica_natural"
  ],
  activeChannels: [
    "instagram_stories",
    "instagram_reels",
    "instagram_feed",
    "instagram_carrossel",
    "tiktok",
    "youtube_shorts",
    "facebook",
    "google_business_profile"
  ],
  neutralNotes: "Contexto neutro e editavel. Evitar agenda real, pessoas identificaveis, documentos e bastidor especifico.",
  editorialRestrictions: [
    "sem promessa de resultado",
    "sem antes/depois",
    "sem diagnostico ou prescricao",
    "sem paciente, prontuario ou dado sensivel",
    "sem publicacao automatica",
    "sem API externa"
  ]
};

export const PILOT_WEEK_DAYS: PilotDayDefinition[] = [
  {
    date: "2026-05-24",
    weekday: "Domingo",
    theme: "desacelerar, organizar ideias e expectativa realista",
    editorialLine: "reflexao_fim_de_dia",
    pillarId: "expectativa_realista",
    objective: "Abrir a semana com tom leve, organizando ideias e lembrando que expectativa realista tambem e cuidado.",
    tone: "leve, reflexivo, sem dizer que algo esta acontecendo agora",
    note: "Usar imagem neutra de fim de dia ou objeto simples; nao revelar local nem rotina real.",
    hasReel: false,
    hasPostOrCarousel: false
  },
  {
    date: "2026-05-25",
    weekday: "Segunda-feira",
    theme: "cirurgia plastica nao combina com pressa",
    editorialLine: "expectativa_realista",
    pillarId: "decisao_consciente",
    objective: "Transformar inicio de semana em lembrete de decisao consciente e sem impulso.",
    tone: "inicio de semana, organizacao e decisao consciente",
    note: "Usar fala curta para camera ou mesa neutra; manter convite educativo.",
    hasReel: true,
    hasPostOrCarousel: false
  },
  {
    date: "2026-05-26",
    weekday: "Terca-feira",
    theme: "naturalidade tambem e planejamento",
    editorialLine: "estetica_natural",
    pillarId: "naturalidade_sem_promessa",
    objective: "Explicar naturalidade como criterio, planejamento e alinhamento, nao como garantia estetica.",
    tone: "educativo simples",
    note: "Bom dia para carrossel curto ou post com frase enxuta.",
    hasReel: false,
    hasPostOrCarousel: true
  },
  {
    date: "2026-05-27",
    weekday: "Quarta-feira",
    theme: "consulta nao e venda",
    editorialLine: "plastica_em_evidencia",
    pillarId: "comunicacao_medico_paciente",
    objective: "Reforcar postura anti-marketing elegante: consulta organiza limites, riscos e possibilidades.",
    tone: "anti-marketing elegante",
    note: "Evitar CTA comercial; usar texto com cara de conversa.",
    hasReel: true,
    hasPostOrCarousel: false
  },
  {
    date: "2026-05-28",
    weekday: "Quinta-feira",
    theme: "cicatrizacao e paciencia",
    editorialLine: "educacao_medica_simples",
    pillarId: "recuperacao_cicatrizacao",
    objective: "Educar sobre variabilidade de recuperacao sem orientar conduta individual ou prometer.",
    tone: "educativo, sem orientar conduta individual e sem prometer",
    note: "Usar livro/artigo ou fundo simples; nao usar imagem clinica.",
    hasReel: false,
    hasPostOrCarousel: true
  },
  {
    date: "2026-05-29",
    weekday: "Sexta-feira",
    theme: "o que o marketing nao mostra",
    editorialLine: "plastica_em_evidencia",
    pillarId: "sem_marketing_exagerado",
    objective: "Mostrar com elegancia que conteudo medico precisa falar de limites, riscos e contexto.",
    tone: "critico, mas elegante, sem agressividade",
    note: "Pode virar reel curto; evitar comparar profissionais ou pacientes.",
    hasReel: true,
    hasPostOrCarousel: false
  },
  {
    date: "2026-05-30",
    weekday: "Sabado",
    theme: "estetica natural e identidade",
    editorialLine: "estetica_natural",
    pillarId: "estetica_natural",
    objective: "Fechar a semana com tom humano sobre identidade, naturalidade e decisao sem promessa.",
    tone: "leve, humano, reflexivo",
    note: "Usar imagem neutra, microvideo de reflexao ou fundo simples.",
    hasReel: false,
    hasPostOrCarousel: true
  }
];
