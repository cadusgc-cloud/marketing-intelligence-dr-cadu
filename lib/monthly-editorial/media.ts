import type { EditorialDay, MediaChecklist, MediaChecklistItem, MediaSuggestion } from "@/lib/monthly-editorial/types";
import { runMonthlySafetyGate } from "@/lib/monthly-editorial/safety";

export const MEDIAOPS_PROHIBITED_ITEMS = [
  "paciente visivel",
  "prontuario",
  "exame identificavel",
  "centro cirurgico identificavel",
  "localizacao revelada",
  "antes/depois",
  "cirurgia de hoje",
  "paciente de hoje",
  "hospital identificavel",
  "clinica identificavel",
  "placa",
  "endereco",
  "dado pessoal",
  "login",
  "documento sensivel"
];

const mediaLibrary: MediaSuggestion[] = [
  suggestion("selfie-neutra", "selfie_neutra", "Selfie neutra", "Foto ou video curto falando para camera, com fundo sem local identificavel.", "Enquadramento fechado, sem placas, telas, cracha ou pessoas ao fundo.", "Conferir ausencia de paciente, agenda, tela e local.", "seguro"),
  suggestion("video-curto", "video_curto_falando", "Video curto falando", "Fala de 8 a 20 segundos com uma ideia principal.", "Gravar como story/reel nativo, sem roteiro longo e sem prometer resultado.", "Nao mencionar agenda, paciente, local ou conduta individual.", "seguro"),
  suggestion("mesa-agenda", "mesa_agenda_cafe", "Mesa com agenda/cafe", "Objeto neutro para criar presenca humana sem parecer arte.", "Fechar o quadro em caneta, caderno, cafe ou objeto neutro.", "Remover nomes, horarios, documentos, telefones e prontuarios.", "atencao"),
  suggestion("livro-artigo", "livro_artigo", "Livro ou artigo", "Imagem de estudo sem dados sensiveis.", "Mostrar capa generica ou trecho sem caso, nome, imagem clinica ou tela.", "Evitar qualquer material identificavel.", "seguro"),
  suggestion("fundo-simples", "fundo_simples", "Fundo simples", "Parede, textura, mesa ou objeto neutro para texto curto.", "Usar foto vertical simples; texto deve parecer sticker nativo.", "Baixo risco se nao houver local, marca ou pessoa identificavel.", "seguro"),
  suggestion("tela-desfocada", "tela_desfocada", "Tela desfocada", "Tela abstrata ou desfocada sem nenhum dado legivel.", "Usar apenas se nao houver texto, login, agenda ou dados pessoais.", "Revisar antes de usar; qualquer legibilidade vira bloqueio.", "revisar_antes_de_postar"),
  suggestion("foto-estudo", "foto_estudo", "Foto de estudo", "Livro, artigo, anotacao neutra ou mesa de estudo.", "Mostrar apenas material sem nomes e sem dados clinicos.", "Nao mostrar exames, prontuarios, sistemas ou caso real.", "seguro"),
  suggestion("jaleco-neutro", "jaleco_neutro", "Jaleco sem ambiente identificavel", "Detalhe neutro, sem placa, logo de local ou instituicao.", "Evitar cracha, corredor, paciente, equipe ou local reconhecivel.", "Usar apenas quando nao revelar local.", "atencao"),
  suggestion("fim-de-dia", "imagem_fim_de_dia", "Imagem de fim de dia", "Ceu, luz ou objeto neutro para reflexao leve.", "Evitar rua, predio, placa ou geolocalizacao visual.", "Nao dizer que esta em um local especifico.", "seguro"),
  suggestion("post-antigo", "print_post_antigo", "Print de post antigo", "Reaproveitamento de conteudo proprio ja aprovado.", "Cortar comentarios, metricas privadas, nomes e qualquer identificacao.", "Revisar contexto antes de republicar.", "atencao"),
  suggestion("bastidor-generico", "bastidor_generico_nao_identificavel", "Bastidor generico nao identificavel", "Objeto de trabalho sem pessoa, local ou documento.", "Mostrar apenas detalhe neutro.", "Nao sugerir que algo acontece agora se for acervo.", "seguro"),
  suggestion("anotacao-neutra", "anotacao_sem_dados", "Anotacao sem dados sensiveis", "Palavras soltas ou mapa de ideias sem nomes, horarios ou casos.", "Escrever termos gerais e evitar qualquer informacao individual.", "Se houver nome, dado clinico ou documento, bloquear.", "atencao"),
  suggestion("microvideo-reflexao", "microvideo_reflexao", "Microvideo de reflexao", "Video curto com uma frase humana e educativa.", "Gravar sem local identificavel, com fala simples e sem CTA agressivo.", "Publicacao final sempre manual e revisada.", "seguro")
];

