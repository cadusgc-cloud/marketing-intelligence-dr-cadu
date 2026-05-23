export function buildLocalChangelog(): string {
  return [
    "# Changelog local V9",
    "",
    "- Adicionado Command Center como ponto de partida operacional.",
    "- Adicionado catalogo de fluxos guiados com runner local.",
    "- Adicionado motor de proxima acao operacional.",
    "- Adicionado Release Candidate local e rascunho de PR.",
    "- Adicionado onboarding para primeiros passos.",
    "- Sem API externa, sem backend real e sem publicacao automatica."
  ].join("\n");
}
