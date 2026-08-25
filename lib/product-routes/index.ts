export type RouteGroupId = "comece-aqui" | "producao" | "planejamento" | "metricas" | "seguranca-qa" | "workspace";
export type RouteRiskLevel = "baixo" | "medio" | "alto";
export type RouteMaturity = "operacional" | "release-candidate" | "legado";
export type RouteVisibility = "primary" | "secondary";

export type ProductRoute = {
  path: string;
  title: string;
  group: RouteGroupId;
  description: string;
  maturity: RouteMaturity;
  visibility: RouteVisibility;
  localOnly: true;
  usesExternalApi: false;
  filePath: string;
  expectedTexts: string[];
  relatedScripts: string[];
  relatedDocs: string[];
  safetyNotes: string[];
  riskLevel: RouteRiskLevel;
};

export type ProductRouteGroup = {
  id: RouteGroupId;
  title: string;
  description: string;
};

export const productRouteGroups: ProductRouteGroup[] = [
  { id: "comece-aqui", title: "Comece aqui", description: "Entrada operacional, fluxos guiados e rotina semanal." },
  { id: "producao", title: "Producao", description: "Criacao, gravacao, revisao e biblioteca editorial." },
  { id: "planejamento", title: "Planejamento", description: "Campanhas, estrategia, operacoes e experimentos." },
  { id: "metricas", title: "Metricas", description: "Importacao manual, fechamento semanal, performance e insights." },
  { id: "seguranca-qa", title: "Seguranca e QA", description: "Safety, auditoria, release e qualidade de interface." },
  { id: "workspace", title: "Workspace", description: "Estado local, historico, configuracoes, backups e docs." }
];

const commonSafety = ["Sem API externa.", "Sem publicacao automatica.", "Sem dados pessoais de pacientes."];

