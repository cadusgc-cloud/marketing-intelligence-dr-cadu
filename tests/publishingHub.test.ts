import { describe, expect, it } from "vitest";
import {
  PUBLISHING_ITEMS,
  filterPublishingItemsByApproval,
  filterPublishingItemsByChannel,
  filterPublishingItemsByStatus,
  generatePlatformPayload,
  getBlockedItems,
  getItemsReadyForApproval,
  getItemsReadyToSchedule,
  getNextPublishingQueue,
  getPublishingItems,
  getPublishingItemsByPlatform,
  getPublishingWarnings,
  summarizePublishingHub,
  validateEthicalChecklist,
  type PublishingItem
} from "@/lib/publishingHub";

describe("Publishing Hub", () => {
  it("possui itens de publicação simulados", () => {
    expect(getPublishingItems().length).toBeGreaterThanOrEqual(12);
  });

  it("possui canais Meta/Instagram, YouTube, TikTok e site", () => {
    const channels = new Set(PUBLISHING_ITEMS.map((item) => item.channel));

    expect(channels.has("meta_instagram_reels")).toBe(true);
    expect(channels.has("meta_instagram_stories")).toBe(true);
    expect(channels.has("facebook_page")).toBe(true);
    expect(channels.has("youtube_shorts")).toBe(true);
    expect(channels.has("tiktok")).toBe(true);
    expect(channels.has("website_article")).toBe(true);
    expect(channels.has("website_page")).toBe(true);
  });

  it("filtra por canal, status e aprovação", () => {
    expect(filterPublishingItemsByChannel(PUBLISHING_ITEMS, "meta_instagram_reels").every((item) => item.channel === "meta_instagram_reels")).toBe(true);
    expect(filterPublishingItemsByStatus(PUBLISHING_ITEMS, "blocked").every((item) => item.publishingStatus === "blocked")).toBe(true);
    expect(filterPublishingItemsByApproval(PUBLISHING_ITEMS, "approved_by_cadu").every((item) => item.approvalStatus === "approved_by_cadu")).toBe(true);
  });

  it("checklist ético bloqueia item sem aprovação médica", () => {
    const item = PUBLISHING_ITEMS.find((candidate) => candidate.id === "lipo-reels");
    expect(item).toBeTruthy();

    const validation = validateEthicalChecklist(item!);

    expect(validation.valid).toBe(false);
    expect(validation.missing).toContain("hasMedicalApproval");
    expect(validation.recommendedStatus).toBe("needs_review");
  });

  it("checklist ético bloqueia item com promessa de resultado", () => {
    const item = PUBLISHING_ITEMS.find((candidate) => candidate.id === "website-page-ethics");
    expect(item).toBeTruthy();

    const validation = validateEthicalChecklist(item!);

    expect(validation.valid).toBe(false);
    expect(validation.missing).toContain("noPromiseOfResult");
    expect(validation.recommendedStatus).toBe("blocked");
  });

  it("item aprovado e com checklist completo fica pronto para agendamento", () => {
    const item = PUBLISHING_ITEMS.find((candidate) => candidate.id === "silicone-reels");
    expect(item).toBeTruthy();

    const validation = validateEthicalChecklist(item!);

    expect(validation.valid).toBe(true);
    expect(validation.recommendedStatus).toBe("ready_to_schedule");
  });

  it("gera payload para Instagram/Reels", () => {
    const item = PUBLISHING_ITEMS.find((candidate) => candidate.id === "silicone-reels") as PublishingItem;
    const payload = generatePlatformPayload(item);

    expect(payload.platform).toBe("Instagram Reels");
    expect(payload.destination).toContain("reels");
    expect(payload.mediaType).toBe("video");
  });

  it("gera payload para YouTube Shorts", () => {
    const item = PUBLISHING_ITEMS.find((candidate) => candidate.id === "silicone-youtube-shorts") as PublishingItem;
    const payload = generatePlatformPayload(item);

    expect(payload.platform).toBe("YouTube Shorts");
    expect(payload.destination).toContain("Shorts");
    expect(payload.title).toContain("Silicone");
  });

  it("calcula resumo da Central de Publicação", () => {
    const summary = summarizePublishingHub(PUBLISHING_ITEMS);

    expect(summary.totalItems).toBe(PUBLISHING_ITEMS.length);
    expect(summary.readyForApproval).toBeGreaterThan(0);
    expect(summary.approvedByCadu).toBeGreaterThan(0);
    expect(summary.readyToSchedule).toBeGreaterThan(0);
    expect(summary.blockedByChecklist).toBeGreaterThan(0);
    expect(summary.simulatedPublished).toBeGreaterThan(0);
  });

  it("retorna itens corretos para aprovação, agendamento e bloqueio", () => {
    expect(getItemsReadyForApproval(PUBLISHING_ITEMS).some((item) => item.publishingStatus === "needs_review")).toBe(true);
    expect(getItemsReadyToSchedule(PUBLISHING_ITEMS).every((item) => validateEthicalChecklist(item).valid)).toBe(true);
    expect(getBlockedItems(PUBLISHING_ITEMS).some((item) => item.approvalStatus === "blocked_by_ethics")).toBe(true);
  });

  it("aponta ausência de automação real", () => {
    const warnings = getPublishingWarnings();

    expect(warnings).toContain("Login/API Meta ainda não foi implementado.");
    expect(warnings).toContain("Upload de mídia ainda não foi implementado.");
    expect(warnings).toContain("Publicação real ainda não foi implementada.");
    expect(warnings).toContain("Persistência ainda não foi implementada.");
  });

  it("agrupa itens por plataforma e ordena próxima fila", () => {
    const byPlatform = getPublishingItemsByPlatform(PUBLISHING_ITEMS);
    const queue = getNextPublishingQueue(PUBLISHING_ITEMS);

    expect(byPlatform.Instagram).toBeGreaterThan(0);
    expect(byPlatform.YouTube).toBeGreaterThan(0);
    expect(byPlatform.TikTok).toBeGreaterThan(0);
    expect(byPlatform.Site).toBeGreaterThan(0);
    expect(queue.length).toBeGreaterThan(0);
    expect(queue[0].suggestedDate <= queue[queue.length - 1].suggestedDate).toBe(true);
  });
});
