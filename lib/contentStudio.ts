export type ContentFunnelStage = "TOFU" | "MOFU" | "BOFU";
export type ContentStatus = "idea" | "scripted" | "recorded" | "edited" | "scheduled" | "published";
export type ContentPriority = "low" | "medium" | "high";
export type SuggestedPlatform = "stories" | "reels" | "shorts" | "tiktok" | "all";

export type ReusableContentIdea = {
  id: string;
  title: string;
  pillar: string;
  funnelStage: ContentFunnelStage;
  mainObjective: string;
  hook: string;
  storiesScript: string[];
  shortScript: string;
  tiktokScript: string;
  caption: string;
  cta: string;
  abVariation: string;
  strategicReason: string;
  status: ContentStatus;
  priority: ContentPriority;
  suggestedPlatform: SuggestedPlatform;
  createdAt: Date;
  updatedAt: Date;
};

export type ContentStudioFilters = {
  pillar?: string;
  funnelStage?: ContentFunnelStage;
  status?: ContentStatus;
  priority?: ContentPriority;
};

export const CONTENT_PILLARS = [
  "Mamas e prótese de silicone",
  "Mamoplastia redutora",
  "Lipoaspiração e contorno corporal",
  "Maternidade e pós-gestação",
  "Naturalidade e segurança",
  "Autoridade médica",
  "Bastidores e rotina",
  "Quebra de mitos"
];

const baseDate = new Date("2026-05-09T12:00:00.000Z");

