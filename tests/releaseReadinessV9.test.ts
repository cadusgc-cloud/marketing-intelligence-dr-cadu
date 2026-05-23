import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildDefaultReleaseReadinessReport,
  expectedReleaseCommands,
  expectedReleaseDocs,
  expectedReleaseRoutes,
  generatePullRequestDraft,
  generateReleaseReadinessReport
} from "@/lib/release-readiness";

describe("Marketing OS v9 - release readiness", () => {
  const report = buildDefaultReleaseReadinessReport();

  it("gera release readiness aprovado por padrao", () => {
    expect(report.status).toBe("aprovado");
  });

  it("tem checklist, rotas, scripts, docs, seguranca e riscos", () => {
    expect(report.checklist.length).toBeGreaterThan(5);
    expect(report.routes.length).toBe(expectedReleaseRoutes.length);
    expect(report.commands.length).toBe(expectedReleaseCommands.length);
    expect(report.docs.length).toBe(expectedReleaseDocs.length);
    expect(report.risks.length).toBeGreaterThan(0);
  });

  it.each(["/command-center", "/flows", "/flows/fechamento-semanal-completo", "/release", "/onboarding"])("rota nova %s esta no RC", (route) => {
    expect(report.routes.some((item) => item.route === route)).toBe(true);
  });

  it.each(["npm run flows:check", "npm run rc:check", "npm run qa:flows"])("script novo %s esta no RC", (command) => {
    expect(report.commands.some((item) => item.command === command)).toBe(true);
  });

  it("detecta rota ausente", () => {
    const broken = generateReleaseReadinessReport({ missingRoutes: ["/command-center"] });
    expect(broken.status).toBe("bloqueado");
    expect(broken.routes.find((route) => route.route === "/command-center")?.status).toBe("bloqueado");
  });

  it("detecta doc ausente", () => {
    const broken = generateReleaseReadinessReport({ missingDocs: ["docs/MARKETING_OS_V9_GUIDED_FLOWS_RC.md"] });
    expect(broken.status).toBe("revisar");
  });

  it("detecta comando falhando", () => {
    const broken = generateReleaseReadinessReport({ failingCommands: ["npm run build"] });
    expect(broken.status).toBe("bloqueado");
  });

  it("seguranca registra ausencia de API, paciente, env e push", () => {
    expect(report.safety.noExternalApi).toBe(true);
    expect(report.safety.noAutoPublishing).toBe(true);
    expect(report.safety.noPatientData).toBe(true);
    expect(report.safety.noEnvChange).toBe(true);
    expect(report.safety.noPushMergeTag).toBe(true);
  });

  it("push aparece apenas como texto", () => {
    expect(report.pushCommandText).toContain("git push -u origin codex/marketing-os-v9-guided-flows-rc");
    expect(report.reportMarkdown).toContain("Nao executar push automaticamente.");
  });

  it("gera PR draft com titulo, resumo e seguranca", () => {
    expect(report.prDraft.title).toContain("Marketing OS v9");
    expect(report.prDraft.markdown).toContain("## Resumo");
    expect(report.prDraft.markdown).toContain("## Seguranca");
    expect(report.prDraft.markdown).toContain("Sem API externa");
  });

  it("PR draft lista rotas dominios scripts validacoes e riscos", () => {
    expect(report.prDraft.markdown).toContain("## Rotas");
    expect(report.prDraft.markdown).toContain("## Scripts");
    expect(report.prDraft.markdown).toContain("## Como testar localmente");
    expect(report.prDraft.markdown).toContain("## Riscos remanescentes");
  });

  it("PR draft nao contem segredo nem push automatico", () => {
    expect(report.prDraft.markdown.toLowerCase()).not.toMatch(/senha|cookie|token|prontuario/);
    expect(report.prDraft.markdown.toLowerCase()).not.toContain("push automatico");
  });

  it("gera PR draft direto a partir de report parcial", () => {
    const { prDraft, reportMarkdown, ...partial } = report;
    expect(generatePullRequestDraft(partial).markdown).toBe(prDraft.markdown);
    expect(reportMarkdown).toContain("Release Candidate V9");
  });

  it("rc:check passa", () => {
    expect(execSync("npm run rc:check", { encoding: "utf8" })).toContain("Status: aprovado");
  }, 30000);

  it("docs V9 existem", () => {
    expect(existsSync("docs/MARKETING_OS_V9_GUIDED_FLOWS_RC.md")).toBe(true);
    expect(existsSync("docs/PR_READINESS_MARKETING_OS_V9.md")).toBe(true);
  });

  it.each(expectedReleaseDocs)("doc ou relatorio esperado existe: %s", (docPath) => {
    expect(existsSync(docPath)).toBe(true);
  });

  it("README menciona V9", () => {
    expect(readFileSync("README.md", "utf8")).toContain("Marketing OS v9");
  });
});
