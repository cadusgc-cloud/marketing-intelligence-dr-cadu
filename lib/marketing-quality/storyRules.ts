import type { StorySequence } from "@/lib/storyops";
import { countMainSentences, evaluateTextRules, normalizeText } from "@/lib/marketing-quality/textRules";
import type { QualityCheckResult, QualityIssue } from "@/lib/marketing-quality/types";

export function validateStorySequence(sequence: StorySequence, source: string): QualityCheckResult[] {
  const issues: QualityIssue[] = [];

  if (sequence.items.length !== 6) {
    issues.push(issue("story-count", source, "blocking", "Sequencia deve ter exatamente 6 stories.", "Gerar novamente pelo StoryOps."));
  }

  sequence.items.forEach((item) => {
    const itemSource = `${source}-story-${item.order}`;
    if (!item.mediaSuggestion?.label) {
      issues.push(issue("story-media", itemSource, "blocking", "Story sem foto/video sugerido.", "Adicionar sugestao de midia natural."));
    }
    if (!item.textOnScreen.trim()) {
      issues.push(issue("story-text", itemSource, "blocking", "Story sem texto curto na tela.", "Adicionar uma frase curta."));
    }
    if (!item.safetyNote.trim()) {
      issues.push(issue("story-safety", itemSource, "blocking", "Story sem observacao de seguranca.", "Adicionar nota de revisao."));
    }
    if (item.textOnScreen.length > 92 || countMainSentences(item.textOnScreen) > 1) {
      issues.push(issue("story-short", itemSource, "warning", "Texto do story ficou longo ou com mais de uma frase principal.", "Reduzir para sticker nativo curto."));
    }
    if (normalizeText(item.textOnScreen).includes("agora") && !sequence.neutralContext.trim()) {
      issues.push(issue("story-now", itemSource, "warning", "Story sugere agora sem contexto neutro informado.", "Remover tempo real ou informar contexto seguro."));
    }
    if (normalizeText(item.mediaSuggestion.label).includes("arte")) {
      issues.push(issue("story-canva", itemSource, "warning", "Story pode parecer arte montada.", "Preferir foto/video natural ou sticker nativo."));
    }
    issues.push(...evaluateTextRules(item.textOnScreen, itemSource));
  });

  const sourceTextIssues = evaluateTextRules([sequence.theme, sequence.neutralContext].join(" "), source);
  issues.push(...sourceTextIssues);

  return [
    check("stories-6", "Stories: exatamente 6 itens", "stories", !issues.some((item) => item.id.includes("story-count")), issues.filter((item) => item.id.includes("story-count"))),
    check("stories-media", "Stories: midia sugerida", "stories", !issues.some((item) => item.id.includes("story-media")), issues.filter((item) => item.id.includes("story-media"))),
    check("stories-text", "Stories: texto curto e seguro", "stories", !issues.some((item) => item.severity === "blocking"), issues),
    check("stories-native", "Stories: aparencia nativa e pouco montada", "stories", !issues.some((item) => item.id.includes("story-canva")), issues.filter((item) => item.id.includes("story-canva")))
  ];
}

function check(id: string, label: string, area: QualityCheckResult["area"], passed: boolean, issues: QualityIssue[]): QualityCheckResult {
  return {
    id,
    label,
    area,
    passed,
    severity: issues.some((item) => item.severity === "blocking") ? "blocking" : issues.length ? "warning" : "info",
    issues
  };
}

function issue(id: string, source: string, severity: QualityIssue["severity"], message: string, suggestion: string): QualityIssue {
  return {
    id: `${source}-${id}`,
    area: "stories",
    severity,
    message,
    source,
    suggestion
  };
}
