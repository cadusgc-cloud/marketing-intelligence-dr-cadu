import { UI_FORBIDDEN_TERMS } from "@/lib/product-copy";
import { getRouteByPath, productRoutes, validateRouteManifest, type ProductRoute } from "@/lib/product-routes";

export type UiQualityFile = {
  path: string;
  content: string;
};

export type UiQualityIssue = {
  file: string;
  rule: string;
  message: string;
  severity: "aviso" | "bloqueante";
};

export type UiQualityReport = {
  status: "aprovado" | "revisar" | "bloqueado";
  score: number;
  issues: UiQualityIssue[];
};

const allowedContextPatterns = [
  /frases?\s+proibid/i,
  /termos?\s+bloquead/i,
  /lista\s+de\s+bloqueio/i,
  /safety/i,
  /seguranca/i,
  /qa/i,
  /detec/i,
  /allowlist/i
];

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isAllowedContentContext(file: UiQualityFile, term: string) {
  const normalizedPath = normalizeText(file.path);
  const normalizedContent = normalizeText(file.content);
  if (normalizedPath.includes("tests/") || normalizedPath.includes("tests\\")) return true;
  if (normalizedPath.includes("product-copy")) return true;
  if (normalizedPath.includes("marketing-quality") || normalizedPath.includes("report-imports") || normalizedPath.includes("safety")) return true;
  if ((normalizedPath.includes("docs/") || normalizedPath.includes("reports/")) && (allowedContextPatterns.some((pattern) => pattern.test(normalizedContent)) || normalizedPath.includes("brand-voice-audit") || normalizedPath.includes("data_collection_guide") || normalizedPath.includes("collection-guide"))) return true;
  if (term === "cookie" && normalizedContent.includes("token, cookie ou senha")) return true;
  if (["senha", "password", "secret", "cookie"].includes(term) && (normalizedContent.includes("nao devem ser colados") || normalizedContent.includes("nao colar") || normalizedContent.includes("sem tokens") || normalizedContent.includes("nao ha token"))) return true;
  return false;
}

export function analyzeUiContentFiles(files: UiQualityFile[]): UiQualityReport {
  const issues: UiQualityIssue[] = [];
  for (const file of files) {
    const normalizedContent = normalizeText(file.content);
    for (const term of UI_FORBIDDEN_TERMS) {
      const normalizedTerm = normalizeText(term);
      if (normalizedContent.includes(normalizedTerm) && !isAllowedContentContext(file, term)) {
        issues.push({
          file: file.path,
          rule: "ui-content",
          message: `Termo sensivel encontrado fora de contexto permitido: ${term}`,
          severity: "bloqueante"
        });
      }
    }
  }
  return scoreIssues(issues);
}

function getDefaultAccessibilityRoutes(): ProductRoute[] {
  return ["/", "/command-center", "/flows", "/release", "/onboarding", "/documentation"]
    .map((route) => getRouteByPath(route))
    .filter((route): route is ProductRoute => Boolean(route));
}

export function analyzeAccessibilityFiles(files: UiQualityFile[], routes: ProductRoute[] = getDefaultAccessibilityRoutes()): UiQualityReport {
  const issues: UiQualityIssue[] = [];
  const routeFiles = new Set(routes.map((route) => route.filePath.replace(/\\/g, "/")));
  for (const file of files) {
    const normalizedPath = file.path.replace(/\\/g, "/");
    const content = file.content;
    if (routeFiles.has(normalizedPath) && !/<h1[\s>]/i.test(content) && !/<PageHeader\b/i.test(content)) {
      issues.push({ file: file.path, rule: "a11y-h1", message: "Pagina principal sem h1 claro.", severity: "bloqueante" });
    }
    if (/<button\b[^>]*>\s*<\/button>/i.test(content) && !/aria-label=/i.test(content)) {
      issues.push({ file: file.path, rule: "a11y-button", message: "Botao sem texto acessivel.", severity: "bloqueante" });
    }
    if (/<input\b/i.test(content) && !/(<label\b|aria-label=|aria-labelledby=)/i.test(content)) {
      issues.push({ file: file.path, rule: "a11y-input", message: "Input sem label ou aria-label.", severity: "bloqueante" });
    }
    if (/<img\b/i.test(content) && !/alt=/i.test(content)) {
      issues.push({ file: file.path, rule: "a11y-img", message: "Imagem sem alt.", severity: "bloqueante" });
    }
    if (/>\s*clique aqui\s*</i.test(content)) {
      issues.push({ file: file.path, rule: "a11y-link", message: "Link generico encontrado.", severity: "aviso" });
    }
  }
  return scoreIssues(issues);
}

export function analyzeVisualQa(routes: ProductRoute[] = productRoutes): UiQualityReport {
  const issues: UiQualityIssue[] = [];
  const manifest = validateRouteManifest(routes);
  for (const issue of manifest.issues) {
    issues.push({ file: "lib/product-routes/index.ts", rule: "route-manifest", message: issue, severity: "bloqueante" });
  }
  for (const route of routes) {
    if (route.expectedTexts.length < 1) {
      issues.push({ file: route.filePath, rule: "expected-text", message: `Rota sem texto esperado: ${route.path}`, severity: "bloqueante" });
    }
  }
  return scoreIssues(issues);
}

function scoreIssues(issues: UiQualityIssue[]): UiQualityReport {
  const blocking = issues.filter((issue) => issue.severity === "bloqueante").length;
  const warnings = issues.length - blocking;
  const score = Math.max(0, 100 - blocking * 25 - warnings * 8);
  return {
    status: blocking > 0 ? "bloqueado" : warnings > 0 ? "revisar" : "aprovado",
    score,
    issues
  };
}
