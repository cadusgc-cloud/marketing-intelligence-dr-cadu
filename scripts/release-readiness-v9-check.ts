import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getGuidedFlowCatalog } from "../lib/guided-flows";
import { buildDefaultReleaseReadinessReport, expectedReleaseCommands, expectedReleaseDocs, expectedReleaseRoutes, generateReleaseReadinessReport } from "../lib/release-readiness";

function fail(message: string): never {
  throw new Error(message);
}

export function runReleaseReadinessV9Check(): number {
  mkdirSync("reports/marketing-os-v9", { recursive: true });
  expectedReleaseDocs
    .filter((docPath) => docPath.startsWith("reports/marketing-os-v9/"))
    .forEach((docPath) => {
      const fullPath = path.join(process.cwd(), docPath);
      if (!existsSync(fullPath)) writeFileSync(fullPath, `# ${path.basename(docPath, ".md")}\n\nRelatorio V9 gerado localmente pelo rc:check.\n`);
    });
  const missingRoutes = expectedReleaseRoutes
    .filter(([route]) => {
      if (route === "/") return !existsSync(path.join(process.cwd(), "app/page.tsx"));
      if (route.startsWith("/flows/")) return !existsSync(path.join(process.cwd(), "app/flows/[id]/page.tsx"));
      return !existsSync(path.join(process.cwd(), `app${route}/page.tsx`));
    })
    .map(([route]) => route);
  const missingDocs = expectedReleaseDocs.filter((docPath) => !existsSync(path.join(process.cwd(), docPath)));
  const report = generateReleaseReadinessReport({ missingRoutes, missingDocs });
  const defaultReport = buildDefaultReleaseReadinessReport();
  const flows = getGuidedFlowCatalog();

  if (flows.length < 15) fail("RC V9 exige pelo menos 15 fluxos.");
  if (missingRoutes.length) fail(`Rotas ausentes: ${missingRoutes.join(", ")}`);
  if (defaultReport.prDraft.markdown.includes("git push -u origin") && defaultReport.prDraft.markdown.includes("automaticamente")) {
    fail("PR draft nao deve sugerir push automatico.");
  }
  if (/token|senha|cookie|paciente de hoje|prontuario/i.test(defaultReport.prDraft.markdown)) fail("PR draft contem termo sensivel.");
  if (!defaultReport.prDraft.title.includes("Marketing OS v9")) fail("PR draft deve ter titulo V9.");
  if (expectedReleaseCommands.length < 20) fail("Checklist de comandos incompleto.");

  writeFileSync("reports/marketing-os-v9/release-readiness-report.md", `${report.reportMarkdown.trim()}\n`);
  writeFileSync("reports/marketing-os-v9/pr-draft.md", `# ${report.prDraft.title}\n\n${report.prDraft.markdown.trim()}\n`);

  console.log("Marketing OS V9 release readiness check");
  console.log(`Status: ${report.status}`);
  console.log(`Rotas esperadas: ${expectedReleaseRoutes.length}`);
  console.log(`Scripts esperados: ${expectedReleaseCommands.length}`);
  console.log(`Docs esperadas: ${expectedReleaseDocs.length}`);
  return report.status === "bloqueado" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exit(runReleaseReadinessV9Check());
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
