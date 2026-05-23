import type { TaskPriority, TaskStatus } from "@/lib/marketing-ops/types";

export const MARKETING_OPS_BASE_DATE = "2026-05-24";

export const TASK_STATUSES: TaskStatus[] = ["pendente", "em_andamento", "pronto", "publicado_manual", "bloqueado", "arquivado"];
export const TASK_PRIORITIES: TaskPriority[] = ["baixa", "media", "alta", "critica"];

export const MEDIAOPS_V3_CATEGORIES = [
  "selfie neutra",
  "video curto falando para camera",
  "mesa com agenda",
  "cafe/livro/artigo",
  "fundo simples",
  "tela desfocada",
  "foto de estudo",
  "foto de jaleco sem ambiente identificavel",
  "imagem de fim de dia",
  "print de post antigo",
  "bastidor generico nao identificavel",
  "anotacao sem dados sensiveis",
  "microvideo de reflexao",
  "foto de objetos neutros de trabalho",
  "capa simples para reel",
  "imagem abstrata para reflexao"
];

export const MEDIAOPS_V3_BLOCKED_TERMS = [
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
  "endereco",
  "documento sensivel",
  "sistema judicial",
  "login/senha",
  "tela com dados pessoais"
];

export const MANUAL_PUBLISHING_CHECKLIST_ITEMS = [
  "Texto revisado por humano",
  "Sem promessa de resultado",
  "Sem diagnostico ou prescricao",
  "Sem pessoa identificavel",
  "Sem local, agenda, tela ou documento sensivel",
  "Midia natural revisada",
  "Publicacao feita manualmente fora do sistema"
];
