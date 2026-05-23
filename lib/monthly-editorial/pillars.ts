import type { EditorialPillar, EditorialPillarId } from "@/lib/monthly-editorial/types";

function pillar(data: EditorialPillar): EditorialPillar {
  return data;
}

export const EDITORIAL_PILLARS: EditorialPillar[] = [
  pillar({
    id: "estetica_natural",
    name: "Estetica natural",
    description: "Naturalidade, proporcao e planejamento sem promessa de resultado.",
    recommendedTone: "calmo, visualmente simples, sem exagero",
    compatibleThemes: ["resultado natural", "assimetrias naturais", "naturalidade tambem e planejamento"],
    typicalRisks: ["prometer resultado", "comparar corpos", "usar antes/depois como prova"],
    safePhrases: ["naturalidade tambem e planejamento", "proporcao importa mais do que exagero"],
    recommendedFormats: ["stories", "reel", "carrossel"],
    storyEditorialLine: "estetica_natural"
  }),
  pillar({
    id: "expectativa_realista",
    name: "Expectativa realista",
    description: "Alinhamento de limites, riscos e recuperacao antes da decisao.",
    recommendedTone: "professoral, humano e prudente",
    compatibleThemes: ["expectativa realista em cirurgia plastica", "nao decidir por impulso", "referencia nao e promessa"],
    typicalRisks: ["falar como garantia", "simplificar demais recuperacao"],
    safePhrases: ["expectativa bem alinhada evita muita frustracao", "referencia nao e promessa"],
    recommendedFormats: ["stories", "reel", "post_estatico", "carrossel"],
    storyEditorialLine: "expectativa_realista"
  }),
  pillar({
    id: "seguranca_cirurgia_plastica",
    name: "Seguranca em cirurgia plastica",
    description: "Conteudo educativo sobre criterio, preparo, riscos e decisao responsavel.",
    recommendedTone: "tecnico acessivel",
    compatibleThemes: ["seguranca em cirurgia plastica", "riscos e limites precisam ser conversados", "informacao clara antes da decisao"],
    typicalRisks: ["assustar o paciente", "parecer consulta individual"],
    safePhrases: ["seguranca vem antes da pressa", "informacao clara ajuda mais do que promessa bonita"],
    recommendedFormats: ["stories", "reel", "carrossel", "youtube_video"],
    storyEditorialLine: "ciencia_e_estudo"
  }),
  pillar({
    id: "recuperacao_cicatrizacao",
    name: "Recuperacao e cicatrizacao",
    description: "Explicacao geral sobre tempo, cuidado e variabilidade sem prescricao.",
    recommendedTone: "didatico e cuidadoso",
    compatibleThemes: ["cicatrizacao", "recuperacao", "recuperacao exige paciencia"],
    typicalRisks: ["prometer recuperacao rapida", "dar conduta individual"],
    safePhrases: ["recuperacao precisa ser combinada antes", "cicatrizacao nao cabe em promessa"],
    recommendedFormats: ["stories", "reel", "carrossel"],
    storyEditorialLine: "educacao_medica_simples"
  }),
  pillar({
    id: "bastidores_neutros_humanos",
    name: "Bastidores neutros e humanos",
    description: "Presenca humana sem mostrar local, paciente, agenda, documento ou rotina sensivel.",
    recommendedTone: "natural, curto e editavel",
    compatibleThemes: ["bastidores neutros", "organizacao da semana", "reflexao de fim de dia"],
    typicalRisks: ["inventar rotina do dia", "revelar local", "mostrar tela ou documento"],
    safePhrases: ["dia de organizar ideias", "um lembrete para a semana"],
    recommendedFormats: ["stories", "reel"],
    storyEditorialLine: "bastidor_leve"
  }),
  pillar({
    id: "ciencia_simples",
    name: "Ciencia explicada de forma simples",
    description: "Transforma criterio tecnico em explicacao curta e compreensivel.",
    recommendedTone: "professoral e claro",
    compatibleThemes: ["ciencia simples para pacientes", "estudo e atualizacao medica", "o papel do cirurgiao plastico"],
    typicalRisks: ["parecer aula excessivamente densa", "usar certeza absoluta"],
    safePhrases: ["estudo ajuda a explicar melhor sem simplificar demais", "criterio tecnico tambem e cuidado"],
    recommendedFormats: ["stories", "reel", "carrossel", "youtube_video"],
    storyEditorialLine: "ciencia_e_estudo"
  }),
  pillar({
    id: "sem_marketing_exagerado",
    name: "Cirurgia plastica sem marketing exagerado",
    description: "Contraponto elegante a promessas, urgencia artificial e conteudo apelativo.",
    recommendedTone: "anti-marketing elegante",
    compatibleThemes: ["o que o marketing nao mostra", "cirurgia plastica sem exagero", "consulta nao e venda"],
    typicalRisks: ["criticar outros profissionais", "parecer superioridade"],
    safePhrases: ["menos efeito, mais clareza", "promessa bonita nao substitui avaliacao"],
    recommendedFormats: ["stories", "reel", "post_estatico"],
    storyEditorialLine: "plastica_em_evidencia"
  }),
  pillar({
    id: "plastica_em_evidencia",
    name: "Plastica em Evidencia",
    description: "Temas publicos comentados com calma, sem caso real ou pessoa identificavel.",
    recommendedTone: "conversa publica responsavel",
    compatibleThemes: ["Plastica em Evidencia", "o que o marketing nao mostra", "tema publico com criterio"],
    typicalRisks: ["mencionar caso identificavel", "entrar em polemica pessoal"],
    safePhrases: ["vale olhar para esse tema sem pressa", "um tema que merece calma antes de viralizar"],
    recommendedFormats: ["stories", "reel", "youtube_video"],
    storyEditorialLine: "plastica_em_evidencia"
  }),
  pillar({
    id: "ensino_formacao_medica",
    name: "Ensino, prova e formacao medica",
    description: "Rotina de estudo e ensino com rigor, sem expor dados sensiveis.",
    recommendedTone: "professoral, simples e sobrio",
    compatibleThemes: ["prova de titulo e formacao medica", "estudo e atualizacao medica", "cirurgia plastica baseada em ciencia"],
    typicalRisks: ["mostrar documento sensivel", "sugerir superioridade absoluta"],
    safePhrases: ["estudo ajuda a simplificar sem banalizar", "na medicina, detalhe muda indicacao"],
    recommendedFormats: ["stories", "reel", "carrossel"],
    storyEditorialLine: "ciencia_e_estudo"
  }),
  pillar({
    id: "pericia_clareza_tecnica",
    name: "Pericia medica e clareza tecnica",
    description: "Clareza tecnica e leitura organizada de informacoes, sem misturar projetos externos.",
    recommendedTone: "rigoroso e discreto",
    compatibleThemes: ["pericia medica e clareza tecnica", "clareza tecnica", "separar fatos de opinioes"],
    typicalRisks: ["mostrar processo real", "expor documento", "misturar projeto juridico"],
    safePhrases: ["clareza tecnica ajuda a separar fatos de opinioes", "a leitura tecnica precisa ser clara e revisavel"],
    recommendedFormats: ["stories", "post_estatico", "carrossel"],
    storyEditorialLine: "clareza_tecnica_medica"
  }),
  pillar({
    id: "planejamento_pre_cirurgia",
    name: "Planejamento antes da cirurgia",
    description: "Ajuda o publico a entender etapas gerais antes de decidir.",
    recommendedTone: "orientativo e nao prescritivo",
    compatibleThemes: ["planejamento antes da cirurgia", "decisao consciente", "preparo para consulta"],
    typicalRisks: ["virar checklist individual", "parecer consulta online"],
    safePhrases: ["antes de decidir, vale entender limites e recuperacao", "cuidado bom comeca com decisao bem pensada"],
    recommendedFormats: ["stories", "reel", "carrossel"],
    storyEditorialLine: "expectativa_realista"
  }),
  pillar({
    id: "limites_cirurgia_plastica",
    name: "Limites da cirurgia plastica",
    description: "Explica o que a cirurgia pode e nao pode prometer, com prudencia.",
    recommendedTone: "direto, responsavel e humano",
    compatibleThemes: ["limites da cirurgia plastica", "riscos e limites precisam ser conversados", "cirurgia plastica nao combina com pressa"],
    typicalRisks: ["assustar", "prometer correcao total"],
    safePhrases: ["limite tambem faz parte de um bom plano", "cada decisao precisa respeitar limites, riscos e contexto"],
    recommendedFormats: ["stories", "reel", "carrossel"],
    storyEditorialLine: "expectativa_realista"
  }),
  pillar({
    id: "comunicacao_medico_paciente",
    name: "Comunicacao medico-paciente",
    description: "Valoriza conversa clara, duvidas gerais e decisao compartilhada sem caso individual.",
    recommendedTone: "acolhedor e explicativo",
    compatibleThemes: ["conversa clara antes de operar", "importancia da consulta", "consulta nao e venda"],
    typicalRisks: ["parecer diagnostico por story", "pedir fotos ou DMs clinicas"],
    safePhrases: ["avaliacao boa organiza melhor a decisao", "duvida geral merece resposta clara"],
    recommendedFormats: ["stories", "reel", "post_estatico"],
    storyEditorialLine: "educacao_medica_simples"
  }),
  pillar({
    id: "naturalidade_sem_promessa",
    name: "Naturalidade sem promessa",
    description: "Reforca naturalidade como criterio, nao como garantia.",
    recommendedTone: "sobrio, visual e sem promessa",
    compatibleThemes: ["naturalidade sem promessa", "resultado natural", "referencia nao e promessa"],
    typicalRisks: ["usar natural como promessa de resultado", "vender transformacao"],
    safePhrases: ["naturalidade tambem e planejamento", "resultado bonito precisa fazer sentido para aquela pessoa"],
    recommendedFormats: ["stories", "reel", "post_estatico", "carrossel"],
    storyEditorialLine: "estetica_natural"
  }),
  pillar({
    id: "decisao_consciente",
    name: "Decisao consciente",
    description: "Conteudo para reduzir impulso, pressa e decisao baseada em promessa.",
    recommendedTone: "calmo, reflexivo e pratico",
    compatibleThemes: ["decisao consciente", "nao decidir por impulso", "cirurgia plastica nao combina com pressa"],
    typicalRisks: ["usar medo como venda", "parecer sermão"],
    safePhrases: ["cirurgia plastica nao combina com pressa", "antes de decidir, vale entender uma coisa simples"],
    recommendedFormats: ["stories", "reel", "carrossel"],
    storyEditorialLine: "expectativa_realista"
  })
];

export function getEditorialPillarById(id: EditorialPillarId | string | undefined): EditorialPillar | null {
  if (!id) return null;
  return EDITORIAL_PILLARS.find((pillar) => pillar.id === id) ?? null;
}

export function getDefaultPriorityPillars(): EditorialPillarId[] {
  return [
    "expectativa_realista",
    "estetica_natural",
    "seguranca_cirurgia_plastica",
    "bastidores_neutros_humanos",
    "sem_marketing_exagerado",
    "plastica_em_evidencia"
  ];
}
