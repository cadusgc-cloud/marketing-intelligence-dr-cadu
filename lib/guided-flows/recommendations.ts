import { buildDefaultMarketingWorkspace, auditWorkspace, generateWeeklyRunbook } from "@/lib/marketing-workspace";
import { getGuidedFlowCatalog } from "@/lib/guided-flows/registry";
import type { CommandCenterDashboard, FlowRunContext, FlowRouteLink, NextOperationalAction } from "@/lib/guided-flows/types";

export function generateNextOperationalAction(context: FlowRunContext = {}): NextOperationalAction {
  if (context.hasWorkspace === false) {
    return {
      title: "Criar ou revisar workspace local",
      reason: "Sem workspace valido nao ha continuidade, snapshots ou historico operacional.",
      recommendedRoute: "/workspace",
      estimatedMinutes: 10,
      risk: "medio",
      prerequisites: ["Workspace local"],
      expectedOutput: "Workspace saudavel e snapshot inicial.",
      shortAlternative: "Abrir /runbook e seguir checklist sem salvar estado."
    };
  }
  if (context.hasImportedData === false) {
    return {
      title: "Importar metricas manuais antes de decidir estrategia",
      reason: "O fechamento e a estrategia ficam mais confiaveis com dados agregados normalizados.",
      recommendedRoute: "/imports",
      estimatedMinutes: 20,
      risk: "baixo",
      prerequisites: ["Relatorio TSV/CSV manual ou dataset ficticio"],
      expectedOutput: "Importacao validada e sem dados sensiveis.",
      shortAlternative: "Usar dataset ficticio e marcar baixa confianca."
    };
  }
  if (context.hasWeeklyReview === false) {
    return {
      title: "Fechar a semana antes de planejar novos conteudos",
      reason: "O plano seguinte deve nascer do desempenho consolidado, nao de memoria.",
      recommendedRoute: "/weekly-review",
      estimatedMinutes: 35,
      risk: "baixo",
      prerequisites: ["Metricas importadas ou exemplo local"],
      expectedOutput: "Relatorio semanal e plano de 7 dias.",
      shortAlternative: "Abrir /strategy e usar calendario adaptativo padrao."
    };
  }
  if (context.hasSafetyReview === false) {
    return {
      title: "Revisar itens de safety antes de exportar",
      reason: "Conteudo com bloqueio ou dado sensivel nao deve sair do sistema.",
      recommendedRoute: "/safety",
      estimatedMinutes: 15,
      risk: "alto",
      prerequisites: ["Pacotes gerados"],
      expectedOutput: "Relatorio de safety sem bloqueios pendentes.",
      shortAlternative: "Exportar apenas checklist, sem conteudo final."
    };
  }
  if (context.hasBackup === false) {
    return {
      title: "Criar snapshot e backup local",
      reason: "Antes de restore, reset ou PR, o workspace deve ter ponto de recuperacao.",
      recommendedRoute: "/workspace",
      estimatedMinutes: 12,
      risk: "medio",
      prerequisites: ["Workspace valido"],
      expectedOutput: "Backup JSON tecnico e snapshot manual.",
      shortAlternative: "Copiar somente historico em Markdown."
    };
  }
  return {
    title: "Executar fechamento semanal completo",
    reason: "Todos os pre-requisitos basicos estao prontos; o fluxo completo organiza importacao, performance, estrategia, snapshot e exportacao.",
    recommendedRoute: "/flows/fechamento-semanal-completo",
    estimatedMinutes: 65,
    risk: "baixo",
    prerequisites: ["Workspace saudavel", "Safety ativo", "Metricas ou dataset exemplo"],
    expectedOutput: "Relatorio semanal, proxima semana e snapshot.",
    shortAlternative: "Abrir /command-center e iniciar apenas importacao manual."
  };
}

export function buildCommandCenterDashboard(context: FlowRunContext = {}): CommandCenterDashboard {
  const workspace = buildDefaultMarketingWorkspace();
  const audit = auditWorkspace(workspace);
  const runbook = generateWeeklyRunbook({ workspace });
  const flows = getGuidedFlowCatalog();
  const shortcuts: FlowRouteLink[] = [
    { route: "/weekly-review", label: "Fechamento", reason: "fechar a semana" },
    { route: "/imports", label: "Importacoes", reason: "colar relatorio manual" },
    { route: "/performance", label: "Performance", reason: "comparar semanas" },
    { route: "/strategy", label: "Estrategia", reason: "planejar proximo ciclo" },
    { route: "/studio", label: "Studio", reason: "produzir conteudo" },
    { route: "/recording", label: "Gravacao", reason: "planejar lote" },
    { route: "/review", label: "Revisao", reason: "aprovar manualmente" },
    { route: "/exports", label: "Exports", reason: "copiar pacotes" },
    { route: "/workspace", label: "Workspace", reason: "snapshot e backup" },
    { route: "/runbook", label: "Runbook", reason: "rotina semanal" },
    { route: "/release", label: "Release", reason: "prontidao de PR" }
  ];
  const nextAction = generateNextOperationalAction(context);
  return {
    systemStatus: audit.status === "bloquear" ? "bloqueado" : audit.status === "saudavel" ? "operacional" : "atencao",
    workspaceName: workspace.metadata.name,
    activeWeek: workspace.activeCycle.weekId,
    readinessScore: workspace.activeCycle.readinessScore,
    safetyStatus: audit.status,
    qaStatus: "aprovado localmente",
    routeStatus: "health local esperado em 28 rotas",
    nextAction,
    prioritizedFlows: flows.slice(0, 6),
    alerts: audit.issues.length ? audit.issues.map((issue) => issue.message) : ["Nenhum bloqueio local detectado.", `Runbook de hoje: ${runbook.days[0]?.tasks.length ?? 0} tarefas.`],
    shortcuts,
    releaseStatus: "release candidate local pendente de validacao final"
  };
}
