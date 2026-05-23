export type StoryEditorialLine =
  | "bastidor_leve"
  | "educacao_medica_simples"
  | "estetica_natural"
  | "expectativa_realista"
  | "rotina_profissional_neutra"
  | "reflexao_fim_de_dia"
  | "ciencia_e_estudo"
  | "plastica_em_evidencia"
  | "clareza_tecnica_medica";

export type StoryRiskLevel = "low" | "attention" | "review" | "block";

export type StorySafetyCategory =
  | "theme"
  | "promise"
  | "diagnosis_prescription"
  | "before_after"
  | "aggressive_cta"
  | "commercial_language"
  | "specific_backstage"
  | "location_privacy"
  | "patient_privacy"
  | "language_length"
  | "medical_governance";

export type StorySafetyCheck = {
  id: string;
  category: StorySafetyCategory;
  label: string;
  status: StoryRiskLevel;
  message: string;
};

export type StoryMediaCategory =
  | "selfie_neutra"
  | "mesa_agenda_cafe"
  | "livro_artigo"
  | "fundo_simples"
  | "video_curto_falando"
  | "ceu_fim_de_dia"
  | "print_post_antigo"
  | "bastidor_nao_identificavel"
  | "arte_simples_inevitavel";

export type StoryMediaSuggestion = {
  category: StoryMediaCategory;
  label: string;
  description: string;
  captureGuidance: string;
  privacyNote: string;
};

export type StoryItem = {
  order: number;
  mediaSuggestion: StoryMediaSuggestion;
  textOnScreen: string;
  safetyNote: string;
  tone: string;
  editorialRisk: StoryRiskLevel;
  recommendationReason: string;
  editableNote: string;
};

export type StoryTheme = {
  id: string;
  label: string;
  suggestedLine: StoryEditorialLine;
  keywords: string[];
};

export type StoryExportFormat = "plain_text" | "markdown";

export type StoryOpsInput = {
  date: string;
  theme: string;
  editorialLine: StoryEditorialLine;
  neutralContext?: string;
};

export type StorySequence = {
  id: string;
  date: string;
  dayName: string;
  theme: string;
  editorialLine: StoryEditorialLine;
  editorialLineLabel: string;
  neutralContext: string;
  dayGuidance: string;
  items: StoryItem[];
  safetyChecks: StorySafetyCheck[];
  safetyStatus: StoryRiskLevel;
  safetyScore: number;
  exportText: string;
  createdAt: Date;
};
