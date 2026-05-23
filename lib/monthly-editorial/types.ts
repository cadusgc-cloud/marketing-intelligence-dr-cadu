import type { StoryEditorialLine, StorySequence } from "@/lib/storyops";

export type CampaignObjective =
  | "aumentar_autoridade"
  | "educar_cirurgia_plastica"
  | "fortalecer_estetica_natural"
  | "alinhar_expectativas"
  | "reduzir_marketing_apelativo"
  | "mostrar_bastidores_neutros"
  | "divulgar_plastica_em_evidencia"
  | "construir_confianca"
  | "organizar_conteudo_semanal";

export type CampaignIntensity = "leve" | "padrao" | "intensa";

export type ContentChannel =
  | "instagram_stories"
  | "instagram_reels"
  | "instagram_feed"
  | "instagram_carrossel"
  | "tiktok"
  | "youtube_shorts"
  | "youtube_video"
  | "facebook"
  | "google_business_profile";

export type EditorialStatus = "ideia" | "rascunho" | "revisar" | "pronto" | "publicado_manual" | "arquivado" | "bloqueado";

export type ExportFormat =
  | "monthly_markdown"
  | "week_text"
  | "day_text"
  | "stories"
  | "reels"
  | "posts"
  | "media_checklist"
  | "video_editor_brief"
  | "google_sheets_tsv"
  | "google_agenda_text";

export type EditorialPillarId =
  | "estetica_natural"
  | "expectativa_realista"
  | "seguranca_cirurgia_plastica"
  | "recuperacao_cicatrizacao"
  | "bastidores_neutros_humanos"
  | "ciencia_simples"
  | "sem_marketing_exagerado"
  | "plastica_em_evidencia"
  | "ensino_formacao_medica"
  | "pericia_clareza_tecnica"
  | "planejamento_pre_cirurgia"
  | "limites_cirurgia_plastica"
  | "comunicacao_medico_paciente"
  | "naturalidade_sem_promessa"
  | "decisao_consciente";

export type EditorialPillar = {
  id: EditorialPillarId;
  name: string;
  description: string;
  recommendedTone: string;
  compatibleThemes: string[];
  typicalRisks: string[];
  safePhrases: string[];
  recommendedFormats: Array<"stories" | "reel" | "post_estatico" | "carrossel" | "youtube_video">;
  storyEditorialLine: StoryEditorialLine;
};

export type CampaignInput = {
  name?: string;
  startDate?: string;
  durationDays?: number;
  objective?: CampaignObjective | string;
  targetAudience?: string;
  tone?: string;
  intensity?: CampaignIntensity;
  priorityPillars?: EditorialPillarId[];
  activeChannels?: ContentChannel[];
  neutralNotes?: string;
  editorialRestrictions?: string[];
};

export type StoryPlan = StorySequence;

export type ReelPlan = {
  id: string;
  title: string;
  openingHook: string;
  shortScript: string[];
  suggestedSpokenText: string;
  onScreenText: string[];
  sceneSuggestion: string;
  estimatedDurationSeconds: number;
  safetyNote: string;
  editorialRisk: SafetyClassification;
  exportText: string;
};

export type PostPlan = {
  id: string;
  format: "post_estatico";
  title: string;
  centralIdea: string;
  shortCaption: string;
  visualSuggestion: string;
  safetyNote: string;
  editorialRisk: SafetyClassification;
  exportText: string;
};

export type CarouselPlan = {
  id: string;
  format: "carrossel";
  title: string;
  centralIdea: string;
  cards: string[];
  caption: string;
  visualSuggestion: string;
  safetyNote: string;
  editorialRisk: SafetyClassification;
  exportText: string;
};

export type MediaSuggestion = {
  id: string;
  category: string;
  label: string;
  description: string;
  captureGuidance: string;
  privacyNote: string;
  risk: SafetyClassification;
};

export type MediaChecklistItem = {
  id: string;
  label: string;
  category: string;
  targetCount: number;
  currentCount: number;
  status: "suficiente" | "faltando" | "revisar";
  safetyNote: string;
};

export type MediaChecklist = {
  monthlyItems: MediaChecklistItem[];
  weeklyItems: MediaChecklistItem[];
  dailyRequiredCategories: string[];
  gaps: string[];
  prohibitedItems: string[];
};

export type SafetyIssueSeverity = "info" | "attention" | "warning" | "critical";

export type SafetyClassification = "seguro" | "atencao" | "revisar_antes_de_postar" | "bloquear";

export type SafetyIssue = {
  id: string;
  category:
    | "promessa_resultado"
    | "cta_agressivo"
    | "diagnostico"
    | "prescricao"
    | "antes_depois"
    | "paciente"
    | "localizacao"
    | "bastidor_inventado"
    | "sensacionalismo"
    | "comparacao_depreciativa"
    | "afirmacao_absoluta"
    | "urgencia_artificial"
    | "termo_proibido"
    | "campanha_exagerada"
    | "procedimento_individual"
    | "governanca";
  term: string;
  message: string;
  severity: SafetyIssueSeverity;
  suggestion: string;
  blocks: boolean;
};

export type SafetyGateResult = {
  score: number;
  classification: SafetyClassification;
  issues: SafetyIssue[];
  blocks: boolean;
  detectedTerms: string[];
  recommendations: string[];
};

export type DailyContentPlan = {
  storySequence: StoryPlan;
  reelPlan?: ReelPlan;
  postPlan?: PostPlan;
  carouselPlan?: CarouselPlan;
};

export type EditorialDay = {
  id: string;
  date: string;
  weekday: string;
  dayNumber: number;
  weekNumber: number;
  pillar: EditorialPillar;
  theme: string;
  dailyObjective: string;
  tone: string;
  content: DailyContentPlan;
  mediaSuggestions: MediaSuggestion[];
  mediaChecklistItems: MediaChecklistItem[];
  safetyGate: SafetyGateResult;
  editorialStatus: EditorialStatus;
  exportText: string;
  notes: string;
};

export type EditorialWeek = {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  theme: string;
  objective: string;
  days: EditorialDay[];
  exportText: string;
};

export type CampaignSummary = {
  totalDays: number;
  totalStories: number;
  totalReels: number;
  totalPostsAndCarousels: number;
  totalSafetyAlerts: number;
  blockedItems: number;
  mediaSuggestions: number;
  mediaGaps: number;
};

export type CampaignExportBundle = Record<ExportFormat, string>;

export type CampaignPlan = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  objective: string;
  targetAudience: string;
  tone: string;
  intensity: CampaignIntensity;
  activeChannels: ContentChannel[];
  priorityPillars: EditorialPillarId[];
  neutralNotes: string;
  editorialRestrictions: string[];
  weeks: EditorialWeek[];
  days: EditorialDay[];
  summary: CampaignSummary;
  mediaChecklist: MediaChecklist;
  safetyGate: SafetyGateResult;
  exports: CampaignExportBundle;
  createdAt: Date;
};
