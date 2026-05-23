import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ChecklistPanel,
  EmptyState,
  ErrorState,
  ExportPanel,
  LocalOnlyNotice,
  PageHeader,
  ProgressBar,
  ReadinessBadge,
  RiskBadge,
  StatusBadge
} from "@/components/product";
import { clampProgress } from "@/lib/product-ui";

function textFrom(node: React.ReactNode): string {
  return renderToStaticMarkup(React.createElement(React.Fragment, null, node)).replace(/<[^>]+>/g, " ");
}

describe("Marketing OS v10 - Product Shell", () => {
  it("PageHeader renderiza titulo em h1", () => {
    const element = PageHeader({ title: "Titulo Operacional", description: "Descricao curta." });
    expect(textFrom(element)).toContain("Titulo Operacional");
  });

  it("StatusBadge renderiza texto", () => {
    expect(textFrom(StatusBadge({ label: "aprovado", tone: "success" }))).toContain("aprovado");
  });

  it("RiskBadge nao depende apenas de cor", () => {
    expect(textFrom(RiskBadge({ level: "alto" }))).toContain("Risco: alto");
  });

  it("ReadinessBadge renderiza classificacao textual", () => {
    expect(textFrom(ReadinessBadge({ level: "revisar" }))).toContain("Readiness: revisar");
  });

  it("EmptyState tem proxima acao", () => {
    const element = EmptyState({ title: "Sem dados", description: "Importe metricas.", actionHref: "/imports", actionLabel: "Importar agora" });
    expect(textFrom(element)).toContain("Importar agora");
  });

  it("ErrorState tem link de recuperacao", () => {
    const element = ErrorState({ title: "Erro local", description: "Volte ao fluxo." });
    expect(textFrom(element)).toContain("Voltar ao Command Center");
  });

  it("LocalOnlyNotice menciona ausencia de API externa", () => {
    expect(textFrom(LocalOnlyNotice())).toContain("sem API externa");
  });

  it("ExportPanel nao mostra JSON bruto por padrao", () => {
    const element = ExportPanel({ title: "Exportacao", description: "Texto copiavel.", children: "Resumo manual" });
    expect(textFrom(element)).not.toContain("{");
  });

  it("ChecklistPanel aceita itens", () => {
    const element = ChecklistPanel({ title: "Checklist", items: ["Abrir Command Center", { label: "Rodar QA", done: true }] });
    expect(textFrom(element)).toContain("Rodar QA");
  });

  it("ProgressBar limita 0 a 100", () => {
    expect(clampProgress(130)).toBe(100);
    expect(clampProgress(-4)).toBe(0);
    expect(textFrom(ProgressBar({ value: 130 })).replace(/\s+/g, "")).toContain("100%");
  });
});
