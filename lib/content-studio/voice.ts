import type { BrandVoiceProfile } from "@/lib/content-studio/types";

export const DR_CADU_BRAND_VOICE: BrandVoiceProfile = {
  id: "dr-cadu-brand-voice-v5",
  name: "Dr. Cadu - humano, tecnico e sem promessa",
  allowedTraits: [
    "humano",
    "direto",
    "espontaneo",
    "cientifico simples",
    "anti-marketing elegante",
    "natural",
    "professoral",
    "cauteloso"
  ],
  avoidTraits: [
    "sensacionalista",
    "venda agressiva",
    "promessa de resultado",
    "campanha montada",
    "canva demais",
    "artificialidade excessiva",
    "diagnostico individual",
    "prescricao"
  ],
  allowedPatterns: [
    "frases curtas",
    "tom de conversa",
    "educacao simples",
    "expectativa realista",
    "decisao consciente",
    "bastidor neutro",
    "reflexao leve",
    "critica elegante ao marketing exagerado"
  ],
  forbiddenPatterns: [
    "agende agora",
    "ultimas vagas",
    "transforme seu corpo",
    "resultado garantido",
    "corpo perfeito",
    "tecnica ideal para voce",
    "sem risco",
    "sem cicatriz",
    "antes e depois",
    "paciente de hoje",
    "cirurgia de hoje",
    "aqui no hospital",
    "aqui na clinica",
    "voce precisa fazer",
    "eu indico para voce"
  ]
};

export function brandVoiceStatus(score: number): "excelente" | "bom" | "revisar" | "bloquear" {
  if (score >= 86) return "excelente";
  if (score >= 70) return "bom";
  if (score >= 45) return "revisar";
  return "bloquear";
}
