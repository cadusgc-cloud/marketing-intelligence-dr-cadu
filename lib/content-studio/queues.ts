import { generateContentStudioPackage, generateDefaultStudioPackages } from "@/lib/content-studio/composer";
import { generateRecordingSession } from "@/lib/content-studio/recording";
import type { ContentStudioPackage, ProductionTask, ReviewItem } from "@/lib/content-studio/types";

export function buildReviewQueue(packages: ContentStudioPackage[] = generateDefaultStudioPackages(10)): ReviewItem[] {
  return packages.map((pkg) => pkg.reviewItem);
}

export function buildProductionQueue(packages: ContentStudioPackage[] = generateDefaultStudioPackages(10)): ProductionTask[] {
  const session = generateRecordingSession(packages.map((pkg) => pkg.theme));
  const packageTasks = packages.flatMap((pkg) => pkg.productionTasks);
  const recordingTasks: ProductionTask[] = session.topics.map((topic) => ({
    id: `recording-queue-${topic.id}`,
    title: `Gravar: ${topic.theme}`,
    format: "reel",
    theme: topic.theme,
    priority: topic.order <= 3 ? "alta" : "media",
    status: "pendente",
    dueHint: "proxima sessao de gravacao",
    requiredMedia: topic.mediaChecklist,
    safetyStatus: "atencao",
    readiness: 78,
    exportText: topic.shortScript
  }));
  return [...packageTasks, ...recordingTasks];
}

export function buildStudioDashboardPackage() {
  const packageItem = generateContentStudioPackage();
  const packages = generateDefaultStudioPackages(10);
  const reviewQueue = buildReviewQueue(packages);
  const productionQueue = buildProductionQueue(packages);
  const recordingSession = generateRecordingSession(packages.map((pkg) => pkg.theme));
  const averageReadiness = Math.round(packages.reduce((total, pkg) => total + pkg.quality.readinessScore, 0) / packages.length);

  return {
    packageItem,
    packages,
    reviewQueue,
    productionQueue,
    recordingSession,
    averageReadiness,
    approvedItems: reviewQueue.filter((item) => item.status === "aprovado").length,
    reviewItems: reviewQueue.filter((item) => item.status === "precisa_revisao").length,
    blockedItems: reviewQueue.filter((item) => item.status === "bloqueado").length
  };
}
