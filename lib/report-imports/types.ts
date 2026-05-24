export type ReportSource =
  | "reportei"
  | "instagram"
  | "meta_ads"
  | "etus_manual"
  | "google_sheets"
  | "generic"
  | "manual";

export type CanonicalReportField =
  | "date"
  | "channel"
  | "profile"
  | "format"
  | "title"
  | "theme"
  | "pillar"
  | "caption"
  | "reach"
  | "impressions"
  | "likes"
  | "comments"
  | "shares"
  | "saves"
  | "replies"
  | "clicks"
  | "profileVisits"
  | "follows"
  | "dms"
  | "engagement"
  | "link"
  | "spend"
  | "cpc"
  | "cpm"
  | "ctr"
  | "frequency"
  | "leads"
  | "results"
  | "effort"
  | "risk"
  | "status"
  | "media"
  | "notes"
  | "unknown";

export type ImportSeverity = "info" | "warning" | "blocking";
export type ImportStatus = "aprovado" | "revisar" | "bloquear";
export type SensitiveClassification = "seguro" | "atencao" | "revisar" | "bloquear";

export type ReportImportInput = {
  source: ReportSource;
  text: string;
  periodStart?: string;
  periodEnd?: string;
  manualMapping?: Partial<Record<string, CanonicalReportField>>;
};

export type SourceSchemaPreset = {
  source: ReportSource;
  label: string;
  requiredFields: CanonicalReportField[];
  recommendedFields: CanonicalReportField[];
  acceptedHeaders: Record<CanonicalReportField, string[]>;
};

export type ReportSchema = SourceSchemaPreset;

export type ReportColumnMapping = {
  source: ReportSource;
  headers: string[];
  mapped: Record<string, CanonicalReportField>;
  unknownHeaders: string[];
  missingRequiredFields: CanonicalReportField[];
  schemaMatchScore: number;
};

export type RawReportRow = {
  rowNumber: number;
  values: Record<string, string>;
};

export type NormalizedReportMetrics = {
  reach?: number;
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  replies?: number;
  clicks?: number;
  profileVisits?: number;
  follows?: number;
  dms?: number;
  engagement?: number;
  spend?: number;
  cpc?: number;
  cpm?: number;
  ctr?: number;
  frequency?: number;
  leads?: number;
  results?: number;
};

export type NormalizedReportRow = {
  id: string;
  source: ReportSource;
  rowNumber: number;
  date?: string;
  channel: string;
  profile?: string;
  format: string;
  title: string;
  theme: string;
  pillar: string;
  caption?: string;
  link?: string;
  status?: string;
  media?: string;
  notes?: string;
  effort?: number;
  risk?: string;
  metrics: NormalizedReportMetrics;
  raw: Record<string, string>;
  sensitiveIssues: SensitiveDataIssue[];
};

export type ImportValidationIssue = {
  row?: number;
  field?: CanonicalReportField | string;
  severity: ImportSeverity;
  message: string;
};

export type SensitiveDataIssue = {
  row?: number;
  field?: string;
  classification: SensitiveClassification;
  term: string;
  message: string;
};

export type ImportQualityScore = {
  completenessScore: number;
  schemaMatchScore: number;
  dateCoverageScore: number;
  metricValidityScore: number;
  duplicateScore: number;
  sensitiveDataScore: number;
  overallQualityScore: number;
  status: ImportStatus;
  reasons: string[];
};

export type ReportImportPreview = {
  headers: string[];
  rows: RawReportRow[];
  normalizedSample: NormalizedReportRow[];
};

export type ReportImportExportBundle = {
  normalizedTsv: string;
  qualityMarkdown: string;
  sensitiveAuditMarkdown: string;
  technicalJson: string;
};

export type ReportImportResult = {
  source: ReportSource;
  delimiter: string;
  headers: string[];
  rows: RawReportRow[];
  mapping: ReportColumnMapping;
  normalizedRows: NormalizedReportRow[];
  issues: ImportValidationIssue[];
  sensitiveIssues: SensitiveDataIssue[];
  quality: ImportQualityScore;
  preview: ReportImportPreview;
  exports: ReportImportExportBundle;
  ok: boolean;
  blocked: boolean;
};
