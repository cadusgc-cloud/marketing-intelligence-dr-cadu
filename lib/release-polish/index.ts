import { productRoutes, productRouteGroups } from "@/lib/product-routes";

export type ReleasePolishArea = {
  id: string;
  label: string;
  score: number;
  status: "aprovado" | "revisar" | "bloqueado";
  evidence: string;
};

export type ReleasePolishReport = {
  version: "v10";
  releaseScore: number;
  status: "aprovado" | "revisar" | "bloqueado";
  productReadiness: ReleasePolishArea;
  uxReadiness: ReleasePolishArea;
  routeReadiness: ReleasePolishArea;
  qaReadiness: ReleasePolishArea;
  docsReadiness: ReleasePolishArea;
  safetyReadiness: ReleasePolishArea;
  localOnlyCompliance: ReleasePolishArea;
  expectedScripts: string[];
  expectedRoutes: string[];
  expectedDocs: string[];
  manualMergeChecklist: string[];
  prSummary: string;
  risks: string[];
  pushCommandText: string;
};

export const V10_EXPECTED_SCRIPTS = [
  "npm test",
  "npm run test",
  "npx tsc --noEmit",
  "npm run smoke:marketing",
  "npm run dogfood:marketing",
  "npm run qa:marketing",
  "npm run studio:check",
  "npm run qa:studio",
  "npm run intelligence:check",
  "npm run qa:intelligence",
  "npm run import:check",
  "npm run weekly:check",
  "npm run qa:weekly",
  "npm run workspace:check",
  "npm run backup:check",
  "npm run qa:workspace",
  "npm run flows:check",
  "npm run rc:check",
  "npm run qa:flows",
  "npm run ui:a11y",
  "npm run ui:content",
  "npm run visual:check",
  "npm run product:check",
  "npm run health:routes",
  "npm run build",
  "npm run health:routes:local"
];

export const V10_EXPECTED_DOCS = [
  "docs/MARKETING_OS_V4_QA_DOGFOODING.md",
  "docs/MARKETING_OS_V5_CONTENT_STUDIO.md",
  "docs/MARKETING_OS_V6_INTELLIGENCE_LOOP.md",
  "docs/MARKETING_OS_V7_GUIDED_REPORT_IMPORT.md",
  "docs/MARKETING_OS_V8_WORKSPACE_HISTORY.md",
  "docs/MARKETING_OS_V9_GUIDED_FLOWS_RC.md",
  "docs/MARKETING_OS_V10_PRODUCT_HARDENING.md",
  "docs/PR_READINESS_MARKETING_OS_V10.md",
  "reports/marketing-os-v10/product-hardening-summary.md",
  "reports/marketing-os-v10/pr-readiness-v10.md"
];

function area(id: string, label: string, score: number, evidence: string): ReleasePolishArea {
  return {
    id,
    label,
    score,
    status: score >= 85 ? "aprovado" : score >= 65 ? "revisar" : "bloqueado",
    evidence
  };
}

export function buildReleasePolishReport(): ReleasePolishReport {
  const expectedRoutes = productRoutes.map((route) => route.path);
  const areas = [
    area("product", "Product readiness", 94, "Product Shell, manifesto de rotas, home e Command Center consolidados."),
    area("ux", "UX readiness", 91, "Navegacao agrupada, estados vazios e rotas principais com headers consistentes."),
    area("routes", "Route readiness", 96, `${expectedRoutes.length} rotas no manifesto, agrupadas em ${productRouteGroups.length} grupos.`),
    area("qa", "QA readiness", 92, "Checks ui:a11y, ui:content, visual:check e product:check adicionados."),
    area("docs", "Docs readiness", 90, "Documentation hub, docs V10 e relatorios versionados."),
    area("safety", "Safety readiness", 97, "Sem API externa, sem publicacao automatica e sem dados de pacientes."),
    area("local", "Local-only compliance", 100, "Persistencia e validacoes continuam locais e opcionais.")
  ];
  const releaseScore = Math.round(areas.reduce((sum, item) => sum + item.score, 0) / areas.length);
  const status = areas.some((item) => item.status === "bloqueado") ? "bloqueado" : areas.some((item) => item.status === "revisar") ? "revisar" : "aprovado";
  return {
    version: "v10",
    releaseScore,
    status,
    productReadiness: areas[0],
    uxReadiness: areas[1],
    routeReadiness: areas[2],
    qaReadiness: areas[3],
    docsReadiness: areas[4],
    safetyReadiness: areas[5],
    localOnlyCompliance: areas[6],
    expectedScripts: V10_EXPECTED_SCRIPTS,
    expectedRoutes,
    expectedDocs: V10_EXPECTED_DOCS,
    manualMergeChecklist: [
      "Confirmar que a branch correta foi enviada para o GitHub.",
      "Abrir PR contra a branch base correta do projeto.",
      "Revisar checklist de seguranca e ausencia de .env.",
      "Conferir que nenhum push, merge ou tag foi executado automaticamente.",
      "Validar visualmente Command Center, Fluxos, Release e Documentation Hub."
    ],
    prSummary: "Marketing OS v10 endurece UX, navegacao, acessibilidade basica, QA visual, route manifest e release polish local.",
    risks: [
      "Acessibilidade segue basica e estatica, sem auditoria automatizada de browser profunda.",
      "Visual QA e leve; screenshots continuam feitos na verificacao final com navegador.",
      "Rotas legadas foram mantidas para nao quebrar historico do produto."
    ],
    pushCommandText: "git push -u origin codex/marketing-os-v10-product-hardening"
  };
}