export const CONTENT_IDEAS: ReusableContentIdea[] = [
  {
    id: "silicone-nao-e-so-ml",
    title: "Prótese de silicone não se escolhe só por ml",
    pillar: "Mamas e prótese de silicone",
    funnelStage: "MOFU",
    mainObjective: "Educar sobre escolha individualizada de implante e reduzir comparações simplistas.",
    hook: "O número de ml não conta a história inteira da prótese.",
    storiesScript: [
      "Story 1: enquete - você acha que prótese se escolhe por ml?",
      "Story 2: explicar que largura do tórax, pele, glândula e objetivo mudam a decisão.",
      "Story 3: exemplo simples de duas pacientes com mesmo ml e resultados diferentes.",
      "Story 4: CTA para salvar e levar dúvidas para consulta."
    ],
    shortScript:
      "Muita gente pergunta quantos ml colocar, mas essa não é a primeira pergunta. A escolha passa por anatomia, largura do tórax, pele, volume atual e naturalidade desejada. O mesmo volume pode ficar discreto em uma paciente e exagerado em outra. Por isso, prótese boa é prótese planejada para o corpo real.",
    tiktokScript:
      "Se alguém te falou 'coloca tantos ml que fica perfeito', cuidado. Prótese não é receita pronta. O que funciona para uma amiga pode ficar pesado, artificial ou inseguro para você. O planejamento precisa olhar corpo, pele e objetivo.",
    caption: "A escolha da prótese é técnica, individual e precisa respeitar o corpo real.",
    cta: "Salve para lembrar quais fatores discutir na consulta.",
    abVariation: "A: comece com mito dos ml. B: comece com comparação entre amigas.",
    strategicReason: "Atrai pacientes em pesquisa ativa e posiciona critério médico antes de promessa estética.",
    status: "scripted",
    priority: "high",
    suggestedPlatform: "all",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "redutora-nao-e-so-diminuir",
    title: "Mamoplastia redutora não é só diminuir a mama",
    pillar: "Mamoplastia redutora",
    funnelStage: "MOFU",
    mainObjective: "Mostrar que redução envolve forma, proporção, alívio e segurança.",
    hook: "Reduzir mama não é simplesmente tirar volume.",
    storiesScript: [
      "Story 1: pergunta - o que mais incomoda, peso, formato ou proporção?",
      "Story 2: explicar que a cirurgia reposiciona, remodela e busca equilíbrio.",
      "Story 3: reforçar que indicação depende de sintomas, pele e expectativa.",
      "Story 4: CTA para enviar dúvidas gerais sobre mamoplastia redutora."
    ],
    shortScript:
      "Na mamoplastia redutora, o objetivo não é apenas diminuir. O planejamento considera peso, formato, posição da aréola, proporção corporal e segurança. Muitas pacientes buscam alívio físico, mas também querem uma mama mais harmônica. E essa conversa precisa ser individual.",
    tiktokScript:
      "Você acha que mamoplastia redutora é só 'tirar mama'? Não. Se tirar volume sem planejar forma, proporção e sustentação, a cirurgia perde qualidade. Redutora bem indicada também é sobre conforto e identidade.",
    caption: "Mamoplastia redutora é sobre proporção, conforto e planejamento individual.",
    cta: "Compartilhe com alguém que pesquisa sobre redução mamária.",
    abVariation: "A: foco em alívio físico. B: foco em proporção e autoestima.",
    strategicReason: "Forte potencial educativo para pacientes com dor, desconforto e dúvidas sobre indicação.",
    status: "idea",
    priority: "high",
    suggestedPlatform: "reels",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "lipo-nao-e-emagrecimento",
    title: "Lipoaspiração não é emagrecimento",
    pillar: "Lipoaspiração e contorno corporal",
    funnelStage: "TOFU",
    mainObjective: "Quebrar mito comum e qualificar expectativas antes da consulta.",
    hook: "Lipoaspiração muda contorno. Ela não substitui emagrecimento.",
    storiesScript: [
      "Story 1: mito ou verdade - lipo emagrece?",
      "Story 2: explicar diferença entre gordura localizada e perda de peso.",
      "Story 3: mostrar que indicação depende de estabilidade, pele e objetivos.",
      "Story 4: CTA para salvar antes de pesquisar preço."
    ],
    shortScript:
      "Lipoaspiração não é tratamento para emagrecer. Ela é uma cirurgia de contorno corporal, indicada para gordura localizada em pacientes bem selecionadas. Peso, pele, rotina e expectativa importam muito. Quando a indicação é errada, a frustração aparece depois.",
    tiktokScript:
      "Se você quer fazer lipo para emagrecer, pare um segundo. A lipo não resolve o que dieta, treino e acompanhamento clínico precisam resolver. Ela pode melhorar contorno, mas precisa de indicação correta.",
    caption: "Lipoaspiração é contorno, não atalho para emagrecimento.",
    cta: "Salve este vídeo antes de comparar promessas na internet.",
    abVariation: "A: abrir com mito direto. B: abrir com 'pare um segundo'.",
    strategicReason: "Filtra expectativa inadequada e fortalece autoridade em segurança.",
    status: "scripted",
    priority: "medium",
    suggestedPlatform: "tiktok",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "maternidade-reconhecer",
    title: "Depois da maternidade, muitas mulheres querem se reconhecer",
    pillar: "Maternidade e pós-gestação",
    funnelStage: "TOFU",
    mainObjective: "Acolher dores emocionais sem promessa de resultado.",
    hook: "Não é sobre apagar a maternidade. É sobre se reconhecer de novo.",
    storiesScript: [
      "Story 1: frase de acolhimento sobre mudanças no corpo pós-gestação.",
      "Story 2: citar mamas, abdômen e contorno como queixas frequentes.",
      "Story 3: explicar que nem toda mudança pede cirurgia e avaliação é essencial.",
      "Story 4: CTA para acompanhar conteúdos educativos sobre pós-gestação."
    ],
    shortScript:
      "Depois da maternidade, muitas mulheres sentem que o corpo mudou de um jeito difícil de nomear. A conversa não precisa ser sobre voltar ao passado. Pode ser sobre entender o que incomoda, o que é esperado, o que pode melhorar com rotina e o que eventualmente pode ser avaliado em cirurgia.",
    tiktokScript:
      "Seu corpo mudou depois da maternidade e você não sabe se é vaidade falar disso? Não é. Mas também não precisa correr para cirurgia. Primeiro vem avaliação, contexto, segurança e uma conversa honesta.",
    caption: "Pós-gestação pede acolhimento, informação e indicação responsável.",
    cta: "Envie para uma mãe que precisa ouvir isso com calma.",
    abVariation: "A: tom emocional. B: tom educativo sobre avaliação.",
    strategicReason: "Conteúdo de conexão para topo de funil e construção de confiança.",
    status: "idea",
    priority: "medium",
    suggestedPlatform: "stories",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "resultado-tres-meses",
    title: "Resultado com 3 meses: o que já dá para avaliar",
    pillar: "Naturalidade e segurança",
    funnelStage: "BOFU",
    mainObjective: "Explicar maturação de resultado e reduzir ansiedade no pós-operatório.",
    hook: "Três meses não é o fim do resultado, mas já conta muita coisa.",
    storiesScript: [
      "Story 1: explicar que edema e cicatriz ainda estão evoluindo.",
      "Story 2: listar o que costuma poder ser avaliado com segurança.",
      "Story 3: reforçar acompanhamento e comparação com planejamento inicial.",
      "Story 4: CTA para não comparar tempos de recuperação entre pacientes."
    ],
    shortScript:
      "Com 3 meses, muita coisa já mudou, mas o resultado ainda está amadurecendo. Edema, cicatriz e acomodação dos tecidos seguem evoluindo. O que dá para avaliar melhor é a direção do resultado, a segurança da recuperação e se o pós-operatório está caminhando como esperado.",
    tiktokScript:
      "Você viu resultado de 3 meses e achou que já era definitivo? Calma. Em cirurgia plástica, o corpo ainda está trabalhando. Três meses mostram evolução, não ponto final.",
    caption: "Resultado cirúrgico amadurece. Comparar tempos pode gerar ansiedade desnecessária.",
    cta: "Salve para rever antes de comparar fotos de pós-operatório.",
    abVariation: "A: foco em ansiedade. B: foco em educação sobre cicatriz e edema.",
    strategicReason: "Aproveita criativo historicamente vencedor e transforma prova em educação responsável.",
    status: "scripted",
    priority: "high",
    suggestedPlatform: "all",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "nem-toda-mulher-exagero",
    title: "Nem toda mulher quer exagero",
    pillar: "Naturalidade e segurança",
    funnelStage: "BOFU",
    mainObjective: "Reforçar posicionamento de naturalidade e atrair pacientes alinhadas.",
    hook: "Nem toda mulher quer chamar atenção. Algumas querem naturalidade.",
    storiesScript: [
      "Story 1: frase forte sobre naturalidade como escolha legitima.",
      "Story 2: explicar que planejamento respeita proporção e identidade.",
      "Story 3: diferenciar naturalidade de resultado sem impacto.",
      "Story 4: CTA para salvar se esse for o tipo de resultado buscado."
    ],
    shortScript:
      "Existe uma ideia de que cirurgia plastica precisa ser evidente. Nem sempre. Muitas mulheres procuram um resultado que combine com a propria identidade, com proporção e naturalidade. O planejamento precisa ouvir esse desejo e transformar em escolha tecnica segura.",
    tiktokScript:
      "Se você tem medo de ficar artificial, este vídeo é para você. Cirurgia plástica não precisa gritar. Para muita gente, o melhor resultado é aquele que respeita identidade, proporção e naturalidade.",
    caption: "Naturalidade também é posicionamento. O planejamento precisa respeitar isso.",
    cta: "Salve se naturalidade e parte do resultado que você procura.",
    abVariation: "A: abrir com medo de artificial. B: abrir com naturalidade como escolha.",
    strategicReason: "Aproveita mensagem BoFu vencedora e qualifica pacientes com preferência por resultado discreto.",
    status: "scripted",
    priority: "high",
    suggestedPlatform: "all",
    createdAt: baseDate,
    updatedAt: baseDate
  }
];

