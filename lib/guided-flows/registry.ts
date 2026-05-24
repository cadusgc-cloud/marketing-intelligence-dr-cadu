import type { FlowOutput, FlowPrerequisite, FlowRouteLink, GuidedFlow, GuidedFlowStep } from "@/lib/guided-flows/types";

function prereq(id: string, description: string, routeToResolve: string, suggestion: string, severity: FlowPrerequisite["severity"] = "atencao"): FlowPrerequisite {
  return { id, description, routeToResolve, suggestion, severity, status: "atencao" };
}

function step(id: string, title: string, route: string, expectedOutput: string, estimatedMinutes = 8): GuidedFlowStep {
  return {
    id,
    title,
    route,
    expectedOutput,
    estimatedMinutes,
    risk: "baixo",
    description: `Executar a etapa "${title}" dentro do Marketing OS, sempre de forma local e manual.`,
    validation: `Confirmar que a etapa gerou: ${expectedOutput}.`
  };
}

function output(id: string, label: string, type: FlowOutput["type"], description: string): FlowOutput {
  return { id, label, type, description };
}

function link(route: string, label: string, reason: string): FlowRouteLink {
  return { route, label, reason };
}

function flow(input: Omit<GuidedFlow, "status" | "lastRunLabel">): GuidedFlow {
  return { ...input, status: "nao_iniciado", lastRunLabel: "sem execucao local salva" };
}

const commonSafety = prereq("safety-review", "Safety gate disponivel para revisar riscos medico-publicitarios.", "/safety", "Abra Safety Center antes de usar qualquer saida fora do sistema.");
const commonWorkspace = prereq("workspace-valid", "Workspace local valido e sem dados sensiveis.", "/workspace", "Revise integridade local e crie snapshot quando necessario.");

