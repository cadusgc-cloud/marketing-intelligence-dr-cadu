import type { CaptionAtom, ContentLibraryInventory, ContentPillar, HookAtom, StoryAtom } from "@/lib/content-studio/types";

export const CONTENT_STUDIO_PILLARS: ContentPillar[] = [
  pillar("estetica_natural", "Estetica natural", "Beleza com proporcao, identidade e criterio tecnico."),
  pillar("expectativa_realista", "Expectativa realista", "Alinhamento de limites, riscos e tempo antes de qualquer decisao."),
  pillar("seguranca", "Seguranca", "Seguranca em cirurgia plastica antes da pressa ou da promessa."),
  pillar("recuperacao_cicatrizacao", "Recuperacao e cicatrizacao", "Recuperacao sem romantizar, sem prometer e sem comparar pacientes."),
  pillar("consulta_nao_e_venda", "Consulta nao e venda", "Consulta como conversa tecnica, escuta e alinhamento."),
  pillar("decisao_consciente", "Decisao consciente", "Decidir com calma, informacao e maturidade."),
  pillar("plastica_em_evidencia", "Plastica em Evidencia", "Leitura educativa de temas que aparecem muito no marketing."),
  pillar("ciencia_simples", "Ciencia simples", "Explicacao acessivel sem reduzir demais a medicina."),
  pillar("bastidor_neutro", "Bastidor neutro", "Rotina editavel, discreta, sem local, paciente ou agenda real."),
  pillar("formacao_medica", "Formacao medica", "Estudo, ensino e atualizacao com sobriedade."),
  pillar("pericia_clareza_tecnica", "Pericia medica e clareza tecnica", "Clareza, metodo e linguagem tecnica sem sensacionalismo."),
  pillar("cirurgia_sem_promessa", "Cirurgia plastica sem promessa", "Anti-marketing elegante e responsavel.")
];

export const CONTENT_STUDIO_THEMES = [
  "cirurgia plastica nao combina com pressa",
  "naturalidade tambem e planejamento",
  "expectativa realista evita frustracao",
  "consulta nao e venda",
  "cicatrizacao exige paciencia",
  "recuperacao nao e competicao",
  "o que o marketing nao mostra",
  "antes de decidir entenda limites",
  "estetica natural e identidade",
  "seguranca vem antes da pressa",
  "resultado bonito precisa fazer sentido",
  "assimetrias naturais existem",
  "corpo real nao e molde",
  "planejamento reduz improviso",
  "informacao clara antes da decisao",
  "ciencia simples para pacientes",
  "cirurgia plastica sem exagero",
  "autoestima sem promessa",
  "conversa honesta antes de operar",
  "riscos precisam ser conversados",
  "recuperacao precisa de tempo",
  "expectativas precisam ser alinhadas",
  "opiniao tecnica nao e propaganda",
  "bastidor neutro de estudo",
  "organizacao da semana",
  "reflexao de fim de dia",
  "plastica em evidencia",
  "prova de titulo",
  "formacao medica seria",
  "pericia medica e linguagem clara",
  "limite entre desejo e indicacao",
  "cuidado individual sem promessa",
  "o papel do cirurgiao plastico",
  "seguranca na escolha do profissional",
  "decisao consciente",
  "o perigo da pressa",
  "marketing medico exagerado",
  "natural nao e pouco",
  "exagero nao e sinonimo de beleza",
  "tecnica e julgamento caminham juntos",
  "cirurgia plastica nao e produto de prateleira",
  "consulta como alinhamento",
  "maturidade na decisao",
  "pos-operatorio sem romantizacao",
  "cicatriz existe",
  "resultado depende de varios fatores",
  "saude antes da estetica",
  "comunicacao clara",
  "duvida boa e duvida conversada",
  "planejamento fotografico sem antes e depois",
  "rotina profissional neutra",
  "estudo e atualizacao",
  "bastidor sem exposicao",
  "conteudo medico com responsabilidade",
  "beleza sem padronizacao",
  "individualidade",
  "medicina e prudencia",
  "menos promessa mais clareza",
  "confianca se constroi",
  "escolha informada",
  "avaliacao tecnica sem pressa",
  "educacao antes da decisao",
  "mama pele e expectativa",
  "lipo nao substitui emagrecimento",
  "abdome exige planejamento",
  "tempo de recuperacao importa",
  "duvidas frequentes sem consulta disfarçada",
  "rotina de estudo sem expor local",
  "conteudo leve para fim de semana",
  "por que promessa bonita preocupa",
  "como pensar em seguranca sem medo",
  "clareza antes de qualquer procedimento"
];

const hookStyles: HookAtom["style"][] = ["educativo", "reflexivo", "anti_marketing", "bastidor", "cientifico", "naturalidade", "seguranca"];
const hookPrefixes = [
  "Uma coisa que vale lembrar:",
  "Antes de decidir, pense nisso:",
  "Nem tudo que parece simples no Instagram e simples na medicina:",
  "Uma conversa honesta comeca aqui:",
  "O ponto menos chamativo talvez seja o mais importante:",
  "Para olhar com calma:",
  "A pergunta que ajuda a organizar a decisao:",
  "Sem pressa e sem promessa:"
];

export const CONTENT_STUDIO_HOOKS: HookAtom[] = buildAtoms(84, "hook", (index) => ({
  id: `hook-${index + 1}`,
  category: "hook",
  style: hookStyles[index % hookStyles.length],
  text: `${hookPrefixes[index % hookPrefixes.length]} ${CONTENT_STUDIO_THEMES[index % CONTENT_STUDIO_THEMES.length]}.`,
  tags: [hookStyles[index % hookStyles.length], CONTENT_STUDIO_THEMES[index % CONTENT_STUDIO_THEMES.length]]
}));

