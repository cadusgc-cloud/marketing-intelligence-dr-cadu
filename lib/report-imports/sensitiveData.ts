import type { RawReportRow, SensitiveClassification, SensitiveDataIssue } from "@/lib/report-imports/types";

type SensitiveRule = {
  term: string;
  classification: SensitiveClassification;
  pattern: RegExp;
  message: string;
};

export const sensitiveDataRules: SensitiveRule[] = [
  { term: "cpf", classification: "bloquear", pattern: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/i, message: "Possivel CPF detectado." },
  { term: "telefone", classification: "revisar", pattern: /(?:\+55\s*)?(?:\(?\d{2}\)?\s*)?(?:9?\d{4})[-\s]?\d{4}/i, message: "Possivel telefone detectado." },
  { term: "email", classification: "revisar", pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, message: "Possivel e-mail detectado." },
  { term: "prontuario", classification: "bloquear", pattern: /\bprontu[aá]rio\b|\bprontuario\b/i, message: "Possivel prontuario ou dado clinico." },
  { term: "paciente", classification: "bloquear", pattern: /\bpaciente\b|\bpacientes\b/i, message: "Referencia a paciente detectada." },
  { term: "antes/depois", classification: "bloquear", pattern: /antes\s*(?:\/|e)\s*depois/i, message: "Antes/depois deve ser bloqueado." },
  { term: "cirurgia de hoje", classification: "bloquear", pattern: /cirurgia de hoje|procedimento de hoje/i, message: "Bastidor especifico nao informado." },
  { term: "caso real", classification: "bloquear", pattern: /caso real|caso de hoje/i, message: "Caso real nao deve entrar no import." },
  { term: "token", classification: "bloquear", pattern: /(token|access_token|auth=|apikey|api_key|secret=)/i, message: "Possivel segredo ou token detectado." },
  { term: "senha", classification: "bloquear", pattern: /\bsenha\b|\bpassword\b|\bcookie\b|\blogin\b/i, message: "Possivel credencial detectada." },
  { term: "processo", classification: "revisar", pattern: /\b\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}\b|processo judicial/i, message: "Possivel processo judicial ou documento sensivel." },
  { term: "endereco", classification: "revisar", pattern: /\b(rua|avenida|av\.|alameda|rodovia)\s+[a-z0-9 ]+,\s*\d+/i, message: "Possivel endereco especifico." },
  { term: "localizacao especifica", classification: "revisar", pattern: /\b(hospital|clinica|cl[ií]nica)\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ][\wÀ-ÿ-]+/i, message: "Possivel localizacao especifica." }
];

export function detectSensitiveText(text: string, row?: number, field?: string): SensitiveDataIssue[] {
  if (!text.trim()) return [];
  return sensitiveDataRules
    .filter((rule) => rule.pattern.test(text))
    .map((rule) => ({
      row,
      field,
      classification: rule.classification,
      term: rule.term,
      message: rule.message
    }));
}

export function detectSensitiveData(rows: RawReportRow[]): SensitiveDataIssue[] {
  return rows.flatMap((row) =>
    Object.entries(row.values).flatMap(([field, value]) => detectSensitiveText(value, row.rowNumber, field))
  );
}

export function sensitiveScore(issues: SensitiveDataIssue[]): number {
  if (!issues.length) return 100;
  const penalty = issues.reduce((total, issue) => {
    if (issue.classification === "bloquear") return total + 35;
    if (issue.classification === "revisar") return total + 20;
    return total + 10;
  }, 0);
  return Math.max(0, 100 - penalty);
}
