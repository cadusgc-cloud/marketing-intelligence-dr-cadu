import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildReleasePolishReport, V10_EXPECTED_DOCS, V10_EXPECTED_SCRIPTS } from "@/lib/release-polish";
import { productRoutes } from "@/lib/product-routes";

describe("Marketing OS v10 - Release Polish e Documentation", () => {
  const report = buildReleasePolishReport();

  it("release score e readiness existem", () => {
    expect(report.releaseScore).toBeGreaterThanOrEqual(85);
    expect(report.productReadiness.score).toBeGreaterThan(0);
    expect(report.uxReadiness.score).toBeGreaterThan(0);
    expect(report.routeReadiness.score).toBeGreaterThan(0);
    expect(report.qaReadiness.score).toBeGreaterThan(0);
    expect(report.docsReadiness.score).toBeGreaterThan(0);
    expect(report.safetyReadiness.score).toBeGreaterThan(0);
    expect(report.localOnlyCompliance.score).toBe(100);
  });

  it("release nao executa push nem GitHub API", () => {
    expect(report.pushCommandText).toContain("git push -u origin codex/marketing-os-v10-product-hardening");
    expect(report.prSummary.toLowerCase()).not.toContain("github api");
  });

  it("checklist de merge manual existe", () => {
    expect(report.manualMergeChecklist.length).toBeGreaterThanOrEqual(5);
  });

  it("scripts V10 esperados incluem novos checks", () => {
    ["npm run ui:a11y", "npm run ui:content", "npm run visual:check", "npm run product:check"].forEach((script) => {
      expect(V10_EXPECTED_SCRIPTS).toContain(script);
    });
  });

  it("documentation hub lista docs V4 a V10", () => {
    const page = readFileSync("app/documentation/page.tsx", "utf8");
    ["V4", "V5", "V6", "V7", "V8", "V9", "V10"].forEach((version) => expect(page).toContain(version));
    expect(page).toContain("nao le arquivos em runtime");
  });

  it("docs V10 existem", () => {
    expect(existsSync("docs/MARKETING_OS_V10_PRODUCT_HARDENING.md")).toBe(true);
    expect(existsSync("docs/PR_READINESS_MARKETING_OS_V10.md")).toBe(true);
    V10_EXPECTED_DOCS.filter((doc) => doc.startsWith("docs/")).forEach((doc) => expect(existsSync(doc)).toBe(true));
  });

  it("README menciona V10", () => {
    expect(readFileSync("README.md", "utf8")).toContain("Marketing OS v10");
  });

  it("health routes inclui documentation e usa manifesto", () => {
    const output = execSync("npm run health:routes", { encoding: "utf8" });
    expect(output).toContain("/documentation");
    expect(productRoutes.some((route) => route.path === "/documentation")).toBe(true);
  }, 30000);

  it("rc:check inclui release polish V10", () => {
    expect(execSync("npm run rc:check", { encoding: "utf8" })).toContain("V10 release polish");
  }, 30000);
});
