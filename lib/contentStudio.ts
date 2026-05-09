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
  "Mamas e protese de silicone",
  "Mamoplastia redutora",
  "Lipoaspiracao e contorno corporal",
  "Maternidade e pos-gestacao",
  "Naturalidade e seguranca",
  "Autoridade medica",
  "Bastidores e rotina",
  "Quebra de mitos"
];

const baseDate = new Date("2026-05-09T12:00:00.000Z");

export const CONTENT_IDEAS: ReusableContentIdea[] = [
  {
    id: "silicone-nao-e-so-ml",
    title: "Protese de silicone nao se escolhe so por ml",
    pillar: "Mamas e protese de silicone",
    funnelStage: "MOFU",
    mainObjective: "Educar sobre escolha individualizada de implante e reduzir comparacoes simplistas.",
    hook: "O numero de ml nao conta a historia inteira da protese.",
    storiesScript: [
      "Story 1: enquete - voce acha que protese se escolhe por ml?",
      "Story 2: explicar que largura do torax, pele, glandula e objetivo mudam a decisao.",
      "Story 3: exemplo simples de duas pacientes com mesmo ml e resultados diferentes.",
      "Story 4: CTA para salvar e levar duvidas para consulta."
    ],
    shortScript:
      "Muita gente pergunta quantos ml colocar, mas essa nao e a primeira pergunta. A escolha passa por anatomia, largura do torax, pele, volume atual e naturalidade desejada. O mesmo volume pode ficar discreto em uma paciente e exagerado em outra. Por isso, protese boa e protese planejada para o corpo real.",
    tiktokScript:
      "Se alguem te falou 'coloca tantos ml que fica perfeito', cuidado. Protese nao e receita pronta. O que funciona para uma amiga pode ficar pesado, artificial ou inseguro para voce. O planejamento precisa olhar corpo, pele e objetivo.",
    caption: "A escolha da protese e tecnica, individual e precisa respeitar o corpo real.",
    cta: "Salve para lembrar quais fatores discutir na consulta.",
    abVariation: "A: comece com mito dos ml. B: comece com comparacao entre amigas.",
    strategicReason: "Atrai pacientes em pesquisa ativa e posiciona criterio medico antes de promessa estetica.",
    status: "scripted",
    priority: "high",
    suggestedPlatform: "all",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "redutora-nao-e-so-diminuir",
    title: "Mamoplastia redutora nao e so diminuir a mama",
    pillar: "Mamoplastia redutora",
    funnelStage: "MOFU",
    mainObjective: "Mostrar que reducao envolve forma, proporcao, alivio e seguranca.",
    hook: "Reduzir mama nao e simplesmente tirar volume.",
    storiesScript: [
      "Story 1: pergunta - o que mais incomoda, peso, formato ou proporcao?",
      "Story 2: explicar que a cirurgia reposiciona, remodela e busca equilibrio.",
      "Story 3: reforcar que indicacao depende de sintomas, pele e expectativa.",
      "Story 4: CTA para enviar duvidas gerais sobre mamoplastia redutora."
    ],
    shortScript:
      "Na mamoplastia redutora, o objetivo nao e apenas diminuir. O planejamento considera peso, formato, posicao da areola, proporcao corporal e seguranca. Muitas pacientes buscam alivio fisico, mas tambem querem uma mama mais harmonica. E essa conversa precisa ser individual.",
    tiktokScript:
      "Voce acha que mamoplastia redutora e so 'tirar mama'? Nao. Se tirar volume sem planejar forma, proporcao e sustentacao, a cirurgia perde qualidade. Redutora bem indicada tambem e sobre conforto e identidade.",
    caption: "Mamoplastia redutora e sobre proporcao, conforto e planejamento individual.",
    cta: "Compartilhe com alguem que pesquisa sobre reducao mamaria.",
    abVariation: "A: foco em alivio fisico. B: foco em proporcao e autoestima.",
    strategicReason: "Forte potencial educativo para pacientes com dor, desconforto e duvidas sobre indicacao.",
    status: "idea",
    priority: "high",
    suggestedPlatform: "reels",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "lipo-nao-e-emagrecimento",
    title: "Lipoaspiracao nao e emagrecimento",
    pillar: "Lipoaspiracao e contorno corporal",
    funnelStage: "TOFU",
    mainObjective: "Quebrar mito comum e qualificar expectativas antes da consulta.",
    hook: "Lipoaspiracao muda contorno. Ela nao substitui emagrecimento.",
    storiesScript: [
      "Story 1: mito ou verdade - lipo emagrece?",
      "Story 2: explicar diferenca entre gordura localizada e perda de peso.",
      "Story 3: mostrar que indicacao depende de estabilidade, pele e objetivos.",
      "Story 4: CTA para salvar antes de pesquisar preco."
    ],
    shortScript:
      "Lipoaspiracao nao e tratamento para emagrecer. Ela e uma cirurgia de contorno corporal, indicada para gordura localizada em pacientes bem selecionadas. Peso, pele, rotina e expectativa importam muito. Quando a indicacao e errada, a frustracao aparece depois.",
    tiktokScript:
      "Se voce quer fazer lipo para emagrecer, pare um segundo. A lipo nao resolve o que dieta, treino e acompanhamento clinico precisam resolver. Ela pode melhorar contorno, mas precisa de indicacao correta.",
    caption: "Lipoaspiracao e contorno, nao atalho para emagrecimento.",
    cta: "Salve este video antes de comparar promessas na internet.",
    abVariation: "A: abrir com mito direto. B: abrir com 'pare um segundo'.",
    strategicReason: "Filtra expectativa inadequada e fortalece autoridade em seguranca.",
    status: "scripted",
    priority: "medium",
    suggestedPlatform: "tiktok",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "maternidade-reconhecer",
    title: "Depois da maternidade, muitas mulheres querem se reconhecer",
    pillar: "Maternidade e pos-gestacao",
    funnelStage: "TOFU",
    mainObjective: "Acolher dores emocionais sem promessa de resultado.",
    hook: "Nao e sobre apagar a maternidade. E sobre se reconhecer de novo.",
    storiesScript: [
      "Story 1: frase de acolhimento sobre mudancas no corpo pos-gestacao.",
      "Story 2: citar mamas, abdomen e contorno como queixas frequentes.",
      "Story 3: explicar que nem toda mudanca pede cirurgia e avaliacao e essencial.",
      "Story 4: CTA para acompanhar conteudos educativos sobre pos-gestacao."
    ],
    shortScript:
      "Depois da maternidade, muitas mulheres sentem que o corpo mudou de um jeito dificil de nomear. A conversa nao precisa ser sobre voltar ao passado. Pode ser sobre entender o que incomoda, o que e esperado, o que pode melhorar com rotina e o que eventualmente pode ser avaliado em cirurgia.",
    tiktokScript:
      "Seu corpo mudou depois da maternidade e voce nao sabe se e vaidade falar disso? Nao e. Mas tambem nao precisa correr para cirurgia. Primeiro vem avaliacao, contexto, seguranca e uma conversa honesta.",
    caption: "Pos-gestacao pede acolhimento, informacao e indicacao responsavel.",
    cta: "Envie para uma mae que precisa ouvir isso com calma.",
    abVariation: "A: tom emocional. B: tom educativo sobre avaliacao.",
    strategicReason: "Conteudo de conexao para topo de funil e construcao de confianca.",
    status: "idea",
    priority: "medium",
    suggestedPlatform: "stories",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "resultado-tres-meses",
    title: "Resultado com 3 meses: o que ja da para avaliar",
    pillar: "Naturalidade e seguranca",
    funnelStage: "BOFU",
    mainObjective: "Explicar maturacao de resultado e reduzir ansiedade no pos-operatorio.",
    hook: "Tres meses nao e o fim do resultado, mas ja conta muita coisa.",
    storiesScript: [
      "Story 1: explicar que edema e cicatriz ainda estao evoluindo.",
      "Story 2: listar o que costuma poder ser avaliado com seguranca.",
      "Story 3: reforcar acompanhamento e comparacao com planejamento inicial.",
      "Story 4: CTA para nao comparar tempos de recuperacao entre pacientes."
    ],
    shortScript:
      "Com 3 meses, muita coisa ja mudou, mas o resultado ainda esta amadurecendo. Edema, cicatriz e acomodacao dos tecidos seguem evoluindo. O que da para avaliar melhor e a direcao do resultado, a seguranca da recuperacao e se o pos-operatorio esta caminhando como esperado.",
    tiktokScript:
      "Voce viu resultado de 3 meses e achou que ja era definitivo? Calma. Em cirurgia plastica, o corpo ainda esta trabalhando. Tres meses mostram evolucao, nao ponto final.",
    caption: "Resultado cirurgico amadurece. Comparar tempos pode gerar ansiedade desnecessaria.",
    cta: "Salve para rever antes de comparar fotos de pos-operatorio.",
    abVariation: "A: foco em ansiedade. B: foco em educacao sobre cicatriz e edema.",
    strategicReason: "Aproveita criativo historicamente vencedor e transforma prova em educacao responsavel.",
    status: "scripted",
    priority: "high",
    suggestedPlatform: "all",
    createdAt: baseDate,
    updatedAt: baseDate
  },
  {
    id: "nem-toda-mulher-exagero",
    title: "Nem toda mulher quer exagero",
    pillar: "Naturalidade e seguranca",
    funnelStage: "BOFU",
    mainObjective: "Reforcar posicionamento de naturalidade e atrair pacientes alinhadas.",
    hook: "Nem toda mulher quer chamar atencao. Algumas querem naturalidade.",
    storiesScript: [
      "Story 1: frase forte sobre naturalidade como escolha legitima.",
      "Story 2: explicar que planejamento respeita proporcao e identidade.",
      "Story 3: diferenciar naturalidade de resultado sem impacto.",
      "Story 4: CTA para salvar se esse for o tipo de resultado buscado."
    ],
    shortScript:
      "Existe uma ideia de que cirurgia plastica precisa ser evidente. Nem sempre. Muitas mulheres procuram um resultado que combine com a propria identidade, com proporcao e naturalidade. O planejamento precisa ouvir esse desejo e transformar em escolha tecnica segura.",
    tiktokScript:
      "Se voce tem medo de ficar artificial, esse video e para voce. Cirurgia plastica nao precisa gritar. Para muita gente, o melhor resultado e aquele que respeita identidade, proporcao e naturalidade.",
    caption: "Naturalidade tambem e posicionamento. O planejamento precisa respeitar isso.",
    cta: "Salve se naturalidade e parte do resultado que voce procura.",
    abVariation: "A: abrir com medo de artificial. B: abrir com naturalidade como escolha.",
    strategicReason: "Aproveita mensagem BoFu vencedora e qualifica pacientes com preferencia por resultado discreto.",
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
