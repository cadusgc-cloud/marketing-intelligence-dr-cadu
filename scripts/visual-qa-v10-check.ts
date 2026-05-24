import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { analyzeVisualQa } from "../lib/ui-quality";
import { productRoutes } from "../lib/product-routes";

export async function runVisualQaV10Check(args: string[] = []) {
  const baseIndex = args.indexOf("--base");
  const baseUrl = baseIndex >= 0 ? args[baseIndex + 1] : undefined;
  const report = analyzeVisualQa(productRoutes);
  const fileIssues = productRoutes
    .filter((route) => !existsSync(route.filePath))
    .map((route) => `${route.path}: arquivo ausente ${route.filePath}`);
  const sourceWarnings = productRoutes
    .filter((route) => existsSync(route.filePath))
    .filter((route) => route.path !== "/flows/fechamento-semanal-completo")
    .filter((route) => {
      const content = readFileSync(route.filePath, "utf8");
      return !route.expectedTexts.some((expected) => content.includes(expected));
    })
    .map((route) => `${route.path}: texto esperado nao encontrado no fonte`);

  const localResults: string[] = [];
  if (baseUrl) {
    for (const route of productRoutes.slice(0, 12)) {
      const started = Date.now();
      const response = await fetch(new URL(route.path, baseUrl));
      const html = await response.text();
      const ok = response.status === 200 && route.expectedTexts.some((expected) => html.includes(expected)) && !/Unhandled Runtime Error|Application error|500/.test(html);
      localResults.push(`${ok ? "OK" : "FALHA"} ${route.path} ${response.status} ${Date.now() - started}ms`);
    }
  }

  const ok = report.status !== "bloqueado" && fileIssues.length === 0;
  mkdirSync("reports/marketing-os-v10", { recursive: true });
  writeFileSync(
    "reports/marketing-os-v10/visual-qa-report.md",
    [
      "# Visual QA report V10",
      "",
      `Status: ${ok ? "aprovado" : "bloqueado"}`,
      `Rotas no manifesto: ${productRoutes.length}`,
      "",
      "## Arquivos",
      ...(fileIssues.length ? fileIssues.map((issue) => `- ${issue}`) : ["- todos os arquivos de rota existem"]),
      "",
      "## Avisos de texto estatico",
      ...(sourceWarnings.length ? sourceWarnings.slice(0, 20).map((issue) => `- ${issue}`) : ["- textos principais encontrados no fonte"]),
      "",
      "## Local",
      ...(localResults.length ? localResults.map((line) => `- ${line}`) : ["- modo local nao solicitado"])
    ].join("\n")
  );
  console.log("Marketing OS V10 visual QA check");
  console.log(`Status: ${ok ? "aprovado" : "bloqueado"}`);
  console.log(`Rotas: ${productRoutes.length}`);
  console.log(`Warnings: ${sourceWarnings.length}`);
  return ok ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runVisualQaV10Check(process.argv.slice(2)).then((code) => process.exit(code));
}