export const guidedFlowCatalog: GuidedFlow[] = [
  flow({
    id: "fechamento-semanal-completo",
    name: "Fechamento semanal completo",
    description: "Conduz importacao, validacao, performance, estrategia, snapshot e exportacao da semana.",
    estimatedMinutes: 65,
    complexity: "alta",
    modulesUsed: ["report-imports", "weekly-review", "performance", "strategy", "workspace", "safety"],
    routeLinks: [link("/imports", "Importacoes", "colar relatorio manual"), link("/weekly-review", "Fechamento", "gerar fechamento"), link("/strategy", "Estrategia", "planejar ciclo")],
    prerequisites: [commonWorkspace, prereq("manual-report", "Relatorio manual colado ou dataset exemplo.", "/imports", "Cole TSV/CSV manual ou use o exemplo ficticio."), commonSafety],
    steps: [
      step("abrir-imports", "Abrir importacoes", "/imports", "origem selecionada"),
      step("colar-relatorio", "Colar relatorio manual", "/imports", "linhas normalizadas"),
      step("validar-importacao", "Validar importacao", "/imports", "quality score aprovado"),
      step("abrir-weekly-review", "Abrir fechamento semanal", "/weekly-review", "periodo semanal definido"),
      step("gerar-fechamento", "Gerar fechamento semanal", "/weekly-review", "relatorio executivo"),
      step("revisar-performance", "Revisar performance", "/performance", "ranking por formato e pilar"),
      step("gerar-strategy", "Gerar plano adaptativo", "/strategy", "proximos 7 dias"),
      step("salvar-snapshot", "Salvar snapshot", "/workspace", "snapshot post_review"),
      step("exportar-relatorio", "Exportar relatorio", "/exports", "Markdown, TSV e agenda"),
      step("revisar-safety", "Revisar safety", "/safety", "sem bloqueios pendentes"),
      step("concluir", "Concluir fluxo", "/command-center", "proxima acao atualizada")
    ],
    outputs: [output("weekly-report", "Relatorio semanal", "markdown", "Resumo executivo da semana."), output("next-week", "Plano da proxima semana", "agenda", "Agenda e TSV copiaveis."), output("snapshot", "Snapshot local", "backup_json", "Estado local sanitizado.")],
    risks: ["dados sensiveis colados por engano", "metricas incompletas", "conteudo bloqueado marcado como pronto"]
  }),
  flow({
    id: "importar-relatorio-manual",
    name: "Importar relatorio manual",
    description: "Mapeia CSV/TSV de Reportei, Instagram, Meta Ads, Etus ou generico sem API externa.",
    estimatedMinutes: 25,
    complexity: "media",
    modulesUsed: ["report-imports", "metrics", "workspace"],
    routeLinks: [link("/imports", "Importacoes", "mapear colunas"), link("/metrics", "Metricas", "revisar registros")],
    prerequisites: [prereq("text-report", "Relatorio exportado manualmente.", "/imports", "Cole o texto exportado manualmente."), commonWorkspace],
    steps: [
      step("escolher-origem", "Escolher origem", "/imports", "preset selecionado"),
      step("colar-csv", "Colar CSV ou TSV", "/imports", "preview gerado"),
      step("mapear-colunas", "Mapear colunas", "/imports", "campos canonicos"),
      step("validar-dados", "Validar dados", "/imports", "sem metricas negativas"),
      step("revisar-sensiveis", "Revisar dados sensiveis", "/imports", "auditoria aprovada"),
      step("exportar-normalizado", "Exportar normalizado", "/imports", "TSV normalizado"),
      step("salvar-resumo", "Salvar resumo no workspace", "/workspace", "evento import_validated")
    ],
    outputs: [output("normalized-tsv", "TSV normalizado", "tsv", "Dados agregados e seguros."), output("quality-report", "Qualidade da importacao", "markdown", "Score e alertas.")],
    risks: ["relatorio com dado sensivel", "colunas ausentes", "duplicidades"]
  }),
  flow({
    id: "gerar-plano-proxima-semana",
    name: "Gerar plano da proxima semana",
    description: "Transforma fechamento semanal e insights em 7 dias sugeridos para execucao manual.",
    estimatedMinutes: 35,
    complexity: "media",
    modulesUsed: ["weekly-review", "marketing-intelligence", "strategy", "operations"],
    routeLinks: [link("/weekly-review", "Fechamento", "base da semana"), link("/strategy", "Estrategia", "plano adaptativo"), link("/operations", "Operations", "tarefas")],
    prerequisites: [prereq("weekly-review", "Fechamento semanal disponivel.", "/weekly-review", "Gere ou revise o fechamento semanal."), commonSafety],
    steps: [
      step("revisar-fechamento", "Revisar fechamento semanal", "/weekly-review", "aprendizados confirmados"),
      step("analisar-insights", "Analisar insights", "/insights", "temas prioritarios"),
      step("escolher-prioridades", "Escolher prioridades", "/strategy", "top acoes"),
      step("gerar-sete-dias", "Gerar 7 dias", "/strategy", "calendario adaptativo"),
      step("enviar-studio", "Enviar temas para Studio", "/studio", "pacotes de conteudo"),
      step("criar-tarefas", "Criar tarefas em Operations", "/operations", "fila operacional"),
      step("exportar-agenda", "Exportar Agenda e Etus", "/exports", "textos copiaveis")
    ],
    outputs: [output("next-week-plan", "Plano de 7 dias", "markdown", "Plano editorial seguro."), output("agenda", "Google Agenda", "agenda", "Blocos de agenda copiaveis.")],
    risks: ["planejar sem dados suficientes", "pular revisao de safety"]
  }),
  flow({
    id: "produzir-conteudo-semana",
    name: "Produzir conteudo da semana",
    description: "Gera pacotes no Content Studio e organiza revisao, exportacao e registro local.",
    estimatedMinutes: 55,
    complexity: "alta",
    modulesUsed: ["content-studio", "review", "exports", "workspace"],
    routeLinks: [link("/studio", "Studio", "gerar pacote"), link("/review", "Revisao", "avaliar scores"), link("/exports", "Exports", "copiar conteudo")],
    prerequisites: [prereq("themes", "Temas priorizados disponiveis.", "/strategy", "Escolha temas da semana antes de produzir."), commonSafety],
    steps: [
      step("abrir-studio", "Abrir Studio", "/studio", "tema selecionado"),
      step("escolher-temas", "Escolher temas", "/studio", "pacotes criados"),
      step("gerar-pacotes", "Gerar pacotes", "/studio", "stories reels posts"),
      step("revisar-qa", "Revisar QA", "/qa", "scores aceitaveis"),
      step("enviar-review", "Enviar para revisao", "/review", "fila atualizada"),
      step("exportar-conteudo", "Exportar conteudo", "/exports", "pacotes copiaveis"),
      step("registrar-workspace", "Registrar no workspace", "/workspace", "evento content_package_generated")
    ],
    outputs: [output("content-package", "Pacote completo", "markdown", "Stories, reel, carrossel, post e briefing."), output("review-items", "Fila de revisao", "checklist", "Itens para conferencia humana.")],
    risks: ["conteudo parecer campanha", "exportar antes de revisar"]
  }),
  flow({
    id: "planejar-gravacao-lote",
    name: "Planejar gravacao em lote",
    description: "Organiza uma sessao de 8 a 10 videos curtos com roteiro, checklist e briefing.",
    estimatedMinutes: 40,
    complexity: "media",
    modulesUsed: ["recording", "content-studio", "workspace"],
    routeLinks: [link("/recording", "Gravacao", "montar sessao"), link("/studio", "Studio", "pacotes base")],
    prerequisites: [prereq("recording-themes", "Temas seguros para gravacao.", "/library", "Use a biblioteca ou plano semanal."), commonSafety],
    steps: [
      step("abrir-recording", "Abrir planejamento de gravacao", "/recording", "sessao default"),
      step("selecionar-videos", "Selecionar 8 a 10 videos", "/recording", "ordem de gravacao"),
      step("revisar-roteiros", "Revisar roteiros", "/recording", "falas principais"),
      step("gerar-briefing", "Gerar briefing de editor", "/recording", "briefing copiavel"),
      step("checklist-midia", "Gerar checklist de midia", "/recording", "objetos neutros"),
      step("salvar-sessao", "Salvar sessao", "/workspace", "evento recording_session_planned"),
      step("exportar-agenda", "Exportar agenda", "/exports", "agenda de gravacao")
    ],
    outputs: [output("recording-plan", "Plano de gravacao", "markdown", "Roteiros e ordem."), output("editor-brief", "Briefing de editor", "markdown", "Instrucao para edicao manual.")],
    risks: ["sugerir local real", "gravar com prontuario ou paciente visivel"]
  }),
  flow({
    id: "revisar-conteudos",
    name: "Revisar conteudos antes de publicar manualmente",
    description: "Filtra pendencias, confere scores e bloqueia qualquer item arriscado.",
    estimatedMinutes: 30,
    complexity: "media",
    modulesUsed: ["review", "safety", "qa", "exports"],
    routeLinks: [link("/review", "Revisao", "fila"), link("/safety", "Safety", "riscos"), link("/qa", "QA", "checks")],
    prerequisites: [prereq("review-queue", "Fila de revisao com itens.", "/review", "Gere pacotes no Studio primeiro."), commonSafety],
    steps: [
      step("abrir-review", "Abrir fila de revisao", "/review", "itens pendentes"),
      step("filtrar-pendentes", "Filtrar pendentes", "/review", "lista priorizada"),
      step("verificar-scores", "Verificar scores", "/review", "readiness e seguranca"),
      step("revisar-safety", "Revisar safety", "/safety", "sem bloqueios"),
      step("bloquear-risco", "Bloquear o que for arriscado", "/review", "itens bloqueados"),
      step("marcar-pronto", "Marcar pronto manualmente", "/review", "somente itens seguros"),
      step("exportar-pacote", "Exportar pacote", "/exports", "conteudo copiavel")
    ],
    outputs: [output("review-checklist", "Checklist de revisao", "checklist", "Itens aprovados, revisar e bloqueados.")],
    risks: ["conteudo bloqueado marcado como pronto", "publicacao sem revisao humana"]
  }),
  flow({
    id: "exportar-etus-manual",
    name: "Exportar pacote para Etus/manual",
    description: "Prepara TSV/manual para ferramenta externa sem conectar API nem publicar.",
    estimatedMinutes: 20,
    complexity: "baixa",
    modulesUsed: ["exports", "safety"],
    routeLinks: [link("/exports", "Export Center", "copiar pacote"), link("/safety", "Safety", "conferir riscos")],
    prerequisites: [prereq("export-content", "Conteudo seguro para exportar.", "/review", "Aprove manualmente antes de copiar."), commonSafety],
    steps: [
      step("abrir-exports", "Abrir Export Center", "/exports", "pacotes disponiveis"),
      step("selecionar-periodo", "Selecionar periodo", "/exports", "semana ou dia"),
      step("copiar-tsv", "Copiar TSV manual", "/exports", "texto Etus/manual"),
      step("revisar-seguranca", "Revisar seguranca", "/safety", "sem bloqueios"),
      step("conferir-midia", "Conferir midia", "/media", "midia neutra"),
      step("marcar-exportacao", "Marcar exportacao", "/workspace", "evento export_generated")
    ],
    outputs: [output("etus-tsv", "Etus/manual TSV", "etus", "Data, canal, formato, midia e risco.")],
    risks: ["copiar conteudo bloqueado", "achar que exportacao publica automaticamente"]
  }),
  flow({
    id: "gerar-campanha-mensal",
    name: "Gerar campanha mensal",
    description: "Monta campanha de 30 dias e conecta prioridades com strategy e workspace.",
    estimatedMinutes: 45,
    complexity: "media",
    modulesUsed: ["monthly-editorial", "campaigns", "strategy", "workspace"],
    routeLinks: [link("/campaigns", "Campanhas", "gerar 30 dias"), link("/strategy", "Estrategia", "priorizar")],
    prerequisites: [prereq("campaign-brief", "Briefing de campanha definido.", "/campaigns", "Use campanha padrao ou edite campos neutros."), commonSafety],
    steps: [
      step("abrir-campaigns", "Abrir Campanhas", "/campaigns", "formulario"),
      step("definir-campanha", "Definir campanha", "/campaigns", "objetivo e pilares"),
      step("gerar-30-dias", "Gerar 30 dias", "/campaigns", "calendario mensal"),
      step("validar-safety", "Validar safety", "/safety", "risco consolidado"),
      step("enviar-strategy", "Enviar prioridades para Strategy", "/strategy", "roadmap"),
      step("criar-snapshot", "Criar snapshot", "/workspace", "snapshot post_strategy")
    ],
    outputs: [output("monthly-plan", "Plano mensal", "markdown", "30 dias com stories, reels, posts e midia.")],
    risks: ["campanha parecer comercial demais", "repeticao excessiva de tema"]
  }),
  flow({
    id: "auditoria-seguranca",
    name: "Rodar auditoria de seguranca",
    description: "Revisa safety, QA, dados sensiveis e bloqueios antes de qualquer uso externo.",
    estimatedMinutes: 25,
    complexity: "media",
    modulesUsed: ["safety", "qa", "workspace"],
    routeLinks: [link("/safety", "Safety", "riscos"), link("/qa", "QA", "checks"), link("/audit-log", "Registro", "eventos")],
    prerequisites: [commonWorkspace],
    steps: [
      step("abrir-safety", "Abrir Safety Center", "/safety", "riscos"),
      step("abrir-qa", "Abrir QA", "/qa", "checks"),
      step("revisar-bloqueios", "Revisar bloqueios", "/safety", "itens bloqueados"),
      step("revisar-sensiveis", "Revisar dados sensiveis", "/audit-log", "eventos criticos"),
      step("exportar-relatorio", "Exportar relatorio", "/exports", "auditoria copiavel")
    ],
    outputs: [output("safety-report", "Relatorio de seguranca", "markdown", "Riscos e ajustes sugeridos.")],
    risks: ["ignorar bloqueios", "manter dado sensivel no workspace"]
  }),
  flow({
    id: "backup-local",
    name: "Fazer backup local",
    description: "Cria snapshot, exporta backup JSON tecnico e revisa integridade local.",
    estimatedMinutes: 15,
    complexity: "baixa",
    modulesUsed: ["marketing-workspace"],
    routeLinks: [link("/workspace", "Workspace", "backup"), link("/settings", "Configuracoes", "retencao")],
    prerequisites: [commonWorkspace],
    steps: [
      step("abrir-workspace", "Abrir Workspace", "/workspace", "estado local"),
      step("criar-snapshot", "Criar snapshot", "/workspace", "snapshot manual"),
      step("exportar-backup", "Exportar backup", "/workspace", "JSON tecnico local"),
      step("verificar-integridade", "Verificar integridade", "/audit-log", "auditoria saudavel"),
      step("salvar-local", "Salvar arquivo localmente pelo usuario", "/workspace", "backup copiado")
    ],
    outputs: [output("backup-json", "Backup tecnico JSON", "backup_json", "Arquivo local sem upload.")],
    risks: ["guardar backup em local inseguro", "salvar dado sensivel se colado manualmente"]
  }),
  flow({
    id: "restore-tecnico",
    name: "Restaurar backup tecnico",
    description: "Valida backup JSON, cria pre_restore, restaura e audita sem upload.",
    estimatedMinutes: 25,
    complexity: "alta",
    modulesUsed: ["marketing-workspace"],
    routeLinks: [link("/workspace", "Workspace", "restore"), link("/audit-log", "Auditoria", "eventos")],
    prerequisites: [prereq("backup-json", "Backup tecnico local disponivel.", "/workspace", "Cole backup JSON tecnico valido.", "bloqueante"), commonWorkspace],
    steps: [
      step("abrir-workspace", "Abrir Workspace", "/workspace", "restore"),
      step("colar-backup", "Colar backup JSON", "/workspace", "backup lido"),
      step("validar-backup", "Validar backup", "/workspace", "schema e checksum"),
      step("criar-pre-restore", "Criar pre_restore", "/workspace", "snapshot de seguranca"),
      step("restaurar", "Restaurar", "/workspace", "estado restaurado"),
      step("auditar", "Auditar", "/audit-log", "integridade revisada"),
      step("registrar-evento", "Registrar evento", "/history", "backup_restored")
    ],
    outputs: [output("restore-report", "Relatorio de restore", "markdown", "Resultado e issues.")],
    risks: ["backup corrompido", "backup com dado sensivel", "versao incompativel"]
  }),
  flow({
    id: "preparar-pr-release",
    name: "Preparar PR/release local",
    description: "Gera checklist local de RC e rascunho de PR sem chamar GitHub ou push.",
    estimatedMinutes: 30,
    complexity: "media",
    modulesUsed: ["release-readiness", "qa", "health"],
    routeLinks: [link("/release", "Release", "RC local"), link("/qa", "QA", "validacoes")],
    prerequisites: [prereq("release-checks", "Scripts e build executados.", "/release", "Rode os checks locais antes do push."), commonWorkspace],
    steps: [
      step("rodar-scripts", "Rodar scripts", "/release", "checklist preenchido"),
      step("validar-rotas", "Validar rotas", "/release", "health routes"),
      step("gerar-relatorio", "Gerar relatorio", "/release", "release readiness"),
      step("revisar-docs", "Revisar docs", "/release", "docs V9"),
      step("conferir-git", "Conferir git status", "/release", "status limpo esperado"),
      step("preparar-push", "Preparar comando de push sem executar", "/release", "comando em texto")
    ],
    outputs: [output("pr-draft", "Rascunho de PR", "pr_draft", "Markdown para colar no GitHub."), output("release-report", "Release report", "markdown", "Checklist de RC.")],
    risks: ["executar push cedo", "omitir falha de validacao"]
  }),
  flow({
    id: "criar-experimento-editorial",
    name: "Criar experimento editorial",
    description: "Planeja experimento seguro de tema, hook, formato ou tom para execucao manual.",
    estimatedMinutes: 20,
    complexity: "baixa",
    modulesUsed: ["marketing-intelligence", "experiments", "safety"],
    routeLinks: [link("/experiments", "Experimentos", "hipoteses"), link("/insights", "Insights", "base de dados")],
    prerequisites: [prereq("insights", "Insights ou dataset exemplo disponivel.", "/insights", "Revise metricas manuais antes de testar."), commonSafety],
    steps: [
      step("abrir-experiments", "Abrir Experimentos", "/experiments", "lista sugerida"),
      step("escolher-hipotese", "Escolher hipotese", "/experiments", "hipotese segura"),
      step("definir-variantes", "Definir variantes", "/experiments", "A/B editorial"),
      step("definir-metricas", "Definir metricas", "/experiments", "primaria e secundaria"),
      step("revisar-safety", "Revisar safety", "/safety", "sem medo ou urgencia artificial"),
      step("exportar-experimento", "Exportar experimento", "/exports", "plano copiavel")
    ],
    outputs: [output("experiment", "Plano de experimento", "markdown", "Hipotese, variantes e criterios.")],
    risks: ["manipulacao por medo", "urgencia artificial"]
  }),
  flow({
    id: "revisar-performance-semanal",
    name: "Revisar performance semanal",
    description: "Le desempenho, oportunidades, saturacao e gargalos com dados agregados manuais.",
    estimatedMinutes: 25,
    complexity: "media",
    modulesUsed: ["performance", "insights", "strategy"],
    routeLinks: [link("/performance", "Performance", "comparativos"), link("/insights", "Insights", "aprendizados"), link("/strategy", "Estrategia", "decisoes")],
    prerequisites: [prereq("metrics", "Metricas agregadas normalizadas.", "/metrics", "Importe ou use dataset ficticio."), commonWorkspace],
    steps: [
      step("abrir-performance", "Abrir Performance", "/performance", "rankings"),
      step("comparar-semanas", "Comparar semanas", "/performance", "variacoes"),
      step("avaliar-esforco", "Avaliar esforco x resultado", "/performance", "mapa de oportunidade"),
      step("abrir-insights", "Abrir Insights", "/insights", "temas fortes"),
      step("definir-ajustes", "Definir ajustes", "/strategy", "prioridades"),
      step("exportar-leitura", "Exportar leitura", "/exports", "relatorio copiavel")
    ],
    outputs: [output("performance-report", "Relatorio de performance", "markdown", "Ranking, comparacao e oportunidades.")],
    risks: ["interpretar metrica como conversao medica", "comparar dados incompletos como verdade absoluta"]
  }),
  flow({
    id: "montar-stories-do-dia",
    name: "Montar pacote de stories do dia",
    description: "Gera ou revisa sequencia de 6 stories com StoryOps e exportacao manual.",
    estimatedMinutes: 18,
    complexity: "baixa",
    modulesUsed: ["storyops", "operations", "exports"],
    routeLinks: [link("/storyops", "StoryOps", "sequencia"), link("/operations", "Operations", "pacote do dia")],
    prerequisites: [prereq("daily-theme", "Tema do dia definido.", "/operations", "Use Operations ou Campanhas para selecionar o dia."), commonSafety],
    steps: [
      step("abrir-storyops", "Abrir StoryOps", "/storyops", "sequencia de 6"),
      step("selecionar-tema", "Selecionar tema", "/operations", "tema do dia"),
      step("gerar-stories", "Gerar stories", "/storyops", "6 itens"),
      step("revisar-seguranca", "Revisar seguranca", "/safety", "observacoes"),
      step("copiar-sequencia", "Copiar sequencia", "/storyops", "texto copiavel"),
      step("registrar-operacao", "Registrar operacao", "/workspace", "evento export_generated")
    ],
    outputs: [output("stories", "Stories do dia", "markdown", "Seis stories com midia, texto e seguranca.")],
    risks: ["parecer campanha", "sugerir acontecimento em tempo real"]
  })
];

export function getGuidedFlowCatalog(): GuidedFlow[] {
  return guidedFlowCatalog.map((flowItem) => ({
    ...flowItem,
    prerequisites: flowItem.prerequisites.map((item) => ({ ...item })),
    steps: flowItem.steps.map((item) => ({ ...item })),
    outputs: flowItem.outputs.map((item) => ({ ...item })),
    routeLinks: flowItem.routeLinks.map((item) => ({ ...item })),
    risks: [...flowItem.risks],
    modulesUsed: [...flowItem.modulesUsed]
  }));
}

export function getGuidedFlowById(id: string): GuidedFlow | undefined {
  return getGuidedFlowCatalog().find((flowItem) => flowItem.id === id);
}
