import type { StorySequence } from "@/lib/storyops";
import type { SafetyClassification } from "@/lib/monthly-editorial";
import type { TaskPriority, TaskStatus } from "@/lib/marketing-ops";

export type ContentFormat =
  | "stories"
  | "reel"
  | "carrossel"
  | "post_estatico"
  | "legenda"
  | "briefing_editor"
  | "pacote_completo";

export type ContentStudioStatus =
  | "rascunho"
  | "precisa_revisao"
  | "aprovado"
  | "bloqueado"
  | "pronto_para_gravacao"
  | "enviado_para_editor"
  | "publicado_manual"
  | "arquivado";

export type ContentPillar = {
  id: string;
  name: string;
  description: string;
  recommendedTone: string;
  formats: ContentFormat[];
  riskNotes: string[];
};

export type BrandVoiceProfile = {
  id: string;
  name: string;
  allowedTraits: string[];
  avoidTraits: string[];
  allowedPatterns: string[];
  forbiddenPatterns: string[];
};

export type ContentStudioInput = {
  theme?: string;
  pillarId?: string;
  format?: ContentFormat;
  date?: string;
  audience?: string;
  tone?: string;
  contextNote?: string;
};

export type ContentAtom = {
  id: string;
  category: "hook" | "caption" | "story" | "reel" | "carousel" | "media" | "safety";
  text: string;
  tags: string[];
};

export type HookAtom = ContentAtom & {
  category: "hook";
  style: "educativo" | "reflexivo" | "anti_marketing" | "bastidor" | "cientifico" | "naturalidade" | "seguranca";
};

export type CaptionAtom = ContentAtom & {
  category: "caption";
  style: "neutra" | "reflexiva" | "educativa" | "anti_marketing";
};

export type StoryAtom = ContentAtom & {
  category: "story";
  mediaHint: string;
};

export type ReelScript = {
  id: string;
  title: string;
  hook: string;
  spokenScript: string;
  onScreenText: string[];
  suggestedScenes: string[];
  estimatedDurationSeconds: number;
  recordingBriefing: string;
  safetyNote: string;
  exportText: string;
};

export type CarouselDraft = {
  id: string;
  title: string;
  cards: string[];
  caption: string;
  visualSuggestion: string;
  safetyNote: string;
  exportText: string;
};

export type PostDraft = {
  id: string;
  title: string;
  screenText: string;
  caption: string;
  visualSuggestion: string;
  safetyNote: string;
  exportText: string;
};

export type ContentVariant = {
  id: string;
  label: string;
  useCase: string;
  text: string;
  quality: UnifiedQualityResult;
};

export type MediaChecklist = {
  required: string[];
  optional: string[];
  avoid: string[];
  exportText: string;
};

export type EditorBriefing = {
  id: string;
  title: string;
  objective: string;
  format: ContentFormat;
  rhythm: string;
  cuts: string[];
  visualElements: string[];
  onScreenText: string[];
  safetyCare: string[];
  exportText: string;
};

export type ProductionTask = {
  id: string;
  title: string;
  format: ContentFormat;
  theme: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueHint: string;
  requiredMedia: string[];
  safetyStatus: SafetyClassification;
  readiness: number;
  exportText: string;
};

export type ReviewItem = {
  id: string;
  title: string;
  format: ContentFormat;
  theme: string;
  status: ContentStudioStatus;
  voiceScore: number;
  safetyScore: number;
  readinessScore: number;
  risks: string[];
  exportText: string;
};

export type RecordingShot = {
  id: string;
  label: string;
  guidance: string;
  safetyNote: string;
};

export type RecordingTopic = {
  id: string;
  order: number;
  theme: string;
  pillar: string;
  mainLine: string;
  shortScript: string;
  shots: RecordingShot[];
  mediaChecklist: string[];
  repurposing: string[];
  safetyNote: string;
};

export type RecordingSession = {
  id: string;
  title: string;
  objective: string;
  dateHint: string;
  topics: RecordingTopic[];
  beforeChecklist: string[];
  afterChecklist: string[];
  editorBatchBriefing: string;
  exportText: string;
};

export type ContentExportBundle = {
  fullPackage: string;
  recordingPackage: string;
  editorBriefing: string;
  googleSheetsTsv: string;
  googleAgenda: string;
  etusManual: string;
  stories: string;
  reels: string;
  carousel: string;
  captions: string;
  mediaChecklist: string;
  reviewChecklist: string;
  qualityReport: string;
  technicalJson: string;
};

export type UnifiedQualityIssue = {
  id: string;
  category:
    | "voz"
    | "seguranca_medica"
    | "clareza"
    | "naturalidade"
    | "concisao"
    | "promessa"
    | "cta_agressivo"
    | "diagnostico"
    | "prescricao"
    | "antes_depois"
    | "paciente_local"
    | "campanha"
    | "utilidade";
  severity: "info" | "warning" | "blocking";
  message: string;
  suggestion: string;
  term?: string;
};

export type UnifiedQualityResult = {
  voiceScore: number;
  safetyScore: number;
  readinessScore: number;
  riskLevel: SafetyClassification;
  issues: UnifiedQualityIssue[];
  suggestions: string[];
  blocked: boolean;
  approvedForManualUse: boolean;
  requiresHumanReview: boolean;
  status: "aprovado" | "revisar" | "bloquear";
};

export type ContentStudioPackage = {
  id: string;
  input: Required<ContentStudioInput>;
  pillar: ContentPillar;
  theme: string;
  storySequence: StorySequence;
  reel: ReelScript;
  carousel: CarouselDraft;
  post: PostDraft;
  captions: CaptionAtom[];
  variants: ContentVariant[];
  editorBriefing: EditorBriefing;
  mediaChecklist: MediaChecklist;
  productionTasks: ProductionTask[];
  reviewItem: ReviewItem;
  recordingPlan: RecordingTopic;
  exports: ContentExportBundle;
  quality: UnifiedQualityResult;
  status: ContentStudioStatus;
  createdAt: Date;
};

export type ContentLibraryInventory = {
  pillars: ContentPillar[];
  themes: string[];
  hooks: HookAtom[];
  storyPhrases: StoryAtom[];
  reelHooks: string[];
  carouselTemplates: string[][];
  captions: CaptionAtom[];
  forbiddenTerms: string[];
};

export type ContentStudioCheckReport = {
  status: "aprovado" | "bloqueado";
  generatedPackages: number;
  generatedVariants: number;
  recordingTopics: number;
  reviewItems: number;
  productionItems: number;
  averageReadiness: number;
  blockingFailures: string[];
  warnings: string[];
  reportsGenerated: string[];
};
