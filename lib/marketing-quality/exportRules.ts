import type { PilotWeekExportBundle } from "@/lib/marketing-scenarios";
import { hasRawJsonForUser } from "@/lib/marketing-quality/textRules";
import type { QualityCheckResult, QualityIssue } from "@/lib/marketing-quality/types";

export function validateExportBundle(exports: PilotWeekExportBundle): QualityCheckResult[] {
  const checks: QualityCheckResult[] = [];
  checks.push(simpleCheck("export-sheets", "Google Sheets TSV tem cabecalho", "exports", exports.googleSheetsTsv.startsWith("Data\tDia"), "Google Sheets TSV sem cabecalho esperado."));
  checks.push(simpleCheck("export-agenda", "Google Agenda tem titulo e descricao", "exports", exports.googleAgendaText.includes("Titulo:") && exports.googleAgendaText.includes("Descricao:"), "Google Agenda sem titulo/descricao."));
  checks.push(simpleCheck("export-etus", "Etus/manual tem campos essenciais", "exports", exports.etusManual.startsWith("Data\tCanal\tFormato") && exports.etusManual.includes("Midia necessaria"), "Etus/manual sem colunas essenciais."));
  checks.push(simpleCheck("export-daily", "Pacote diario contem stories", "exports", exports.dailyPackages.includes("Story 6:"), "Pacote diario sem Story 6."));
  checks.push(simpleCheck("export-weekly", "Pacote semanal contem 7 dias", "exports", countDates(exports.weeklyText) >= 7, "Pacote semanal nao lista 7 dias."));

  let backupValid = false;
  try {
    const parsed = JSON.parse(exports.backupJson) as { days?: unknown[] };
    backupValid = Array.isArray(parsed.days);
  } catch {
    backupValid = false;
  }
  checks.push(simpleCheck("export-backup-json", "Backup JSON tecnico e parseavel", "exports", backupValid, "Backup JSON nao e parseavel."));

  const userExports = [
    exports.weeklyMarkdown,
    exports.weeklyText,
    exports.dailyPackages,
    exports.stories,
    exports.reels,
    exports.postsAndCarousels,
    exports.googleSheetsTsv,
    exports.googleAgendaText,
    exports.etusManual,
    exports.videoEditorBrief,
    exports.safetyReport
  ];
  checks.push(simpleCheck("export-no-raw-json", "Exports comuns nao mostram JSON bruto", "exports", userExports.every((text) => !hasRawJsonForUser(text)), "Exportacao comum parece conter JSON bruto."));

  return checks;
}

function simpleCheck(id: string, label: string, area: QualityCheckResult["area"], passed: boolean, message: string): QualityCheckResult {
  const issues: QualityIssue[] = passed
    ? []
    : [
        {
          id: `${id}-issue`,
          area,
          severity: "blocking",
          message,
          source: id,
          suggestion: "Regerar exportacao deterministica antes do PR."
        }
      ];
  return { id, label, area, passed, severity: passed ? "info" : "blocking", issues };
}

function countDates(text: string): number {
  return (text.match(/2026-05-\d{2}/g) ?? []).length;
}