const storyPrefixes = [
  "isso merece calma",
  "uma ideia para guardar",
  "sem pressa para decidir",
  "naturalidade tambem tem limite",
  "informacao clara ajuda",
  "medicina nao combina com promessa",
  "vale conversar sobre isso",
  "menos frase pronta, mais criterio"
];

export const CONTENT_STUDIO_STORY_PHRASES: StoryAtom[] = buildAtoms(88, "story", (index) => ({
  id: `story-phrase-${index + 1}`,
  category: "story",
  text: `${storyPrefixes[index % storyPrefixes.length]}: ${shortTheme(CONTENT_STUDIO_THEMES[index % CONTENT_STUDIO_THEMES.length])}`,
  tags: ["story", "sticker", CONTENT_STUDIO_THEMES[index % CONTENT_STUDIO_THEMES.length]],
  mediaHint: ["selfie neutra", "fundo simples", "mesa com agenda", "livro ou artigo", "video curto falando", "imagem de fim de dia"][index % 6]
}));

export const CONTENT_STUDIO_REEL_HOOKS = buildList(44, (index) => {
  const starts = [
    "Uma coisa que muita gente esquece antes de pensar em cirurgia plastica:",
    "Nem sempre o que chama atencao e o que mais importa.",
    "Antes de decidir, vale entender uma coisa simples:",
    "Cirurgia plastica nao combina com pressa.",
    "Naturalidade tambem e planejamento.",
    "Expectativa bem alinhada evita muita frustracao.",
    "O marketing costuma simplificar demais este tema:",
    "Uma consulta boa nao deveria parecer uma venda."
  ];
  return `${starts[index % starts.length]} ${shortTheme(CONTENT_STUDIO_THEMES[index % CONTENT_STUDIO_THEMES.length])}.`;
});

export const CONTENT_STUDIO_CAROUSEL_TEMPLATES = buildList(22, (index) => [
  `${index + 1}. ${shortTheme(CONTENT_STUDIO_THEMES[index % CONTENT_STUDIO_THEMES.length])}`,
  "O que costuma gerar duvida",
  "O ponto tecnico em linguagem simples",
  "O limite que precisa ser conversado",
  "Como pensar com mais calma",
  "Fechamento: decisao consciente"
]);

const captionStyles: CaptionAtom["style"][] = ["neutra", "reflexiva", "educativa", "anti_marketing"];
export const CONTENT_STUDIO_CAPTIONS: CaptionAtom[] = buildAtoms(44, "caption", (index) => ({
  id: `caption-${index + 1}`,
  category: "caption",
  style: captionStyles[index % captionStyles.length],
  text: `${capitalize(CONTENT_STUDIO_THEMES[index % CONTENT_STUDIO_THEMES.length])}. Um conteudo para pensar com calma, sem promessa e sem decisao apressada.`,
  tags: [captionStyles[index % captionStyles.length]]
}));

export const CONTENT_STUDIO_FORBIDDEN_TERMS = [
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
  "antes/depois",
  "paciente de hoje",
  "cirurgia de hoje",
  "no hospital agora",
  "aqui na clinica",
  "aqui no hospital",
  "eu indico para voce",
  "voce precisa fazer",
  "tratamento ideal para voce",
  "imperdivel",
  "promocao",
  "desconto",
  "vagas limitadas",
  "oportunidade unica",
  "diagnostico",
  "prescrevo",
  "prontuario",
  "exame identificavel",
  "endereco"
];

export function getContentLibraryInventory(): ContentLibraryInventory {
  return {
    pillars: CONTENT_STUDIO_PILLARS,
    themes: CONTENT_STUDIO_THEMES,
    hooks: CONTENT_STUDIO_HOOKS,
    storyPhrases: CONTENT_STUDIO_STORY_PHRASES,
    reelHooks: CONTENT_STUDIO_REEL_HOOKS,
    carouselTemplates: CONTENT_STUDIO_CAROUSEL_TEMPLATES,
    captions: CONTENT_STUDIO_CAPTIONS,
    forbiddenTerms: CONTENT_STUDIO_FORBIDDEN_TERMS
  };
}

export function findContentStudioPillar(id?: string): ContentPillar {
  return CONTENT_STUDIO_PILLARS.find((pillarItem) => pillarItem.id === id) ?? CONTENT_STUDIO_PILLARS[0];
}

export function filterLibraryByPillar(pillarId: string) {
  const pillarItem = findContentStudioPillar(pillarId);
  const normalizedName = normalize(pillarItem.name);
  return CONTENT_STUDIO_THEMES.filter((theme) => normalize(theme).includes(normalizedName.split(" ")[0]) || pillarItem.description.toLowerCase().includes(normalize(theme).split(" ")[0]));
}

export function filterLibraryByFormat(format: string) {
  return CONTENT_STUDIO_PILLARS.filter((pillarItem) => pillarItem.formats.includes(format as never));
}

function pillar(id: string, name: string, description: string): ContentPillar {
  return {
    id,
    name,
    description,
    recommendedTone: "humano, cientifico simples, anti-marketing elegante",
    formats: ["stories", "reel", "carrossel", "post_estatico", "legenda", "briefing_editor", "pacote_completo"],
    riskNotes: ["evitar promessa", "evitar antes/depois", "evitar paciente/local", "manter revisao humana"]
  };
}

function buildAtoms<T>(count: number, _label: string, factory: (index: number) => T): T[] {
  return Array.from({ length: count }, (_, index) => factory(index));
}

function buildList<T>(count: number, factory: (index: number) => T): T[] {
  return Array.from({ length: count }, (_, index) => factory(index));
}

function shortTheme(theme: string): string {
  return theme.length > 48 ? theme.slice(0, 47).trim() : theme;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
