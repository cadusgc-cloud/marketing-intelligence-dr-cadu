import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildRealWeekFolderReport, decodeMetaCsvBuffer, type RealWeekFolderFile } from "../lib/real-week";

const DEFAULT_DIR = "C:\\CaduSync\\05_CAIXA_DE_ENTRADA\\meta-insights";

const readmeText = [
  "# Caixa de entrada - Meta Business Suite",
  "",
  "Solte aqui os CSVs exportados do Meta Business Suite (business.facebook.com):",
  "",
  "1. Insights > Conteudo > periodo de 30 dias > Exportar dados.",
  "2. Insights > Resultados > mesmo periodo > Exportar (alcance por dia e seguidores).",
  "",
  "Nao precisa renomear nem abrir os arquivos. Nao abra e salve pelo Excel (isso pode trocar o formato).",
  "",
  "Depois, peca a analise ao Claude ou rode no terminal (PowerShell, na pasta do projeto):",
  "",
  "```",
  "npm run semana-real",
  "```",
  "",
  "O resultado aparece nesta pasta como RELATORIO-SEMANA-REAL.md.",
  "Nada sai da maquina: sem API, sem upload, sem publicacao."
].join("\n");

function resolveDir(): string {
  const args = process.argv.slice(2);
  const dirIndex = args.indexOf("--dir");
  if (dirIndex >= 0 && args[dirIndex + 1]) return path.resolve(args[dirIndex + 1]);
  return DEFAULT_DIR;
}

function main(): number {
  const dir = resolveDir();
  mkdirSync(dir, { recursive: true });

  const readmePath = path.join(dir, "LEIA-ME.md");
  if (!existsSync(readmePath)) writeFileSync(readmePath, readmeText, "utf8");

  const csvNames = readdirSync(dir).filter((name) => name.toLowerCase().endsWith(".csv"));
  // Ler como bytes: os cartoes de Insights > Resultados saem em UTF-16.
  const files: RealWeekFolderFile[] = csvNames.map((name) => ({
    name,
    text: decodeMetaCsvBuffer(readFileSync(path.join(dir, name)))
  }));

  const generatedAt = new Date().toISOString();
  const report = buildRealWeekFolderReport(files, generatedAt);

  const reportPath = path.join(dir, "RELATORIO-SEMANA-REAL.md");
  writeFileSync(reportPath, report.reportMarkdown, "utf8");

  if (report.baseline) {
    writeFileSync(path.join(dir, "baseline.tsv"), report.baseline.tsv, "utf8");
    writeFileSync(
      path.join(dir, "semana-real-dados.json"),
      JSON.stringify({ version: 1, generatedAt, posts: report.posts, days: report.days }, null, 2),
      "utf8"
    );
  }

  console.log(`Pasta analisada: ${dir}`);
  console.log(`Arquivos CSV encontrados: ${csvNames.length}`);
  for (const file of report.files) {
    console.log(`- ${file.name}: ${file.kind}. ${file.summary}`);
    for (const error of file.errors) console.log(`  Problema: ${error}`);
  }
  for (const warning of report.warnings) console.log(`Aviso: ${warning}`);

  if (report.baseline && report.ok) {
    console.log("");
    console.log(`Posts: ${report.baseline.postsTotal} em ${report.baseline.weeksCovered} semana(s) (${report.baseline.postsPerWeek ?? "-"} por semana)`);
    console.log(`Alcance medio por post: ${report.baseline.reachAvgPerPost ?? "-"}`);
    console.log(`Engajamento medio por post: ${report.baseline.engagementAvgPerPost ?? "-"}`);
    console.log(`Crescimento de seguidores: ${report.baseline.followerGrowth ?? "nao importado"}`);
    console.log("");
    console.log(`Relatorio completo: ${reportPath}`);
    return 0;
  }

  console.log("");
  console.log(`Nenhum CSV valido de posts na pasta. Orientacao completa em: ${reportPath}`);
  return 1;
}

process.exit(main());
