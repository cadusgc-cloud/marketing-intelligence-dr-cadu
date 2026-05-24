import { describe, expect, it } from "vitest";
import { buildNavigationGroups, getRouteByPath, productRoutes, validateRouteManifest } from "@/lib/product-routes";

describe("Marketing OS v10 - Route Manifest", () => {
  it("manifesto contem todas as rotas principais", () => {
    expect(productRoutes.length).toBeGreaterThanOrEqual(29);
    ["/", "/command-center", "/flows", "/flows/fechamento-semanal-completo", "/release", "/onboarding", "/documentation"].forEach((route) => {
      expect(getRouteByPath(route)?.path).toBe(route);
    });
  });

  it("cada rota tem path, titulo, grupo, descricao e expectedTexts", () => {
    for (const route of productRoutes) {
      expect(route.path).toMatch(/^\//);
      expect(route.title.length).toBeGreaterThan(1);
      expect(route.group.length).toBeGreaterThan(1);
      expect(route.description.length).toBeGreaterThan(10);
      expect(route.expectedTexts.length).toBeGreaterThan(0);
    }
  });

  it("nenhuma rota usa API externa", () => {
    expect(productRoutes.every((route) => route.usesExternalApi === false && route.localOnly === true)).toBe(true);
  });

  it("rotas sao agrupadas corretamente", () => {
    const groups = buildNavigationGroups();
    expect(groups.length).toBe(6);
    expect(groups.find((group) => group.title === "Comece aqui")?.routes.some((route) => route.path === "/command-center")).toBe(true);
    expect(groups.find((group) => group.title === "Metricas")?.routes.some((route) => route.path === "/weekly-review")).toBe(true);
    expect(groups.find((group) => group.title === "Producao")?.routes.some((route) => route.path === "/studio")).toBe(true);
    expect(groups.find((group) => group.title === "Seguranca e QA")?.routes.some((route) => route.path === "/release")).toBe(true);
    expect(groups.find((group) => group.title === "Workspace")?.routes.some((route) => route.path === "/workspace")).toBe(true);
  });

  it("manifesto nao tem paths duplicados", () => {
    const paths = productRoutes.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
    expect(validateRouteManifest().ok).toBe(true);
  });
});
