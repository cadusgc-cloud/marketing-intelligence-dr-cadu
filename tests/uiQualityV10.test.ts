import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { analyzeAccessibilityFiles, analyzeUiContentFiles, analyzeVisualQa } from "@/lib/ui-quality";
import { productRoutes } from "@/lib/product-routes";

describe("Marketing OS v10 - UI Quality", () => {
  it("UI Content QA detecta promessa proibida em UI", () => {
    const report = analyzeUiContentFiles([{ path: "app/fake/page.tsx", content: "resultado garantido para todos" }]);
    expect(report.status).toBe("bloqueado");
  });

  it("UI Content QA detecta antes/depois indevido", () => {
    const report = analyzeUiContentFiles([{ path: "components/fake.tsx", content: "antes e depois incrivel" }]);
    expect(report.issues.length).toBeGreaterThan(0);
  });

  it("UI Content QA detecta token e senha fora de contexto", () => {
    const report = analyzeUiContentFiles([{ path: "app/fake/page.tsx", content: "token=abc senha aberta" }]);
    expect(report.status).toBe("bloqueado");
  });

  it("UI Content QA permite termos proibidos em lista de bloqueio", () => {
    const report = analyzeUiContentFiles([{ path: "lib/product-copy/index.ts", content: "frases proibidas: resultado garantido" }]);
    expect(report.status).toBe("aprovado");
  });

  it("UI Content QA permite docs de seguranca", () => {
    const report = analyzeUiContentFiles([{ path: "docs/SEGURANCA.md", content: "seguranca: bloquear antes e depois" }]);
    expect(report.status).toBe("aprovado");
  });

  it("UI Content QA bloqueia chamada agressiva em copy aprovada", () => {
    const report = analyzeUiContentFiles([{ path: "app/landing/page.tsx", content: "agende agora" }]);
    expect(report.status).toBe("bloqueado");
  });

  it("Accessibility checker detecta pagina sem h1", () => {
    const route = productRoutes.find((item) => item.path === "/command-center")!;
    const report = analyzeAccessibilityFiles([{ path: route.filePath, content: "<section>sem titulo</section>" }], [route]);
    expect(report.status).toBe("bloqueado");
  });

  it("Accessibility checker aceita PageHeader como h1 compartilhado", () => {
    const route = productRoutes.find((item) => item.path === "/command-center")!;
    const report = analyzeAccessibilityFiles([{ path: route.filePath, content: "<PageHeader title=\"Command Center\" />" }], [route]);
    expect(report.status).toBe("aprovado");
  });

  it("Accessibility checker detecta botao sem texto", () => {
    const report = analyzeAccessibilityFiles([{ path: "components/fake.tsx", content: "<button></button>" }], []);
    expect(report.status).toBe("bloqueado");
  });

  it("Accessibility checker detecta input sem label", () => {
    const report = analyzeAccessibilityFiles([{ path: "components/fake.tsx", content: "<input />" }], []);
    expect(report.status).toBe("bloqueado");
  });

  it("Accessibility checker detecta imagem sem alt", () => {
    const report = analyzeAccessibilityFiles([{ path: "components/fake.tsx", content: "<img src=\"/x.png\" />" }], []);
    expect(report.status).toBe("bloqueado");
  });

  it("Accessibility checker detecta link generico", () => {
    const report = analyzeAccessibilityFiles([{ path: "components/fake.tsx", content: "<a>clique aqui</a>" }], []);
    expect(report.status).toBe("revisar");
  });

  it("Visual QA valida manifesto e nao exige screenshot", () => {
    const report = analyzeVisualQa(productRoutes);
    expect(report.status).toBe("aprovado");
  });

  it("Visual QA detecta expectedText ausente", () => {
    const broken = [{ ...productRoutes[0], expectedTexts: [] }];
    const report = analyzeVisualQa(broken);
    expect(report.status).toBe("bloqueado");
  });

  it("scripts ui:a11y, ui:content, visual:check e product:check passam", () => {
    expect(execSync("npm run ui:a11y", { encoding: "utf8" })).toContain("Status: aprovado");
    expect(execSync("npm run ui:content", { encoding: "utf8" })).toContain("Status: aprovado");
    expect(execSync("npm run visual:check", { encoding: "utf8" })).toContain("Status: aprovado");
    expect(execSync("npm run product:check", { encoding: "utf8" })).toContain("Status: aprovado");
  }, 60000);

  it("relatorios V10 existem", () => {
    [
      "reports/marketing-os-v10/product-hardening-summary.md",
      "reports/marketing-os-v10/ux-audit-report.md",
      "reports/marketing-os-v10/accessibility-report.md",
      "reports/marketing-os-v10/ui-content-safety-report.md",
      "reports/marketing-os-v10/route-manifest-report.md",
      "reports/marketing-os-v10/visual-qa-report.md",
      "reports/marketing-os-v10/release-polish-report.md",
      "reports/marketing-os-v10/navigation-report.md",
      "reports/marketing-os-v10/documentation-hub-report.md",
      "reports/marketing-os-v10/pr-readiness-v10.md"
    ].forEach((file) => expect(existsSync(file)).toBe(true));
  });
});
