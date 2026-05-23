import type { StoryEditorialLine, StoryMediaCategory, StoryMediaSuggestion, StoryTheme } from "@/lib/storyops/types";

export const STORY_EDITORIAL_LINES: Array<{ id: StoryEditorialLine; label: string; description: string }> = [
  {
    id: "bastidor_leve",
    label: "Bastidor leve",
    description: "Presenca humana sem localizar, expor agenda, paciente ou rotina especifica."
  },
  {
    id: "educacao_medica_simples",
    label: "Educacao medica simples",
    description: "Explicacao curta, acessivel e sem conduta individual."
  },
  {
    id: "estetica_natural",
    label: "Estetica natural",
    description: "Naturalidade, proporcao e planejamento sem promessa de resultado."
  },
  {
    id: "expectativa_realista",
    label: "Expectativa realista",
    description: "Alinhamento de limites, riscos e recuperacao antes da decisao."
  },
  {
    id: "rotina_profissional_neutra",
    label: "Rotina profissional neutra",
    description: "Rotina editavel e nao localizada, sem afirmar que algo ocorre agora."
  },
  {
    id: "reflexao_fim_de_dia",
    label: "Reflexao de fim de dia",
    description: "Tom leve, humano e reflexivo, bom para domingo ou fechamento do dia."
  },
  {
    id: "ciencia_e_estudo",
    label: "Prova, estudo e ciencia",
    description: "Estudo, atualizacao e criterio tecnico sem mostrar dados sensiveis."
  },
  {
    id: "plastica_em_evidencia",
    label: "Plastica em Evidencia",
    description: "Comentario educativo de tema publico sem caso real ou pessoa identificavel."
  },
  {
    id: "clareza_tecnica_medica",
    label: "Clareza tecnica medica",
    description: "Pericia tecnica, rigor e clareza sem misturar identidades de outros projetos."
  }
];

export const STORYOPS_INITIAL_THEMES: StoryTheme[] = [
  theme("expectativa-realista", "expectativa realista em cirurgia plastica", "expectativa_realista", ["expectativa", "limites"]),
  theme("resultado-natural", "resultado natural", "estetica_natural", ["naturalidade", "resultado"]),
  theme("planejamento-antes-cirurgia", "planejamento antes da cirurgia", "expectativa_realista", ["planejamento", "seguranca"]),
  theme("importancia-consulta", "importancia da consulta", "educacao_medica_simples", ["consulta", "avaliacao"]),
  theme("limites-cirurgia", "limites da cirurgia plastica", "expectativa_realista", ["limites", "seguranca"]),
  theme("cicatrizacao", "cicatrizacao", "educacao_medica_simples", ["cicatrizacao", "recuperacao"]),
  theme("recuperacao", "recuperacao", "educacao_medica_simples", ["recuperacao", "pos-operatorio"]),
  theme("assimetrias-naturais", "assimetrias naturais", "estetica_natural", ["assimetria", "naturalidade"]),
  theme("seguranca", "seguranca em cirurgia plastica", "ciencia_e_estudo", ["seguranca", "criterio"]),
  theme("nao-decidir-impulso", "nao decidir por impulso", "expectativa_realista", ["decisao", "pressa"]),
  theme("autoestima-sem-promessa", "cirurgia plastica e autoestima sem promessa", "estetica_natural", ["autoestima", "promessa"]),
  theme("estudo-atualizacao", "estudo e atualizacao medica", "ciencia_e_estudo", ["estudo", "atualizacao"]),
  theme("bastidor-domingo", "bastidor neutro de domingo", "bastidor_leve", ["domingo", "bastidor"]),
  theme("organizacao-semana", "organizacao da semana", "rotina_profissional_neutra", ["semana", "organizacao"]),
  theme("reflexao-fim-dia", "reflexao de fim de dia", "reflexao_fim_de_dia", ["reflexao", "fim de dia"]),
  theme("plastica-evidencia", "Plastica em Evidencia", "plastica_em_evidencia", ["programa", "tema publico"]),
  theme("prova-titulo-estudo", "prova de titulo e estudo em cirurgia plastica", "ciencia_e_estudo", ["prova", "estudo"]),
  theme("pericia-clareza", "pericia medica e clareza tecnica", "clareza_tecnica_medica", ["pericia", "tecnica"])
];

