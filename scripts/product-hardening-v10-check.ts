import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { validateRouteManifest, productRoutes, productRouteGroups } from "../lib/product-routes";
import { buildReleasePolishReport, V10_EXPECTED_DOCS } from "../lib/release-polish";
import { runUiA11yV10Check } from "./ui-a11y-v10-check";
import { runUiContentV10Check } from "./ui-content-v10-check";
import { runVisualQaV10Check } from "./visual-qa-v10-check";

function writeReport(file: string, content: string) {
  mkdirSync("reports/marketing-os-v10", { recursive: true });
  writeFileSync(`reports/marketing-os-v10/${file}`, `${content.trim()}\n`);
}

export async function runProductHardeningV10Check() {
  const manifest = validateRouteManifest(productRoutes);
  const polish = buildReleasePolishReport();
  const missingDocs = V10_EXPECTED_DOCS.filter((doc) => doc.startsWith("docs/") && !existsSync(doc));
  const a11yCode = runUiA11yV10Check();
  const contentCode = runUiContentV10Check();
  const visualCode = await runVisualQaV10Check();
  const ok = manifest.ok && missingDocs.length === 0 && a11yCode === 0 && contentCode === 0 && visualCode === 0 && polish.status === "aprovado";

  writeReport(
    "product-hardening-summary.md",
    [
      "# Product hardening summary V10",
      "",
      "Objetivo: endurecer o Marketing OS como produto local, navegavel, acessivel e pronto para release manual.",
      "",
      "## Areas melhoradas",
      "- Product Shell e componentes compartilhados",
      "- Route Manifest",
      "- Navegacao global agrupada",
      "- Home apontando para Command Center",
      "- Error boundary e not-found",
      "- QA de acessibilidade, conteudo e visual",
      "- Release polish e Documentation Hub",
      "",
      `Rotas no manifesto: ${productRoutes.length}`,
      `Grupos: ${productRouteGroups.length}`,
      `Release score: ${polish.releaseScore}/100`
    ].join("\n")
  );
  writeReport(
    "route-manifest-report.md",
    [
      "# Route manifest report V10",
      "",
      `Status: ${manifest.ok ? "aprovado" : "bloqueado"}`,
      "",
      ...productRouteGroups.flatMap((group) => [
        `## ${group.title}`,
        ...productRoutes.filter((route) => route.group === group.id).map((route) => `- ${route.path}: ${route.title} | localOnly=${route.localOnly} | usesExternalApi=${route.usesExternalApi}`)
      ])
    ].join("\n")
  );
  writeReport(
    "release-polish-report.md",
    [
      "# Release polish report V10",
      "",
      `Status: ${polish.status}`,
      `Release score: ${polish.releaseScore}/100`,
      "",
      ...[polish.productReadiness, polish.uxReadiness, polish.routeReadiness, polish.qaReadiness, polish.docsReadiness, polish.safetyReadiness, polish.localOnlyCompliance].map((area) => `- ${area.label}: ${area.score}/100 (${area.status})`)
    ].join("\n")
  );
  writeReport(
    "navigation-report.md",
    [
      "# Navigation report V10",
      "",
      "A navegacao principal foi agrupada em seis blocos operacionais.",
      "",
      ...productRouteGroups.map((group) => `- ${group.title}: ${productRoutes.filter((route) => route.group === group.id).length} rotas`)
    ].join("\n")
  );
  writeReport(
    "documentation-hub-report.md",
    [
      "# Documentation hub report V10",
      "",
      "- Rota: /documentation",
      "- Lista docs V4-V10",
      "- Lista relatorios versionados",
      "- Lista scripts de validacao",
      "- Inclui troubleshooting de dev server, .next e CSS"
    ].join("\n")
  );
  writeReport(
    "ux-audit-report.md",
    [
      "# UX audit report V10",
      "",
      "- Home simplificada para Command Center",
      "- Command Center com top 3 acoes",
      "- Release com readiness visual",
      "- Onboarding com fluxo semanal e mensal",
      "- Estados de erro/not-found adicionados",
      "- Responsividade: grids responsivos e overflow em blocos copiaveis"
    ].join("\n")
  );
  writeReport(
    "pr-readiness-v10.md",
    [
      "# PR readiness V10",
      "",
      "- Branch base: codex/marketing-os-v9-guided-flows-rc",
      "- Branch feature: codex/marketing-os-v10-product-hardening",
      "- Escopo: Product Shell, Route Manifest, UX QA, acessibilidade, content QA, visual QA, release polish e documentation hub.",
      "- Sem API externa.",
      "- Sem backend real.",
      "- Sem publicacao automatica.",
      "- Sem dados de pacientes.",
      "- Sem alteracao de .env.",
      "- Sem push, merge ou tag.",
      "",
      "Comando futuro, nao executado:",
      "git push -u origin codex/marketing-os-v10-product-hardening"
    ].join("\n")
  );
  writeReport(
    "route-health-v10.md",
    [
      "# Route health V10",
      "",
      "O health route usa o manifesto de produto como fonte principal.",
      "",
      ...productRoutes.map((route) => `- ${route.path}: ${route.expectedTexts.join(", ")}`)
    ].join("\n")
  );

  console.log("Marketing OS V10 product hardening check");
  console.log(`Status: ${ok ? "aprovado" : "bloqueado"}`);
  console.log(`Rotas: ${productRoutes.length}`);
  console.log(`Release score: ${polish.releaseScore}/100`);
  if (missingDocs.length) console.log(`Docs ausentes: ${missingDocs.join(", ")}`);
  return ok ? 0 : 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runProductHardeningV10Check().then((code) => process.exit(code));
}