const dailyMediaFlow = [
  "selfie_neutra",
  "video_curto_falando",
  "mesa_agenda_cafe",
  "livro_artigo",
  "fundo_simples",
  "imagem_fim_de_dia",
  "foto_estudo"
];

export function buildDailyMediaSuggestions(dayNumber: number, weekend: boolean): MediaSuggestion[] {
  const firstCategory = weekend ? "imagem_fim_de_dia" : dailyMediaFlow[(dayNumber - 1) % dailyMediaFlow.length];
  const secondCategory = weekend ? "bastidor_generico_nao_identificavel" : dailyMediaFlow[(dayNumber + 2) % dailyMediaFlow.length];
  return [findSuggestionByCategory(firstCategory), findSuggestionByCategory(secondCategory)].filter(Boolean) as MediaSuggestion[];
}

export function buildMediaChecklist(days: EditorialDay[]): MediaChecklist {
  const categories = countCategories(days.flatMap((day) => day.mediaSuggestions));
  const monthlyItems = [
    checklist("videos-curtos", "Videos curtos falando para camera", "video_curto_falando", 10, categories.video_curto_falando ?? 0),
    checklist("fundos-neutros", "Fundos simples e imagens neutras", "fundo_simples", 8, categories.fundo_simples ?? 0),
    checklist("estudo-artigo", "Fotos de estudo, livro ou artigo", "livro_artigo", 6, categories.livro_artigo ?? 0),
    checklist("fim-de-dia", "Imagens leves de fim de dia", "imagem_fim_de_dia", 4, categories.imagem_fim_de_dia ?? 0),
    checklist("bastidor-generico", "Bastidores genericos nao identificaveis", "bastidor_generico_nao_identificavel", 6, categories.bastidor_generico_nao_identificavel ?? 0)
  ];
  const weeklyItems = monthlyItems.map((item) => ({ ...item, targetCount: Math.ceil(item.targetCount / 4), currentCount: Math.ceil(item.currentCount / 4), status: getChecklistStatus(Math.ceil(item.currentCount / 4), Math.ceil(item.targetCount / 4)) }));
  const gaps = monthlyItems
    .filter((item) => item.status !== "suficiente")
    .map((item) => `faltam ${item.label.toLowerCase()}`);

  return {
    monthlyItems,
    weeklyItems,
    dailyRequiredCategories: ["selfie_neutra", "video_curto_falando", "fundo_simples"],
    gaps,
    prohibitedItems: MEDIAOPS_PROHIBITED_ITEMS
  };
}

export function buildDailyMediaChecklistItems(mediaSuggestions: MediaSuggestion[]): MediaChecklistItem[] {
  return mediaSuggestions.map((media) => ({
    id: `daily-${media.id}`,
    label: media.label,
    category: media.category,
    targetCount: 1,
    currentCount: 1,
    status: media.risk === "revisar_antes_de_postar" ? "revisar" : "suficiente",
    safetyNote: media.privacyNote
  }));
}

export function evaluateMediaText(text: string) {
  return runMonthlySafetyGate(text, "mediaops");
}

function findSuggestionByCategory(category: string): MediaSuggestion | undefined {
  return mediaLibrary.find((item) => item.category === category);
}

function countCategories(media: MediaSuggestion[]): Record<string, number> {
  return media.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});
}

function checklist(id: string, label: string, category: string, targetCount: number, currentCount: number): MediaChecklistItem {
  return {
    id,
    label,
    category,
    targetCount,
    currentCount,
    status: getChecklistStatus(currentCount, targetCount),
    safetyNote: "Usar somente material neutro, sem paciente, documento, local identificavel ou dado sensivel."
  };
}

function getChecklistStatus(currentCount: number, targetCount: number): MediaChecklistItem["status"] {
  if (currentCount >= targetCount) return "suficiente";
  if (currentCount > 0) return "revisar";
  return "faltando";
}

function suggestion(
  id: string,
  category: string,
  label: string,
  description: string,
  captureGuidance: string,
  privacyNote: string,
  risk: MediaSuggestion["risk"]
): MediaSuggestion {
  return { id, category, label, description, captureGuidance, privacyNote, risk };
}
