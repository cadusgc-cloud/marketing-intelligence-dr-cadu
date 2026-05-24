import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { analyzeUiContentFiles, type UiQualityFile } from "../lib/ui-quality";

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) return walk(full);
    if (/\.(tsx|ts|md)$/.test(full)) return [full];
    return [];
  });
}

export function runUiContentV10Check() {
  const files: UiQualityFile[] = ["app", "components", "lib/product-copy", "lib/product-ui", "lib/product-routes", "docs", "reports"].flatMap(walk).map((file) => ({
    path: file.replace(/\\/g, "/"),
    content: readFileSync(file, "utf8")
  }));
  const report = analyzeUiContentFiles(files);
  mkdirSync("reports/marketing-os-v10", { recursive: true });
  writeFileSync(
    "reports/marketing-os-v10/ui-content-safety-report.md",
    [
      "# UI content safety report V10",
      "",
      `Status: ${report.status}`,
      `Score: ${report.score}/100`,
      "",
      "## Allowlist",
      "- listas de bloqueio",
      "- testes de deteccao",
      "- docs e relatorios de seguranca/QA",
      "- avisos explicitos para nao colar credenciais",
      "",
      "## Achados",
      ...(report.issues.length ? report.issues.map((issue) => `- ${issue.severity}: ${issue.file} - ${issue.message}`) : ["- nenhum uso indevido encontrado"])
    ].join("\n")
  );
  console.log("Marketing OS V10 UI content check");
  console.log(`Status: ${report.status}`);
  console.log(`Score: ${report.score}/100`);
  console.log(`Issues: ${report.issues.length}`);
  return report.status === "bloqueado" ? 1 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(runUiContentV10Check());
}
