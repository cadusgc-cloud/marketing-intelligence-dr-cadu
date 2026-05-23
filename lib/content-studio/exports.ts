import type {
  CaptionAtom,
  CarouselDraft,
  ContentExportBundle,
  ContentStudioInput,
  EditorBriefing,
  MediaChecklist,
  PostDraft,
  ReelScript,
  UnifiedQualityResult
} from "@/lib/content-studio/types";
import type { StorySequence } from "@/lib/storyops";

export type ContentExportInput = {
  id: string;
  input: Required<ContentStudioInput>;
  theme: string;
  pillarName: string;
  storySequence: StorySequence;
  reel: ReelScript;
  carousel: CarouselDraft;
  post: PostDraft;
  captions: CaptionAtom[];
  editorBriefing: EditorBriefing;
  mediaChecklist: MediaChecklist;
  quality: UnifiedQualityResult;
};

export function buildContentExportBundle(input: ContentExportInput): ContentExportBundle {
  const captions = input.captions.map((caption) => `- ${caption.style}: ${caption.text}`).join("\n");
  const storyText = input.storySequence.exportText;
  const reviewChecklist = [
    "# Checklist de revisao",
    "- Sem promessa de resultado",
    "- Sem diagnostico ou prescricao",
    "- Sem antes/depois",
    "- Sem paciente, prontuario, local ou bastidor real nao informado",
    "- Frases curtas e revisaveis",
    "- Publicacao sempre manual"
  ].join("\n");
  const googleSheetsTsv = [
    "Tema\tPilar\tFormato\tTexto\tMidia\tRisco\tReadiness",
    `${input.theme}\t${input.pillarName}\tStories\t${oneLine(storyText)}\t${input.mediaChecklist.required.join(", ")}\t${input.quality.riskLevel}\t${input.quality.readinessScore}`,
    `${input.theme}\t${input.pillarName}\tReel\t${oneLine(input.reel.spokenScript)}\tvideo curto falando\t${input.quality.riskLevel}\t${input.quality.readinessScore}`,
    `${input.theme}\t${input.pillarName}\tCarrossel\t${oneLine(input.carousel.title)}\tfundo simples\t${input.quality.riskLevel}\t${input.quality.readinessScore}`
  ].join("\n");
  const googleAgenda = [
    `Titulo: Gravar Dr. Cadu - ${input.theme}`,
    "",
    "Descricao:",
    `- Pilar: ${input.pillarName}`,
    `- Stories: ${input.storySequence.items.length} itens`,
    `- Reel: ${input.reel.title}`,
    `- Post/carrossel: ${input.carousel.title}`,
    `- Midia: ${input.mediaChecklist.required.join(", ")}`,
    `- Seguranca: ${input.quality.status}`,
    "- Status: revisar manualmente antes de publicar"
  ].join("\n");
  const etusManual = [
    "Data sugerida\tCanal\tFormato\tTitulo interno\tTexto/legenda\tMidia necessaria\tRisco\tStatus",
    `${input.input.date}\tInstagram\tStories\t${input.theme}\t${oneLine(storyText)}\t${input.mediaChecklist.required.join(", ")}\t${input.quality.riskLevel}\trascunho`,
    `${input.input.date}\tInstagram/Reels/TikTok/Shorts\tReel\t${input.reel.title}\t${oneLine(input.reel.spokenScript)}\tvideo curto falando\t${input.quality.riskLevel}\trascunho`,
    `${input.input.date}\tInstagram\tCarrossel\t${input.carousel.title}\t${oneLine(input.carousel.caption)}\tfundo simples\t${input.quality.riskLevel}\trascunho`
  ].join("\n");
  const fullPackage = [
    `# Pacote Content Studio - ${input.theme}`,
    "",
    `Pilar: ${input.pillarName}`,
    `Formato principal: ${input.input.format}`,
    `Readiness: ${input.quality.readinessScore}/100`,
    "",
    "## Stories",
    storyText,
    "",
    "## Reel",
    input.reel.exportText,
    "",
    "## Carrossel",
    input.carousel.exportText,
    "",
    "## Post estatico",
    input.post.exportText,
    "",
    "## Legendas",
    captions,
    "",
    "## Briefing para editor",
    input.editorBriefing.exportText,
    "",
    "## Checklist de midia",
    input.mediaChecklist.exportText,
    "",
    "Publicacao sempre manual. Revisao humana obrigatoria antes de qualquer uso externo."
  ].join("\n");

  return {
    fullPackage,
    recordingPackage: input.reel.recordingBriefing,
    editorBriefing: input.editorBriefing.exportText,
    googleSheetsTsv,
    googleAgenda,
    etusManual,
    stories: storyText,
    reels: input.reel.exportText,
    carousel: input.carousel.exportText,
    captions,
    mediaChecklist: input.mediaChecklist.exportText,
    reviewChecklist,
    qualityReport: [
      "# QA do pacote",
      `Status: ${input.quality.status}`,
      `Voice: ${input.quality.voiceScore}/100`,
      `Safety: ${input.quality.safetyScore}/100`,
      `Readiness: ${input.quality.readinessScore}/100`,
      "",
      ...(input.quality.issues.length ? input.quality.issues.map((issue) => `- ${issue.severity}: ${issue.message}`) : ["- sem bloqueios"])
    ].join("\n"),
    technicalJson: JSON.stringify({
      id: input.id,
      theme: input.theme,
      pillar: input.pillarName,
      quality: input.quality,
      generatedBy: "Marketing OS v5 local"
    }, null, 2)
  };
}

export function oneLine(value: string): string {
  return value.replace(/\s+/g, " ").trim().slice(0, 260);
}
