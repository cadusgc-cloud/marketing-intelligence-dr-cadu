export type EditorialChannel =
  | "Instagram Feed"
  | "Instagram Carrossel"
  | "Instagram Stories"
  | "Instagram Reels"
  | "TikTok"
  | "YouTube Shorts"
  | "YouTube video longo"
  | "Facebook"
  | "Google Perfil da Empresa";

export type EditorialProviderMode = "local_mock" | "future_adapter_only" | "blocked";

export type AnalyticsProvider = {
  mode: EditorialProviderMode;
  readAggregatedMetrics(period: string): Promise<unknown>;
};

export type SocialAccountProvider = {
  mode: EditorialProviderMode;
  listAccounts(): Promise<unknown>;
};

export type PublishingProvider = {
  mode: EditorialProviderMode;
  prepareManualPayload(contentId: string): Promise<unknown>;
};

export type AIProvider = {
  mode: EditorialProviderMode;
  buildPrompt(promptId: string): Promise<string>;
};

export type AssetProvider = {
  mode: EditorialProviderMode;
  listApprovedAssets(): Promise<unknown>;
};

export type FutureIntegrationStub = {
  name: "AnalyticsProvider" | "SocialAccountProvider" | "PublishingProvider" | "AIProvider" | "AssetProvider";
  mode: EditorialProviderMode;
  purpose: string;
  currentBoundary: string;
};

export type DrCaduEditorialProfile = {
  brandIdentity: string;
  voiceTone: string[];
  editorialPillars: string[];
  allowedThemes: string[];
  sensitiveThemes: string[];
  termsToAvoid: string[];
  safetyRules: string[];
  allowedCtas: string[];
  priorityFormats: string[];
  priorityChannels: EditorialChannel[];
  futureIntegrations: FutureIntegrationStub[];
};

export const DR_CADU_EDITORIAL_PROFILE: DrCaduEditorialProfile = {
  brandIdentity:
    "Dr. Cadu Gazzinelli: cirurgia plastica com postura educativa, tecnica, humana e responsavel para comunicacao interna de marketing medico.",
  voiceTone: [
    "humano e claro",
    "professoral sem arrogancia",
    "tecnico sem jargao desnecessario",
    "seguro sem promessa de resultado",
    "proximo sem banalizar medicina",
    "sobrio, educativo e compativel com perfil medico"
  ],
  editorialPillars: [
    "bastidores profissionais",
    "rotina como professor",
    "cirurgia plastica com responsabilidade",
    "estetica natural",
    "seguranca em cirurgia plastica",
    "esclarecimento de mitos",
    "explicacao simples de temas complexos",
    "orientacao para pacientes sem substituir consulta",
    "bastidores de estudo e atualizacao",
    "Plastica em Evidencia",
    "relacao medico-paciente",
    "preparo para consulta",
    "cuidados gerais e educativos",
    "reflexoes humanas leves",
    "maternidade e cirurgia plastica com cautela",
    "tecnologia aplicada a medicina com realismo"
  ],
  allowedThemes: [
    "naturalidade",
    "seguranca",
    "criterio medico",
    "planejamento individual",
    "duvidas frequentes",
    "rotina de estudo",
    "aula e ensino",
    "preparo para avaliacao",
    "limites de indicacao",
    "tempo de recuperacao como tema educativo",
    "presenca diaria nos stories sem expor terceiros"
  ],
  sensitiveThemes: [
    "antes/depois",
    "depoimento",
    "foto de paciente",
    "resultado cirurgico individual",
    "promessa estetica",
    "comparacao com outros profissionais",
    "medo como argumento de venda",
    "conteudo que pareca consulta individual"
  ],
  termsToAvoid: [
    "garante",
    "resultado garantido",
    "cura",
    "elimina",
    "prescreve",
    "diagnostico individual",
    "melhor cirurgia",
    "transformacao garantida",
    "antes e depois",
    "compre agora"
  ],
  safetyRules: [
    "nao usar dados pessoais ou dados de pacientes",
    "nao usar prints de conversas, DMs, prontuarios ou fotos identificaveis",
    "nao prometer resultado",
    "nao substituir consulta medica",
    "nao publicar automaticamente",
    "nao chamar APIs externas nesta fase",
    "nao usar dezembro de 2025 em benchmarks normais",
    "revisar manualmente conteudos sensiveis antes de qualquer uso"
  ],
  allowedCtas: [
    "salve para rever com calma",
    "leve essa pergunta para sua avaliacao",
    "envie uma duvida geral para a equipe",
    "acompanhe os proximos stories",
    "compartilhe com alguem que pesquisa o tema",
    "fale com a equipe para entender os proximos passos"
  ],
  priorityFormats: [
    "stories diarios",
    "reels educativos",
    "TikTok com linguagem direta e etica",
    "YouTube Shorts reaproveitado de videos longos",
    "carrossel professoral",
    "video longo de autoridade",
    "post de feed com legenda copiavel"
  ],
  priorityChannels: [
    "Instagram Stories",
    "Instagram Reels",
    "Instagram Carrossel",
    "Instagram Feed",
    "TikTok",
    "YouTube Shorts",
    "YouTube video longo",
    "Facebook",
    "Google Perfil da Empresa"
  ],
  futureIntegrations: [
    {
      name: "AnalyticsProvider",
      mode: "future_adapter_only",
      purpose: "Receber metricas agregadas de canais quando houver aprovacao futura.",
      currentBoundary: "Hoje opera com dados locais demo e entrada manual."
    },
    {
      name: "SocialAccountProvider",
      mode: "future_adapter_only",
      purpose: "Representar contas sociais sem conectar ou autenticar nesta fase.",
      currentBoundary: "Nenhuma conta real, OAuth ou token e criado."
    },
    {
      name: "PublishingProvider",
      mode: "blocked",
      purpose: "Preparar payloads manuais no futuro, mantendo aprovacao humana.",
      currentBoundary: "Publicacao real automatica permanece bloqueada."
    },
    {
      name: "AIProvider",
      mode: "future_adapter_only",
      purpose: "Separar prompts para uso manual em ChatGPT ou ferramenta aprovada.",
      currentBoundary: "Nenhuma chamada para IA externa e feita pelo app."
    },
    {
      name: "AssetProvider",
      mode: "future_adapter_only",
      purpose: "Listar assets aprovados em fase futura.",
      currentBoundary: "Nenhum upload ou leitura de foto real e feito nesta fase."
    }
  ]
};

export function getEditorialProfile(): DrCaduEditorialProfile {
  return DR_CADU_EDITORIAL_PROFILE;
}
