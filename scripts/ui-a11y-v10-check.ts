import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { analyzeAccessibilityFiles, type UiQualityFile } from "../lib/ui-quality";

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) return walk(full);
    if (/\.(tsx|ts)$/.test(full)) return [full];
    return [];
  });
}

export function runUiA11yV10Check() {
  const files: UiQualityFile[] = [...walk("app"), ...walk("components")].map((file) => ({
    path: file.replace(/\\/g, "/"),
    content: readFileSync(file, "utf8")
  }));
  const report = analyzeAccessibilityFiles(files);
  mkdirSync("reports/marketing-os-v10", { recursive: true });
  writeFileSync(
    "reports/marketing-os-v10/accessibility-report.md",
    [
      "# Accessibility report V10",
      "",
      `Status: ${report.status}`,
      `Score: ${report.score}/100`,
      "",
      "## Checks",
      "- h1 em paginas principais do manifesto",
      "- botoes com texto",
      "- inputs com label ou aria-label",
      "- imagens com alt",
      "- links nao genericos",
      "",
      "## Achados",
      ...(report.issues.length ? report.issues.map((issue) => `- ${issue.severity}: ${issue.file} - ${issue.message}`) : ["- nenhum achado bloqueante"])
    ].join("\n")
  );
  console.log("Marketing OS V10 UI a11y check");
  console.log(`Status: ${report.status}`);
  console.log(`Score: ${report.score}/100`);
  console.log(`Issues: ${report.issues.length}`);
  return report.status === "bloqueado" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(runUiA11yV10Check());
}