export const SAFE_STORY_PHRASES: Record<string, string[]> = {
  humano: [
    "passando rapido para deixar uma ideia",
    "uma coisa simples para pensar com calma",
    "isso aparece muito nas conversas sobre cirurgia plastica"
  ],
  educativo: [
    "antes de decidir, vale entender limites e recuperacao",
    "informacao clara ajuda mais do que promessa bonita",
    "nem tudo que parece simples no Instagram e simples na medicina"
  ],
  reflexivo: [
    "nem sempre o mais chamativo e o mais importante",
    "cirurgia plastica nao combina com pressa",
    "cuidado bom comeca com decisao bem pensada"
  ],
  bastidor_neutro: [
    "dia de organizar ideias",
    "um lembrete para a semana",
    "pensando em um tema importante"
  ],
  cientifico_simples: [
    "criterio tecnico tambem e cuidado",
    "na medicina, detalhe muda indicacao",
    "estudo ajuda a simplificar sem banalizar"
  ],
  anti_marketing_elegante: [
    "promessa bonita nao substitui avaliacao",
    "menos efeito, mais clareza",
    "o melhor conteudo aqui e o que ajuda a decidir melhor"
  ],
  expectativa_realista: [
    "expectativa bem alinhada evita muita frustracao",
    "referencia nao e promessa",
    "limite tambem faz parte de um bom plano"
  ],
  estetica_natural: [
    "naturalidade tambem e planejamento",
    "resultado bonito precisa fazer sentido para aquela pessoa",
    "proporcao importa mais do que exagero"
  ]
};

export const STORYOPS_RISK_PHRASES = [
  "resultado garantido",
  "transformacao completa",
  "corpo perfeito",
  "sem risco",
  "sem cicatriz",
  "recuperacao rapida garantida",
  "melhor tecnica",
  "definitivo",
  "nunca",
  "sempre",
  "agende agora",
  "ultimas vagas",
  "antes e depois",
  "paciente de hoje",
  "cirurgia de hoje",
  "no hospital agora",
  "aqui na clinica agora",
  "eu indico para voce",
  "voce precisa fazer",
  "tratamento ideal para voce"
];

export const STORYOPS_MEDIA_SUGGESTIONS: Record<StoryMediaCategory, StoryMediaSuggestion> = {
  selfie_neutra: media("selfie_neutra", "Selfie neutra", "Video curto falando para camera, com fundo neutro e sem local identificavel.", "Gravar 3 a 6 segundos, enquadramento fechado, sem placas, telas ou pessoas ao fundo.", "Conferir que nao aparece agenda, paciente, instituicao, cracha ou tela."),
  mesa_agenda_cafe: media("mesa_agenda_cafe", "Mesa, agenda ou cafe", "Foto rapida de mesa neutra, caneta, cafe ou caderno sem dados.", "Usar close fechado e remover qualquer folha com nome, horario, telefone ou prontuario.", "Nao mostrar tela, documento, etiqueta, logo de hospital ou endereco."),
  livro_artigo: media("livro_artigo", "Livro ou artigo", "Imagem de estudo, livro ou artigo sem dados sensiveis.", "Mostrar apenas capa generica, trecho nao sensivel ou pagina desfocada.", "Evitar nomes, imagens clinicas, casos e conteudo identificavel."),
  fundo_simples: media("fundo_simples", "Fundo simples", "Parede, textura, mesa ou objeto neutro para texto curto.", "Criar foto vertical simples, sem tentar parecer arte publicitaria.", "Baixo risco se nao houver local, marca ou pessoa identificavel."),
  video_curto_falando: media("video_curto_falando", "Video curto falando", "Fala espontanea de 5 a 12 segundos para apoiar a frase do dia.", "Gravar como story nativo, sem roteiro longo e com uma ideia por story.", "Nao mencionar agenda, paciente, local ou conduta individual."),
  ceu_fim_de_dia: media("ceu_fim_de_dia", "Ceu ou fim de dia", "Imagem leve para reflexao, sem revelar endereco ou deslocamento.", "Evitar placas, predios reconheciveis, rua e geolocalizacao visual.", "Usar texto neutro, sem dizer que esta em um local especifico."),
  print_post_antigo: media("print_post_antigo", "Print de post antigo", "Print limpo de conteudo proprio ja publicado e aprovado.", "Cortar metricas, comentarios, nomes e qualquer identificacao de terceiros.", "Revisar direitos, contexto e ausencia de paciente."),
  bastidor_nao_identificavel: media("bastidor_nao_identificavel", "Bastidor nao identificavel", "Detalhe de rotina sem local, paciente, equipe ou agenda.", "Mostrar apenas objeto, mao, livro, caneta ou ambiente muito fechado.", "Nao sugerir que esta acontecendo agora se a imagem for de acervo."),
  arte_simples_inevitavel: media("arte_simples_inevitavel", "Arte simples inevitavel", "Arte minima usada so quando nao houver foto/video natural.", "Manter com cara de sticker nativo e texto curto, sem Canva elaborado.", "Nao transformar stories em campanha montada.")
};

function theme(id: string, label: string, suggestedLine: StoryEditorialLine, keywords: string[]): StoryTheme {
  return { id, label, suggestedLine, keywords };
}

function media(
  category: StoryMediaCategory,
  label: string,
  description: string,
  captureGuidance: string,
  privacyNote: string
): StoryMediaSuggestion {
  return { category, label, description, captureGuidance, privacyNote };
}
