import type { SafetyClassification, SafetyGateResult, SafetyIssue, SafetyIssueSeverity } from "@/lib/monthly-editorial/types";

type RiskTerm = {
  term: string;
  category: SafetyIssue["category"];
  severity: SafetyIssueSeverity;
  suggestion: string;
};

const criticalTerms: RiskTerm[] = [
  term("resultado garantido", "promessa_resultado", "critical", "Trocar por linguagem de expectativa, limites e avaliacao individual."),
  term("transformacao completa", "promessa_resultado", "critical", "Remover promessa de transformacao e manter orientacao educativa."),
  term("corpo perfeito", "promessa_resultado", "critical", "Evitar ideal corporal absoluto."),
  term("sem risco", "promessa_resultado", "critical", "Explicar que todo procedimento exige avaliacao de riscos."),
  term("sem cicatriz", "promessa_resultado", "critical", "Remover promessa sobre cicatriz."),
  term("recuperacao rapida garantida", "promessa_resultado", "critical", "Usar linguagem de variabilidade e acompanhamento."),
  term("antes e depois", "antes_depois", "critical", "Nao usar antes/depois como promessa ou prova visual."),
  term("paciente de hoje", "paciente", "critical", "Remover qualquer referencia a paciente real."),
  term("paciente visivel", "paciente", "critical", "Remover qualquer pessoa identificavel."),
  term("cirurgia de hoje", "bastidor_inventado", "critical", "Nao afirmar cirurgia ou bastidor especifico sem contexto seguro e revisao humana."),
  term("no hospital agora", "localizacao", "critical", "Nao revelar local nem simular presenca em tempo real."),
  term("aqui na clinica agora", "localizacao", "critical", "Nao revelar local nem simular presenca em tempo real."),
  term("eu indico para voce", "procedimento_individual", "critical", "Nao sugerir conduta individual."),
  term("voce precisa fazer", "procedimento_individual", "critical", "Nao orientar procedimento individual."),
  term("tratamento ideal para voce", "procedimento_individual", "critical", "Nao personalizar indicacao sem consulta."),
  term("diagnostico", "diagnostico", "critical", "Evitar diagnostico individual em conteudo."),
  term("prescrev", "prescricao", "critical", "Evitar prescricao ou conduta individual."),
  term("prontuario", "paciente", "critical", "Nao usar documento clinico ou dado sensivel."),
  term("exame identificavel", "paciente", "critical", "Nao usar exame ou material clinico identificavel."),
  term("centro cirurgico identificavel", "localizacao", "critical", "Nao mostrar ambiente cirurgico reconhecivel."),
  term("documento sensivel", "paciente", "critical", "Nao usar documento sensivel."),
  term("processo real", "paciente", "critical", "Nao usar documento real ou caso identificavel.")
];

const warningTerms: RiskTerm[] = [
  term("melhor tecnica", "afirmacao_absoluta", "warning", "Trocar por criterio, indicacao e avaliacao."),
  term("definitivo", "afirmacao_absoluta", "warning", "Evitar afirmacao absoluta."),
  term("nunca", "afirmacao_absoluta", "warning", "Usar linguagem menos absoluta."),
  term("sempre", "afirmacao_absoluta", "warning", "Usar linguagem menos absoluta."),
  term("agende agora", "cta_agressivo", "warning", "Trocar por convite leve e educativo."),
  term("ultimas vagas", "urgencia_artificial", "warning", "Remover escassez artificial."),
  term("imperdivel", "sensacionalismo", "warning", "Remover linguagem promocional."),
  term("promocao", "campanha_exagerada", "warning", "Nao usar oferta comercial agressiva."),
  term("desconto", "campanha_exagerada", "warning", "Evitar linguagem promocional em marketing medico."),
  term("vagas limitadas", "urgencia_artificial", "warning", "Remover urgencia artificial."),
  term("oportunidade unica", "urgencia_artificial", "warning", "Remover promessa de oportunidade.")
];

