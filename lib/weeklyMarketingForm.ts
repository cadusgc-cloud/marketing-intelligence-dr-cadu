import { validateWeeklyMarketingWeekInput, type WeeklyMarketingWeekInput } from "@/lib/weeklyMarketingWeeks";

type NumberField = keyof Pick<
  WeeklyMarketingWeekInput,
  | "metaSpend"
  | "metaWhatsappConversations"
  | "metaProfileVisits"
  | "googleSpend"
  | "googleClicks"
  | "googleConversions"
  | "instagramStories"
  | "instagramReels"
  | "instagramPosts"
  | "instagramProfileVisits"
  | "whatsappTotal"
  | "qualifiedConversations"
  | "consultationsScheduled"
  | "consultationsAttended"
  | "surgeriesClosed"
>;

const numberFieldLabels: Record<NumberField, string> = {
  metaSpend: "investimento Meta Ads",
  metaWhatsappConversations: "conversas no WhatsApp",
  metaProfileVisits: "visitas ao perfil Meta",
  googleSpend: "investimento Google Ads",
  googleClicks: "cliques Google Ads",
  googleConversions: "conversoes Google Ads",
  instagramStories: "Stories na semana",
  instagramReels: "Reels/Shorts na semana",
  instagramPosts: "posts na semana",
  instagramProfileVisits: "visitas ao perfil Instagram",
  whatsappTotal: "WhatsApps totais",
  qualifiedConversations: "conversas qualificadas",
  consultationsScheduled: "consultas marcadas",
  consultationsAttended: "consultas comparecidas",
  surgeriesClosed: "cirurgias fechadas"
};

const integerFields = new Set<NumberField>([
  "metaWhatsappConversations",
  "metaProfileVisits",
  "googleClicks",
  "googleConversions",
  "instagramStories",
  "instagramReels",
  "instagramPosts",
  "instagramProfileVisits",
  "whatsappTotal",
  "qualifiedConversations",
  "consultationsScheduled",
  "consultationsAttended",
  "surgeriesClosed"
]);

const nullableFields = new Set<NumberField>(["consultationsScheduled", "consultationsAttended", "surgeriesClosed"]);

export type WeeklyMarketingFormParseResult = {
  input: WeeklyMarketingWeekInput | null;
  errors: string[];
};

export function parseWeeklyMarketingFormData(formData: FormData): WeeklyMarketingFormParseResult {
  const errors: string[] = [];
  const getText = (name: string) => String(formData.get(name) ?? "").trim();

  const input: WeeklyMarketingWeekInput = {
    weekLabel: getText("weekLabel"),
    startDate: getText("startDate"),
    endDate: getText("endDate"),
    metaSpend: parseNumberField(formData, "metaSpend", errors) ?? 0,
    metaWhatsappConversations: parseNumberField(formData, "metaWhatsappConversations", errors) ?? 0,
    metaProfileVisits: parseNumberField(formData, "metaProfileVisits", errors) ?? 0,
    googleSpend: parseNumberField(formData, "googleSpend", errors) ?? 0,
    googleClicks: parseNumberField(formData, "googleClicks", errors) ?? 0,
    googleConversions: parseNumberField(formData, "googleConversions", errors) ?? 0,
    instagramStories: parseNumberField(formData, "instagramStories", errors) ?? 0,
    instagramReels: parseNumberField(formData, "instagramReels", errors) ?? 0,
    instagramPosts: parseNumberField(formData, "instagramPosts", errors) ?? 0,
    instagramProfileVisits: parseNumberField(formData, "instagramProfileVisits", errors) ?? 0,
    whatsappTotal: parseNumberField(formData, "whatsappTotal", errors) ?? 0,
    qualifiedConversations: parseNumberField(formData, "qualifiedConversations", errors) ?? 0,
    consultationsScheduled: parseNumberField(formData, "consultationsScheduled", errors),
    consultationsAttended: parseNumberField(formData, "consultationsAttended", errors),
    surgeriesClosed: parseNumberField(formData, "surgeriesClosed", errors),
    notes: getText("notes")
  };

  const validationErrors = validateWeeklyMarketingWeekInput(input);
  const allErrors = unique([...errors, ...validationErrors]);
  return {
    input: allErrors.length > 0 ? null : input,
    errors: allErrors
  };
}

function parseNumberField(formData: FormData, field: NumberField, errors: string[]): number | null {
  const rawValue = String(formData.get(field) ?? "").trim();
  if (!rawValue && nullableFields.has(field)) return null;
  if (!rawValue) {
    errors.push(`Informe o campo ${numberFieldLabels[field]}.`);
    return null;
  }

  const value = Number(normalizeNumberString(rawValue));
  if (!Number.isFinite(value)) {
    errors.push(`O campo ${numberFieldLabels[field]} precisa ser numerico.`);
    return null;
  }

  if (value < 0) errors.push(`O campo ${numberFieldLabels[field]} nao pode ser negativo.`);
  if (integerFields.has(field) && !Number.isInteger(value)) {
    errors.push(`O campo ${numberFieldLabels[field]} precisa ser um numero inteiro.`);
  }

  return value;
}

function normalizeNumberString(value: string): string {
  const compact = value.replace(/\s/g, "");
  if (compact.includes(",")) return compact.replace(/\./g, "").replace(",", ".");
  return compact;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}