export const productRoutes: ProductRoute[] = [
  {
    path: "/",
    title: "Home",
    group: "comece-aqui",
    description: "Porta de entrada simples para abrir o Command Center.",
    maturity: "release-candidate",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/page.tsx",
    expectedTexts: ["Marketing Intelligence OS", "Command Center"],
    relatedScripts: ["npm run health:routes"],
    relatedDocs: ["docs/MARKETING_OS_V10_PRODUCT_HARDENING.md"],
    safetyNotes: commonSafety,
    riskLevel: "baixo"
  },
  {
    path: "/command-center",
    title: "Command Center",
    group: "comece-aqui",
    description: "Ponto inicial para proxima acao, status, fluxos e release local.",
    maturity: "release-candidate",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/command-center/page.tsx",
    expectedTexts: ["Command Center", "O que eu faco agora"],
    relatedScripts: ["npm run flows:check", "npm run product:check"],
    relatedDocs: ["docs/MARKETING_OS_V9_GUIDED_FLOWS_RC.md", "docs/MARKETING_OS_V10_PRODUCT_HARDENING.md"],
    safetyNotes: commonSafety,
    riskLevel: "baixo"
  },
  {
    path: "/onboarding",
    title: "Primeiros Passos",
    group: "comece-aqui",
    description: "Guia de uso do zero, com rotinas semanais, mensais, backup e PR.",
    maturity: "release-candidate",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/onboarding/page.tsx",
    expectedTexts: ["Primeiros Passos", "Fluxo semanal recomendado"],
    relatedScripts: ["npm run product:check"],
    relatedDocs: ["docs/MARKETING_OS_V10_PRODUCT_HARDENING.md"],
    safetyNotes: commonSafety,
    riskLevel: "baixo"
  },
  {
    path: "/flows",
    title: "Fluxos Guiados",
    group: "comece-aqui",
    description: "Catalogo com rotinas completas para executar o Marketing OS.",
    maturity: "release-candidate",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/flows/page.tsx",
    expectedTexts: ["Fluxos Guiados", "Fechamento semanal completo"],
    relatedScripts: ["npm run flows:check", "npm run qa:flows"],
    relatedDocs: ["docs/MARKETING_OS_V9_GUIDED_FLOWS_RC.md"],
    safetyNotes: commonSafety,
    riskLevel: "baixo"
  },
  {
    path: "/flows/fechamento-semanal-completo",
    title: "Fechamento semanal completo",
    group: "comece-aqui",
    description: "Runner local de fluxo para fechar semana e gerar plano adaptativo.",
    maturity: "release-candidate",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/flows/[id]/page.tsx",
    expectedTexts: ["Fechamento semanal completo", "Pre-requisitos"],
    relatedScripts: ["npm run flows:check"],
    relatedDocs: ["docs/MARKETING_OS_V9_GUIDED_FLOWS_RC.md"],
    safetyNotes: commonSafety,
    riskLevel: "baixo"
  },
  {
    path: "/runbook",
    title: "Runbook Semanal",
    group: "comece-aqui",
    description: "Roteiro semanal por dia para operar sem improviso.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/runbook/page.tsx",
    expectedTexts: ["Runbook Semanal"],
    relatedScripts: ["npm run workspace:check"],
    relatedDocs: ["docs/MARKETING_OS_V8_WORKSPACE_HISTORY.md"],
    safetyNotes: commonSafety,
    riskLevel: "baixo"
  },
  {
    path: "/storyops",
    title: "StoryOps",
    group: "producao",
    description: "Sequencias de stories seguras e manuais.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/storyops/page.tsx",
    expectedTexts: ["StoryOps"],
    relatedScripts: ["npm run smoke:marketing"],
    relatedDocs: ["docs/MARKETING_OS_V3_EXECUTION_SUITE.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/studio",
    title: "Content Studio",
    group: "producao",
    description: "Pacotes de stories, reels, posts, carrosseis e briefings.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/studio/page.tsx",
    expectedTexts: ["Content Studio"],
    relatedScripts: ["npm run studio:check", "npm run qa:studio"],
    relatedDocs: ["docs/MARKETING_OS_V5_CONTENT_STUDIO.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/library",
    title: "Biblioteca Editorial",
    group: "producao",
    description: "Pilares, temas, hooks, templates e frases seguras.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/library/page.tsx",
    expectedTexts: ["Biblioteca Editorial"],
    relatedScripts: ["npm run studio:check"],
    relatedDocs: ["docs/MARKETING_OS_V5_CONTENT_STUDIO.md"],
    safetyNotes: commonSafety,
    riskLevel: "baixo"
  },
  {
    path: "/recording",
    title: "Planejamento de Gravacao",
    group: "producao",
    description: "Planeja lote de 8 a 10 videos e briefing para editor.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/recording/page.tsx",
    expectedTexts: ["Planejamento de Gravacao"],
    relatedScripts: ["npm run studio:check"],
    relatedDocs: ["docs/MARKETING_OS_V5_CONTENT_STUDIO.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/review",
    title: "Fila de Revisao",
    group: "producao",
    description: "Revisao local de status, scores, riscos e exportacoes.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/review/page.tsx",
    expectedTexts: ["Fila de Revisao"],
    relatedScripts: ["npm run studio:check"],
    relatedDocs: ["docs/MARKETING_OS_V5_CONTENT_STUDIO.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/campaigns",
    title: "Campanhas",
    group: "planejamento",
    description: "Motor mensal e referencias de campanha editorial.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/campaigns/page.tsx",
    expectedTexts: ["Campanhas"],
    relatedScripts: ["npm run smoke:marketing"],
    relatedDocs: ["docs/MARKETING_OS_V3_EXECUTION_SUITE.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/operations",
    title: "Operacoes",
    group: "planejamento",
    description: "Central operacional de hoje, semana e mes.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/operations/page.tsx",
    expectedTexts: ["Central Operacional"],
    relatedScripts: ["npm run smoke:marketing", "npm run flows:check"],
    relatedDocs: ["docs/MARKETING_OS_V3_EXECUTION_SUITE.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/strategy",
    title: "Estrategia",
    group: "planejamento",
    description: "Roadmap adaptativo 30/60/90 dias.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/strategy/page.tsx",
    expectedTexts: ["Estrategia"],
    relatedScripts: ["npm run intelligence:check"],
    relatedDocs: ["docs/MARKETING_OS_V6_INTELLIGENCE_LOOP.md"],
    safetyNotes: commonSafety,
    riskLevel: "baixo"
  },
  {
    path: "/experiments",
    title: "Experimentos",
    group: "planejamento",
    description: "Experimentos editoriais seguros e manuais.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/experiments/page.tsx",
    expectedTexts: ["Experimentos"],
    relatedScripts: ["npm run intelligence:check"],
    relatedDocs: ["docs/MARKETING_OS_V6_INTELLIGENCE_LOOP.md"],
    safetyNotes: commonSafety,
    riskLevel: "baixo"
  },
  {
    path: "/imports",
    title: "Importacoes",
    group: "metricas",
    description: "Colagem e normalizacao manual de CSV/TSV.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/imports/page.tsx",
    expectedTexts: ["Importacoes Manuais"],
    relatedScripts: ["npm run import:check"],
    relatedDocs: ["docs/MARKETING_OS_V7_GUIDED_REPORT_IMPORT.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/real-week",
    title: "Semana real",
    group: "metricas",
    description: "Importacao dos CSVs reais do Meta Business Suite e baseline da equipe atual.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/real-week/page.tsx",
    expectedTexts: ["Semana real"],
    relatedScripts: ["npm test"],
    relatedDocs: ["docs/SEMANA_REAL_001.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/metrics",
    title: "Metricas",
    group: "metricas",
    description: "Metricas manuais, parser e scores.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/metrics/page.tsx",
    expectedTexts: ["Metricas Manuais"],
    relatedScripts: ["npm run intelligence:check"],
    relatedDocs: ["docs/MARKETING_OS_V6_INTELLIGENCE_LOOP.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/performance",
    title: "Performance",
    group: "metricas",
    description: "Comparacoes semanais, ranking e oportunidades.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/performance/page.tsx",
    expectedTexts: ["Performance"],
    relatedScripts: ["npm run weekly:check"],
    relatedDocs: ["docs/MARKETING_OS_V7_GUIDED_REPORT_IMPORT.md"],
    safetyNotes: commonSafety,
    riskLevel: "baixo"
  },
  {
    path: "/insights",
    title: "Insights",
    group: "metricas",
    description: "Aprendizado editorial e oportunidades por dados manuais.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/insights/page.tsx",
    expectedTexts: ["Insights"],
    relatedScripts: ["npm run intelligence:check"],
    relatedDocs: ["docs/MARKETING_OS_V6_INTELLIGENCE_LOOP.md"],
    safetyNotes: commonSafety,
    riskLevel: "baixo"
  },
  {
    path: "/weekly-review",
    title: "Fechamento Semanal",
    group: "metricas",
    description: "Assistente semanal de importacao, validacao, aprendizado e plano.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/weekly-review/page.tsx",
    expectedTexts: ["Fechamento Semanal"],
    relatedScripts: ["npm run weekly:check", "npm run qa:weekly"],
    relatedDocs: ["docs/MARKETING_OS_V7_GUIDED_REPORT_IMPORT.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/safety",
    title: "Safety",
    group: "seguranca-qa",
    description: "Riscos medico-publicitarios, bloqueios e auditoria.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/safety/page.tsx",
    expectedTexts: ["Safety"],
    relatedScripts: ["npm run qa:marketing"],
    relatedDocs: ["docs/MARKETING_OS_V4_QA_DOGFOODING.md"],
    safetyNotes: commonSafety,
    riskLevel: "alto"
  },
  {
    path: "/qa",
    title: "QA",
    group: "seguranca-qa",
    description: "Qualidade editorial, tecnica, fluxos, workspace e V10.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/qa/page.tsx",
    expectedTexts: ["QA"],
    relatedScripts: ["npm run qa:flows", "npm run ui:a11y", "npm run ui:content"],
    relatedDocs: ["docs/MARKETING_OS_V10_PRODUCT_HARDENING.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/audit-log",
    title: "Registro Operacional",
    group: "seguranca-qa",
    description: "Eventos locais de auditoria e historico operacional.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/audit-log/page.tsx",
    expectedTexts: ["Registro Operacional"],
    relatedScripts: ["npm run workspace:check"],
    relatedDocs: ["docs/MARKETING_OS_V8_WORKSPACE_HISTORY.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/release",
    title: "Release Candidate",
    group: "seguranca-qa",
    description: "Prontidao local para PR, sem executar push ou GitHub API.",
    maturity: "release-candidate",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/release/page.tsx",
    expectedTexts: ["Release Candidate", "Release polish V10"],
    relatedScripts: ["npm run rc:check", "npm run product:check"],
    relatedDocs: ["docs/PR_READINESS_MARKETING_OS_V10.md"],
    safetyNotes: commonSafety,
    riskLevel: "baixo"
  },
  {
    path: "/workspace",
    title: "Workspace",
    group: "workspace",
    description: "Estado local, snapshots, backup/restore e integridade.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/workspace/page.tsx",
    expectedTexts: ["Workspace"],
    relatedScripts: ["npm run workspace:check", "npm run backup:check"],
    relatedDocs: ["docs/MARKETING_OS_V8_WORKSPACE_HISTORY.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/history",
    title: "Historico",
    group: "workspace",
    description: "Linha do tempo de ciclos, eventos e decisoes.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/history/page.tsx",
    expectedTexts: ["Historico"],
    relatedScripts: ["npm run workspace:check"],
    relatedDocs: ["docs/MARKETING_OS_V8_WORKSPACE_HISTORY.md"],
    safetyNotes: commonSafety,
    riskLevel: "baixo"
  },
  {
    path: "/settings",
    title: "Configuracoes",
    group: "workspace",
    description: "Preferencias locais sem tokens, senhas ou integracoes.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/settings/page.tsx",
    expectedTexts: ["Configuracoes Locais"],
    relatedScripts: ["npm run workspace:check"],
    relatedDocs: ["docs/MARKETING_OS_V8_WORKSPACE_HISTORY.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/exports",
    title: "Exportacoes",
    group: "workspace",
    description: "Pacotes copiaveis, sem publicacao automatica.",
    maturity: "operacional",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/exports/page.tsx",
    expectedTexts: ["Export"],
    relatedScripts: ["npm run smoke:marketing"],
    relatedDocs: ["docs/MARKETING_OS_V3_EXECUTION_SUITE.md"],
    safetyNotes: commonSafety,
    riskLevel: "medio"
  },
  {
    path: "/documentation",
    title: "Documentacao",
    group: "workspace",
    description: "Hub de documentos, relatorios, scripts e troubleshooting.",
    maturity: "release-candidate",
    visibility: "primary",
    localOnly: true,
    usesExternalApi: false,
    filePath: "app/documentation/page.tsx",
    expectedTexts: ["Documentacao", "Marketing OS v10"],
    relatedScripts: ["npm run product:check"],
    relatedDocs: ["docs/MARKETING_OS_V10_PRODUCT_HARDENING.md"],
    safetyNotes: commonSafety,
    riskLevel: "baixo"
  }
];

export function getProductRoutes() {
  return productRoutes;
}

export function getPrimaryProductRoutes() {
  return productRoutes.filter((route) => route.visibility === "primary");
}

export function getRoutesByGroup(group: RouteGroupId) {
  return productRoutes.filter((route) => route.group === group && route.visibility === "primary");
}

export function getRouteByPath(path: string) {
  return productRoutes.find((route) => route.path === path);
}

export function buildNavigationGroups() {
  return productRouteGroups.map((group) => ({
    ...group,
    routes: getRoutesByGroup(group.id)
  }));
}

export function validateRouteManifest(routes: ProductRoute[] = productRoutes) {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const route of routes) {
    if (!route.path.startsWith("/")) issues.push(`Path invalido: ${route.path}`);
    if (!route.title) issues.push(`Titulo ausente: ${route.path}`);
    if (!route.description) issues.push(`Descricao ausente: ${route.path}`);
    if (!route.expectedTexts.length) issues.push(`Expected text ausente: ${route.path}`);
    if (route.usesExternalApi) issues.push(`Rota marcada com API externa: ${route.path}`);
    if (seen.has(route.path)) issues.push(`Path duplicado: ${route.path}`);
    seen.add(route.path);
  }
  return { ok: issues.length === 0, issues };
}
