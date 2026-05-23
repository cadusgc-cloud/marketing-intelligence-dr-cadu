import type { EditorialPillarId } from "@/lib/monthly-editorial/types";

export type MonthlyEditorialTheme = {
  id: string;
  label: string;
  pillarHints: EditorialPillarId[];
  weekdayBias?: "weekday" | "weekend" | "any";
};

function theme(id: string, label: string, pillarHints: EditorialPillarId[], weekdayBias: "weekday" | "weekend" | "any" = "any"): MonthlyEditorialTheme {
  return { id, label, pillarHints, weekdayBias };
}

export const MONTHLY_EDITORIAL_THEMES: MonthlyEditorialTheme[] = [
  theme("expectativa-realista", "expectativa realista em cirurgia plastica", ["expectativa_realista", "decisao_consciente"]),
  theme("resultado-natural", "resultado natural", ["estetica_natural", "naturalidade_sem_promessa"]),
  theme("planejamento-antes-cirurgia", "planejamento antes da cirurgia", ["planejamento_pre_cirurgia", "seguranca_cirurgia_plastica"]),
  theme("importancia-consulta", "importancia da consulta", ["comunicacao_medico_paciente", "planejamento_pre_cirurgia"]),
  theme("limites-cirurgia", "limites da cirurgia plastica", ["limites_cirurgia_plastica", "expectativa_realista"]),
  theme("cicatrizacao", "cicatrizacao", ["recuperacao_cicatrizacao"]),
  theme("recuperacao", "recuperacao", ["recuperacao_cicatrizacao"]),
  theme("assimetrias-naturais", "assimetrias naturais", ["estetica_natural", "naturalidade_sem_promessa"]),
  theme("seguranca", "seguranca em cirurgia plastica", ["seguranca_cirurgia_plastica"]),
  theme("nao-decidir-impulso", "nao decidir por impulso", ["decisao_consciente", "expectativa_realista"]),
  theme("autoestima-sem-promessa", "cirurgia plastica e autoestima sem promessa", ["naturalidade_sem_promessa", "expectativa_realista"]),
  theme("estudo-atualizacao", "estudo e atualizacao medica", ["ensino_formacao_medica", "ciencia_simples"]),
  theme("bastidores-neutros", "bastidores neutros", ["bastidores_neutros_humanos"], "weekend"),
  theme("organizacao-semana", "organizacao da semana", ["bastidores_neutros_humanos", "decisao_consciente"], "weekend"),
  theme("reflexao-fim-dia", "reflexao de fim de dia", ["bastidores_neutros_humanos", "decisao_consciente"], "weekend"),
  theme("plastica-em-evidencia", "Plastica em Evidencia", ["plastica_em_evidencia", "sem_marketing_exagerado"]),
  theme("prova-formacao", "prova de titulo e formacao medica", ["ensino_formacao_medica", "ciencia_simples"]),
  theme("pericia-clareza", "pericia medica e clareza tecnica", ["pericia_clareza_tecnica"]),
  theme("conversa-clara", "conversa clara antes de operar", ["comunicacao_medico_paciente", "planejamento_pre_cirurgia"]),
  theme("naturalidade-planejamento", "naturalidade tambem e planejamento", ["estetica_natural", "naturalidade_sem_promessa"]),
  theme("riscos-limites", "riscos e limites precisam ser conversados", ["seguranca_cirurgia_plastica", "limites_cirurgia_plastica"]),
  theme("marketing-nao-mostra", "o que o marketing nao mostra", ["sem_marketing_exagerado", "plastica_em_evidencia"]),
  theme("decisao-consciente", "decisao consciente", ["decisao_consciente"]),
  theme("consulta-nao-venda", "consulta nao e venda", ["comunicacao_medico_paciente", "sem_marketing_exagerado"]),
  theme("sem-pressa", "cirurgia plastica nao combina com pressa", ["decisao_consciente", "expectativa_realista"]),
  theme("informacao-clara", "informacao clara antes da decisao", ["ciencia_simples", "planejamento_pre_cirurgia"]),
  theme("ciencia-simples", "ciencia simples para pacientes", ["ciencia_simples", "ensino_formacao_medica"]),
  theme("sem-exagero", "cirurgia plastica sem exagero", ["sem_marketing_exagerado", "naturalidade_sem_promessa"]),
  theme("papel-cirurgiao", "o papel do cirurgiao plastico", ["ciencia_simples", "comunicacao_medico_paciente"]),
  theme("recuperacao-paciencia", "recuperacao exige paciencia", ["recuperacao_cicatrizacao", "expectativa_realista"])
];

export function findThemesForPillar(pillarId: EditorialPillarId, weekend = false): MonthlyEditorialTheme[] {
  const matching = MONTHLY_EDITORIAL_THEMES.filter((themeItem) => {
    const biasOk = themeItem.weekdayBias === "any" || (weekend ? themeItem.weekdayBias === "weekend" : themeItem.weekdayBias === "weekday");
    return themeItem.pillarHints.includes(pillarId) && biasOk;
  });

  if (matching.length > 0) return matching;
  return MONTHLY_EDITORIAL_THEMES.filter((themeItem) => themeItem.pillarHints.includes(pillarId));
}