const attentionTerms: RiskTerm[] = [
  term("hospital", "localizacao", "attention", "Verificar se nao revela local real."),
  term("clinica", "localizacao", "attention", "Verificar se nao revela local real."),
  term("localizacao", "localizacao", "attention", "Remover dado de local se nao for necessario."),
  term("endereco", "localizacao", "attention", "Remover endereco ou pista de local."),
  term("campanha", "campanha_exagerada", "attention", "Manter a peca com tom educativo, nao publicitario."),
  term("viral", "sensacionalismo", "attention", "Evitar linguagem de viralizacao como objetivo principal."),
  term("compare", "comparacao_depreciativa", "attention", "Nao comparar pacientes ou profissionais de forma depreciativa."),
  term("placa", "localizacao", "attention", "Remover placa ou pista de local."),
  term("login", "paciente", "attention", "Remover tela, login ou sistema identificavel.")
];

export const MONTHLY_EDITORIAL_RISK_TERMS = [...criticalTerms, ...warningTerms, ...attentionTerms].map((item) => item.term);

export function runMonthlySafetyGate(text: string, source = "conteudo"): SafetyGateResult {
  const normalizedText = normalizeText(text);
  const issues = [...criticalTerms, ...warningTerms, ...attentionTerms]
    .filter((riskTerm) => normalizedText.includes(normalizeText(riskTerm.term)))
    .map((riskTerm) => buildIssue(riskTerm, source));

  const uniqueIssues = uniqueIssuesById(issues);
  return buildSafetyGateFromIssues(uniqueIssues);
}

export function mergeSafetyGates(gates: SafetyGateResult[]): SafetyGateResult {
  const issues = uniqueIssuesById(gates.flatMap((gate) => gate.issues));
  return buildSafetyGateFromIssues(issues);
}

export function buildSafetyGateFromIssues(issues: SafetyIssue[]): SafetyGateResult {
  const score = clampScore(
    100 -
      issues.reduce((total, issue) => {
        if (issue.severity === "critical") return total + 35;
        if (issue.severity === "warning") return total + 18;
        if (issue.severity === "attention") return total + 8;
        return total;
      }, 0)
  );
  const blocks = issues.some((issue) => issue.blocks);
  const classification = classifyIssues(issues);

  return {
    score,
    classification,
    issues,
    blocks,
    detectedTerms: issues.map((issue) => issue.term),
    recommendations: uniqueStrings(issues.map((issue) => issue.suggestion))
  };
}

export function safetyClassificationLabel(classification: SafetyClassification): string {
  return {
    seguro: "Seguro",
    atencao: "Atencao",
    revisar_antes_de_postar: "Revisar antes de postar",
    bloquear: "Bloquear"
  }[classification];
}

export function createGovernanceIssue(id: string, message: string, severity: SafetyIssueSeverity = "info"): SafetyIssue {
  return {
    id,
    category: "governanca",
    term: "governanca",
    message,
    severity,
    suggestion: "Manter revisao humana e nao usar este ponto como benchmark normal.",
    blocks: severity === "critical"
  };
}

function classifyIssues(issues: SafetyIssue[]): SafetyClassification {
  if (issues.some((issue) => issue.severity === "critical")) return "bloquear";
  if (issues.some((issue) => issue.severity === "warning")) return "revisar_antes_de_postar";
  if (issues.some((issue) => issue.severity === "attention")) return "atencao";
  return "seguro";
}

function buildIssue(riskTerm: RiskTerm, source: string): SafetyIssue {
  return {
    id: `${source}-${riskTerm.category}-${slugify(riskTerm.term)}`,
    category: riskTerm.category,
    term: riskTerm.term,
    message: `Termo de risco encontrado em ${source}: "${riskTerm.term}".`,
    severity: riskTerm.severity,
    suggestion: riskTerm.suggestion,
    blocks: riskTerm.severity === "critical"
  };
}

function term(termValue: string, category: SafetyIssue["category"], severity: SafetyIssueSeverity, suggestion: string): RiskTerm {
  return { term: termValue, category, severity, suggestion };
}

function uniqueIssuesById(issues: SafetyIssue[]): SafetyIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    if (seen.has(issue.id)) return false;
    seen.add(issue.id);
    return true;
  });
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugify(value: string): string {
  return normalizeText(value).replace(/\s+/g, "-") || "termo";
}