export function filterContentIdeas(ideas: ReusableContentIdea[], filters: ContentStudioFilters): ReusableContentIdea[] {
  return ideas.filter((idea) => {
    if (filters.pillar && idea.pillar !== filters.pillar) return false;
    if (filters.funnelStage && idea.funnelStage !== filters.funnelStage) return false;
    if (filters.status && idea.status !== filters.status) return false;
    if (filters.priority && idea.priority !== filters.priority) return false;
    return true;
  });
}

export function getContentIdeaById(id: string | undefined, ideas: ReusableContentIdea[] = CONTENT_IDEAS): ReusableContentIdea | null {
  if (!id) return null;
  return ideas.find((idea) => idea.id === id) ?? null;
}

export function funnelStageLabel(value: ContentFunnelStage): string {
  return { TOFU: "Topo de funil", MOFU: "Meio de funil", BOFU: "Fundo de funil" }[value];
}

export function contentStatusLabel(value: ContentStatus): string {
  return {
    idea: "Ideia",
    scripted: "Roteirizado",
    recorded: "Gravado",
    edited: "Editado",
    scheduled: "Agendado",
    published: "Publicado"
  }[value];
}

export function suggestedPlatformLabel(value: SuggestedPlatform): string {
  return {
    stories: "Stories",
    reels: "Reels",
    shorts: "Shorts",
    tiktok: "TikTok",
    all: "Todos"
  }[value];
}
