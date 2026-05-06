import type { ParsedDataIssue, ParsedReport } from "@/lib/types";
import { isInsideDecember2025 } from "@/lib/utils/dates";

type PeriodComparable = Pick<ParsedReport, "periodStart" | "periodEnd" | "isOperationalAnomaly" | "title">;

function differsMoreThanFivePercent(expected: number, found: number): boolean {
  if (found === 0) return expected !== 0;
  return Math.abs(expected - found) / Math.abs(found) > 0.05;
}

function metricMismatchIssue(input: {
  severity: ParsedDataIssue["severity"];
  description: string;
  fieldName: string;
  expectedValue: string;
  foundValue: string;
}): ParsedDataIssue {
  return {
    severity: input.severity,
    issueType: "metric_mismatch",
    description: input.description,
    fieldName: input.fieldName,
    expectedValue: input.expectedValue,
    foundValue: input.foundValue
  };
}

function samePeriod(a: PeriodComparable, b: PeriodComparable): boolean {
  return Boolean(
    a.periodStart &&
      a.periodEnd &&
      b.periodStart &&
      b.periodEnd &&
      a.periodStart.getTime() === b.periodStart.getTime() &&
      a.periodEnd.getTime() === b.periodEnd.getTime()
  );
}

function periodsOverlap(a: PeriodComparable, b: PeriodComparable): boolean {
  if (!a.periodStart || !a.periodEnd || !b.periodStart || !b.periodEnd) return false;
  return a.periodStart.getTime() <= b.periodEnd.getTime() && a.periodEnd.getTime() >= b.periodStart.getTime();
}

export function validateReport(parsed: ParsedReport): ParsedDataIssue[] {
  const issues: ParsedDataIssue[] = [...parsed.dataIssues];
  const consolidated = parsed.channels.find((channel) => channel.channel === "consolidated");
  const meta = parsed.channels.find((channel) => channel.channel === "meta_ads");
  const google = parsed.channels.find((channel) => channel.channel === "google_ads");

  if (meta?.investment && meta.conversations && meta.cpl) {
    const expected = meta.investment / meta.conversations;
    if (differsMoreThanFivePercent(expected, meta.cpl)) {
      issues.push(
        metricMismatchIssue({
          severity: "high",
          description: "CPL informado difere do cálculo investimento / conversas em mais de 5%.",
          fieldName: "cpl",
          expectedValue: expected.toFixed(2),
          foundValue: meta.cpl.toFixed(2)
        })
      );
    }
  }

  if (google?.investment && google.conversions && google.cpa) {
    const expected = google.investment / google.conversions;
    if (differsMoreThanFivePercent(expected, google.cpa)) {
      issues.push(
        metricMismatchIssue({
          severity: "high",
          description: "CPA informado difere do cálculo investimento / conversões em mais de 5%.",
          fieldName: "cpa",
          expectedValue: expected.toFixed(2),
          foundValue: google.cpa.toFixed(2)
        })
      );
    }
  }

  if (consolidated?.investment && meta?.investment && google?.investment) {
    const expected = meta.investment + google.investment;
    if (differsMoreThanFivePercent(expected, consolidated.investment)) {
      issues.push(
        metricMismatchIssue({
          severity: "medium",
          description: "Investimento total informado diverge da soma Meta Ads + Google Ads",
          fieldName: "investment",
          expectedValue: expected.toFixed(2),
          foundValue: consolidated.investment.toFixed(2)
        })
      );
    }
  }

  if (isInsideDecember2025(parsed.periodStart, parsed.periodEnd) && !issues.some((item) => item.issueType === "operational_anomaly")) {
    issues.push({
      severity: "critical",
      issueType: "operational_anomaly",
      description: "Conta hackeada; desconsiderar de benchmarks e médias históricas.",
      fieldName: "period",
      expectedValue: "Período operacional normal",
      foundValue: "Dezembro/2025"
    });
  }

  if (!parsed.periodStart || !parsed.periodEnd) {
    issues.push({
      severity: "medium",
      issueType: "missing_data",
      description: "Período do relatório não foi identificado com confiança.",
      fieldName: "period",
      expectedValue: "Data de início e fim",
      foundValue: "Ausente"
    });
  }

  return issues;
}

export function validateReportWithHistory(currentReport: ParsedReport, existingReports: PeriodComparable[]): ParsedDataIssue[] {
  const issues = validateReport(currentReport);

  if (
    !currentReport.periodStart ||
    !currentReport.periodEnd ||
    currentReport.isOperationalAnomaly ||
    isInsideDecember2025(currentReport.periodStart, currentReport.periodEnd)
  ) {
    return issues;
  }

  const usableHistory = existingReports.filter(
    (report) => report.periodStart && report.periodEnd && !report.isOperationalAnomaly && !isInsideDecember2025(report.periodStart, report.periodEnd)
  );

  const duplicated = usableHistory.find((report) => samePeriod(currentReport, report));
  if (duplicated) {
    issues.push({
      severity: "high",
      issueType: "duplicated_period",
      description: "Período do relatório já existe no histórico",
      fieldName: "period",
      expectedValue: `${duplicated.periodStart?.toISOString()} - ${duplicated.periodEnd?.toISOString()}`,
      foundValue: `${currentReport.periodStart.toISOString()} - ${currentReport.periodEnd.toISOString()}`
    });
    return issues;
  }

  const overlapped = usableHistory.find((report) => periodsOverlap(currentReport, report));
  if (overlapped) {
    issues.push({
      severity: "medium",
      issueType: "period_conflict",
      description: "Período do relatório se sobrepõe parcialmente a outro relatório do histórico",
      fieldName: "period",
      expectedValue: `${overlapped.periodStart?.toISOString()} - ${overlapped.periodEnd?.toISOString()}`,
      foundValue: `${currentReport.periodStart.toISOString()} - ${currentReport.periodEnd.toISOString()}`
    });
  }

  return issues;
}
