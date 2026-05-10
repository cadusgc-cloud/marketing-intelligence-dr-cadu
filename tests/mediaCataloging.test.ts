import { describe, expect, it } from "vitest";
import {
  SIMULATED_MEDIA_MANIFEST,
  createMediaImportDrafts,
  detectDuplicateFilenameCandidates,
  detectKeywordsFromFilename,
  filterSuggestionsByStatus,
  generateMediaCatalogingSuggestions,
  getCatalogingWarnings,
  inferAssetTypeFromFilename,
  inferPillarFromKeywords,
  inferPrivacyRiskFromFilename,
  parseMediaManifestLines,
  parseMediaManifestText,
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
});
