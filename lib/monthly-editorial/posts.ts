import type { CarouselPlan, EditorialPillar, PostPlan } from "@/lib/monthly-editorial/types";
import { runMonthlySafetyGate } from "@/lib/monthly-editorial/safety";

export function buildPostPlan(date: string, dayNumber: number, theme: string, pillar: EditorialPillar): PostPlan {
  const title = `Post - ${theme}`;
  const centralIdea = `Explicar ${theme} com linguagem curta, sem promessa e com foco em decisao consciente.`;
  const shortCaption = [
    `Nem todo conteudo sobre ${theme} precisa parecer campanha.`,
    "Uma boa decisao comeca quando a pessoa entende limites, riscos e contexto.",
    "Esse post e educativo e nao substitui consulta individual."
  ].join("\n\n");
  const exportText = [
    `Post estatico - ${date}`,
    `Titulo: ${title}`,
    `Ideia central: ${centralIdea}`,
    `Legenda curta:\n${shortCaption}`,
    `Sugestao visual: ${pillar.name} com foto neutra, texto curto e sem comparacao visual indevida.`,
    "Observacao de seguranca: revisar para retirar promessa, conduta individual ou chamada agressiva."
  ].join("\n");
  const safetyGate = runMonthlySafetyGate(exportText, "post");

  return {
    id: `post-${date}-${dayNumber}`,
    format: "post_estatico",
    title,
    centralIdea,
    shortCaption,
    visualSuggestion: "Foto neutra ou fundo simples com frase curta, sem layout de campanha.",
    safetyNote: "Nao usar material identificavel, comparacao visual indevida, promessa ou chamada comercial agressiva.",
    editorialRisk: safetyGate.classification,
    exportText
  };
}

export function buildCarouselPlan(date: string, dayNumber: number, theme: string, pillar: EditorialPillar): CarouselPlan {
  const title = `Carrossel - ${theme}`;
  const cards = [
    `Card 1: ${title}`,
    "Card 2: O problema comum e decidir pela promessa.",
    "Card 3: O mais importante e entender limites e contexto.",
    `Card 4: Em ${pillar.name.toLowerCase()}, criterio vale mais que pressa.`,
    "Card 5: Perguntas boas ajudam a alinhar expectativa.",
    "Card 6: Conteudo educativo nao substitui avaliacao individual."
  ];
  const caption = [
    `Sobre ${theme}: informacao clara ajuda a decidir com mais calma.`,
    "Salve para revisar antes de transformar referencia em decisao.",
    "Conteudo educativo, sem substituir consulta individual."
  ].join("\n\n");
  const exportText = [
    `Carrossel - ${date}`,
    `Titulo: ${title}`,
    `Ideia central: explicar ${theme} em 6 cards curtos.`,
    "Cards:",
    ...cards.map((card) => `- ${card}`),
    `Legenda:\n${caption}`,
    "Sugestao visual: carrossel limpo, texto curto, sem pessoa identificavel e sem comparacao visual indevida.",
    "Observacao de seguranca: manter tom educativo, sem promessa ou conduta individual."
  ].join("\n");
  const safetyGate = runMonthlySafetyGate(exportText, "carrossel");

  return {
    id: `carousel-${date}-${dayNumber}`,
    format: "carrossel",
    title,
    centralIdea: `Explicar ${theme} com estrutura curta e segura.`,
    cards,
    caption,
    visualSuggestion: "Carrossel limpo com 5 a 7 cards, sem imagem clinica ou comparacao visual.",
    safetyNote: "Revisar para nao virar promessa, comparacao visual indevida ou conduta individual.",
    editorialRisk: safetyGate.classification,
    exportText
  };
}
