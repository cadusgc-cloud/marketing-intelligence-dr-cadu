import { describe, expect, it } from "vitest";
import {
  SIMULATED_MEDIA_MANIFEST,
  buildCatalogingResultFromManifestText,
  createMediaImportDrafts,
  detectDuplicateFilenameCandidates,
  detectKeywordsFromFilename,
  filterSuggestionsByStatus,
  generateMediaCatalogingSuggestions,
  getCatalogingWarnings,
  getDefaultMediaManifestText,
  getManifestInputWarnings,
  inferAssetTypeFromFilename,
  inferPillarFromKeywords,
  inferPrivacyRiskFromFilename,
  normalizeManifestInput,
  parseMediaManifestLines,
  parseMediaManifestText,
  removeEmptyManifestLines,
  summarizeMediaCataloging
} from "@/lib/mediaCataloging";

describe("Media Cataloging", () => {
  it("parseMediaManifestText le lista de arquivos", () => {
    const items = parseMediaManifestText("cadu-consultorio-bastidor-01.jpg\nprotese-silicone-explicacao-01.mp4");

    expect(items).toHaveLength(2);
    expect(items[0].filename).toBe("cadu-consultorio-bastidor-01.jpg");
    expect(items[1].extension).toBe("mp4");
  });

  it("inferAssetTypeFromFilename identifica jpg/png como photo", () => {
    expect(inferAssetTypeFromFilename("foto-consultorio.jpg")).toBe("photo");
    expect(inferAssetTypeFromFilename("arte-feed.png")).toBe("photo");
  });

  it("inferAssetTypeFromFilename identifica mp4/mov como video", () => {
    expect(inferAssetTypeFromFilename("reels-protese.mp4")).toBe("video");
    expect(inferAssetTypeFromFilename("story-bastidor.mov")).toBe("video");
  });

  it("detectKeywordsFromFilename detecta termos estrategicos", () => {
    const keywords = detectKeywordsFromFilename("resultado-protese-lipo-maternidade-01.mp4");

    expect(keywords).toEqual(expect.arrayContaining(["resultado", "protese", "lipo", "maternidade"]));
  });

  it("inferPillarFromKeywords sugere pilar correto para protese", () => {
    expect(inferPillarFromKeywords(["protese", "silicone", "ml"])).toBe("Mamas e protese de silicone");
  });

  it("inferPillarFromKeywords sugere pilar correto para lipo", () => {
    expect(inferPillarFromKeywords(["lipoaspiracao", "planejamento"])).toBe("Lipoaspiracao e contorno corporal");
  });

  it("inferPillarFromKeywords sugere pilar correto para maternidade", () => {
    expect(inferPillarFromKeywords(["maternidade", "pos-gestacao"])).toBe("Maternidade e pos-gestacao");
  });

  it("arquivos com paciente, resultado ou antes-depois geram risco high", () => {
    expect(inferPrivacyRiskFromFilename("foto-paciente-antes-depois-revisar-01.jpg")).toBe("high");
    expect(inferPrivacyRiskFromFilename("resultado-3-meses-explicacao-01.mp4")).toBe("high");
    expect(inferPrivacyRiskFromFilename("depoimento-paciente-revisar-01.mp4")).toBe("high");
  });

  it("arquivos com antes-depois geram warning etico", () => {
    const items = parseMediaManifestText("foto-paciente-antes-depois-revisar-01.jpg");
    const [suggestion] = generateMediaCatalogingSuggestions(items);

    expect(suggestion.status).toBe("blocked");
    expect(suggestion.warnings.join(" ")).toContain("antes/depois");
    expect(suggestion.warnings.join(" ")).toContain("Revisao etica");
  });

  it("sugestoes de baixa confianca ficam needs_review", () => {
    const items = parseMediaManifestText("arquivo-sem-contexto.xyz");
    const [suggestion] = generateMediaCatalogingSuggestions(items);

    expect(suggestion.confidence).toBe("low");
    expect(suggestion.status).toBe("needs_review");
  });

  it("createMediaImportDrafts cria rascunhos", () => {
    const suggestions = generateMediaCatalogingSuggestions(parseMediaManifestLines(SIMULATED_MEDIA_MANIFEST));
    const drafts = createMediaImportDrafts(suggestions);

    expect(drafts).toHaveLength(suggestions.length);
    expect(drafts[0].mediaAssetDraft.filename).toBe(suggestions[0].filename);
  });

  it("summarizeMediaCataloging calcula totais", () => {
    const suggestions = generateMediaCatalogingSuggestions(parseMediaManifestLines(SIMULATED_MEDIA_MANIFEST));
    const summary = summarizeMediaCataloging(suggestions);

    expect(summary.totalItems).toBe(SIMULATED_MEDIA_MANIFEST.length);
    expect(summary.imageItems).toBeGreaterThan(0);
    expect(summary.videoItems).toBeGreaterThan(0);
    expect(summary.privacyRiskItems).toBeGreaterThan(0);
    expect(summary.needsReview).toBeGreaterThan(0);
    expect(summary.readyToImport).toBeGreaterThan(0);
  });

  it("detectDuplicateFilenameCandidates identifica duplicatas simples", () => {
    const items = parseMediaManifestText("cadu-consultorio-bastidor-01.jpg\ncadu-consultorio-bastidor-02.jpg\nlipoaspiracao-planejamento-01.mp4");
    const duplicates = detectDuplicateFilenameCandidates(items);

    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].filenames).toEqual(expect.arrayContaining(["cadu-consultorio-bastidor-01.jpg", "cadu-consultorio-bastidor-02.jpg"]));
  });

  it("filterSuggestionsByStatus retorna itens corretos", () => {
    const suggestions = generateMediaCatalogingSuggestions(parseMediaManifestLines(SIMULATED_MEDIA_MANIFEST));
    const blocked = filterSuggestionsByStatus(suggestions, "blocked");

    expect(blocked.length).toBeGreaterThan(0);
    expect(blocked.every((suggestion) => suggestion.status === "blocked")).toBe(true);
  });

  it("getCatalogingWarnings informa que nenhum arquivo real e lido", () => {
    const warnings = getCatalogingWarnings();

    expect(warnings.join(" ")).toContain("Nenhum arquivo real e lido");
    expect(warnings.join(" ")).toContain("Nao ha upload");
    expect(warnings.join(" ")).toContain("validacao humana");
  });

  it("getDefaultMediaManifestText retorna manifesto com multiplas linhas", () => {
    const text = getDefaultMediaManifestText();

    expect(text.split("\n").length).toBeGreaterThanOrEqual(30);
    expect(text).toContain("protese-silicone-explicacao-01.mp4");
  });

  it("normalizeManifestInput remove espacos desnecessarios", () => {
    const normalized = normalizeManifestInput("  cadu-consultorio-bastidor-01.jpg  \n\n  protese-silicone-explicacao-01.mp4 ");

    expect(normalized).toBe("cadu-consultorio-bastidor-01.jpg\nprotese-silicone-explicacao-01.mp4");
  });

  it("removeEmptyManifestLines remove linhas vazias", () => {
    expect(removeEmptyManifestLines("\n\narquivo-01.jpg\n\narquivo-02.mp4\n")).toEqual(["arquivo-01.jpg", "arquivo-02.mp4"]);
  });

  it("buildCatalogingResultFromManifestText processa texto colado", () => {
    const result = buildCatalogingResultFromManifestText("cadu-consultorio-bastidor-01.jpg\nlipoaspiracao-planejamento-01.mp4");

    expect(result.lineCount).toBe(2);
    expect(result.summary.totalItems).toBe(2);
    expect(result.suggestions[0].suggestedPillar).toBe("Bastidores e rotina");
  });

  it("input vazio gera warning e summary zerado", () => {
    const result = buildCatalogingResultFromManifestText(" \n ");

    expect(result.summary.totalItems).toBe(0);
    expect(result.warnings.join(" ")).toContain("Cole uma lista");
  });

  it("manifesto com 30+ linhas gera summary correto", () => {
    const result = buildCatalogingResultFromManifestText(getDefaultMediaManifestText());

    expect(result.lineCount).toBeGreaterThanOrEqual(30);
    expect(result.summary.totalItems).toBe(result.lineCount);
  });

  it("manifesto com paciente, resultado ou antes-depois gera revisao etica", () => {
    const result = buildCatalogingResultFromManifestText("foto-paciente-antes-depois-revisar-01.jpg\nresultado-3-meses-explicacao-01.mp4");

    expect(result.summary.privacyRiskItems).toBe(2);
    expect(result.warnings.join(" ")).toContain("revisao etica obrigatoria");
  });

  it("manifesto com extensao desconhecida gera needs_review", () => {
    const result = buildCatalogingResultFromManifestText("arquivo-desconhecido.xyz");

    expect(result.summary.unknownItems).toBe(1);
    expect(result.suggestions[0].status).toBe("needs_review");
  });

  it("possiveis duplicatas sao identificadas no resultado interativo", () => {
    const result = buildCatalogingResultFromManifestText("cadu-consultorio-bastidor-01.jpg\ncadu-consultorio-bastidor-02.jpg");

    expect(result.duplicateCandidates).toHaveLength(1);
    expect(result.summary.duplicateCandidates).toBe(1);
  });

  it("funcoes de entrada nao dependem de leitura de arquivo real", () => {
    const warnings = getManifestInputWarnings("C:\\acervo\\protese-silicone-explicacao-01.mp4");
    const result = buildCatalogingResultFromManifestText("C:\\acervo\\protese-silicone-explicacao-01.mp4");

    expect(warnings.join(" ")).not.toContain("ENOENT");
    expect(result.items[0].filename).toBe("protese-silicone-explicacao-01.mp4");
  });
});
