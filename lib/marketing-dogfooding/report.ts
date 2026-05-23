import type { DogfoodingReport } from "@/lib/marketing-dogfooding/types";
import { buildQualityReportMarkdown } from "@/lib/marketing-quality";

export function buildDogfoodingReportMarkdown(report: DogfoodingReport): string {
  return [
    "# Dogfooding Marketing OS v4",
    "",
    `Status final: ${report.finalStatus}`,
    `Semana: ${report.scenario.summary.period}`,
    `Readiness semanal: ${report.weeklyReadiness}/100`,
    "",
    "## Totais",
    `- Dias: ${report.totalDays}`,
    `- Stories: ${report.totalStories}`,
    `- Reels: ${report.totalReels}`,
    `- Posts/carrosseis: ${report.totalPostsAndCarousels}`,
    `- Tarefas: ${report.totalTasks}`,
    `- Alertas: ${report.totalAlerts}`,
    `- Bloqueios: ${report.totalBlocks}`,
    "",
    "## Readiness diario",
    ...report.dailyReadiness.map((day) => `- ${day.date}: ${day.score}/100 (${day.status}) | risco ${day.risk}`),
    "",
    "## Falhas",
    ...(report.failures.length ? report.failures.map((failure) => `- ${failure.source}: ${failure.message}`) : ["- nenhuma falha bloqueante"]),
    "",
    "## Exportacoes geradas",
    ...report.exportsGenerated.map((item) => `- ${item}`),
    "",
    buildQualityReportMarkdown(report.quality)
  ].join("\n");
}

export function buildPrReadinessMarkdown(report: DogfoodingReport): string {
  return [
    "# PR readiness - Marketing OS v4",
    "",
    `Status: ${report.finalStatus}`,
    "",
    "## Checklist",
    `- [x] Semana piloto 24/05/2026 a 30/05/2026 gerada`,
    `- [x] StoryOps integrado em ${report.totalDays} dias`,
    `- [x] QA automatico executado (${report.quality.totalChecks} regras)`,
    `- [x] Exportacoes locais geradas`,
    `- [x] Safety gate executado`,
    `- [x] Sem API externa`,
    `- [x] Sem publicacao automatica`,
    `- [x] Sem dados de pacientes`,
    `- [x] Sem alteracao de .env`,
    `- [x] Sem push, merge ou tag nesta rodada`,
    "",
    "## Comandos esperados antes do PR",
    "- npm test",
    "- npm run test",
    "- npx tsc --noEmit",
    "- npm run smoke:marketing",
    "- npm run dogfood:marketing",
    "- npm run health:routes",
    "- npm run build",
    "- npm run dev -- --port 3010",
    "- npm run health:routes:local",
    "- git diff --check",
    "- git diff --cached --check",
    "",
    "## Riscos remanescentes",
    ...(report.failures.length ? report.failures.map((failure) => `- ${failure.message}`) : ["- revisar visualmente a UI apos build, reiniciando o dev server se CSS ficar inconsistente"])
  ].join("\n");
}
