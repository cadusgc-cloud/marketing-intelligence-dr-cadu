import type { ActiveCycle, MarketingWorkspace, RunbookDay, RunbookPlan, RunbookTask } from "@/lib/marketing-workspace/types";

const dayTemplates: Array<{ weekday: string; objective: string; route: string; tasks: Array<[string, string, string, number]> }> = [
  { weekday: "domingo", objective: "Fechar semana anterior e preparar o ciclo seguinte.", route: "/weekly-review", tasks: [["Revisar semana anterior", "Conferir dados agregados e qualidade do import.", "alta", 35], ["Importar metricas manuais", "Colar TSV/CSV revisado em /imports.", "alta", 25], ["Gerar plano da proxima semana", "Usar fechamento semanal sem publicar automaticamente.", "alta", 30]] },
  { weekday: "segunda", objective: "Comecar execucao sem improviso.", route: "/operations", tasks: [["Conferir operations", "Checar tarefas do dia e readiness.", "alta", 20], ["Publicar manualmente stories planejados", "Copiar textos revisados e manter linguagem natural.", "media", 15], ["Revisar seguranca", "Verificar bloqueios antes de qualquer publicacao manual.", "alta", 15]] },
  { weekday: "terca", objective: "Produzir materia-prima segura.", route: "/studio", tasks: [["Gerar pacote no Studio", "Transformar tema prioritario em stories, reel e carrossel.", "alta", 35], ["Alimentar fila de revisao", "Registrar status local sem dados sensiveis.", "media", 20]] },
  { weekday: "quarta", objective: "Ajustar rota com leitura parcial.", route: "/performance", tasks: [["Revisar performance parcial", "Comparar sinais agregados e evitar conclusoes absolutas.", "media", 25], ["Preparar carrossel ou reel", "Priorizar conteudo educativo de baixo risco.", "media", 40]] },
  { weekday: "quinta", objective: "Gravar ou editar lote curto.", route: "/recording", tasks: [["Planejar gravacao", "Separar roteiros e objetos neutros.", "alta", 30], ["Atualizar fila de producao", "Marcar progresso localmente.", "media", 20]] },
  { weekday: "sexta", objective: "Revisar exportacoes e deixar fim de semana leve.", route: "/exports", tasks: [["Revisar posts e exportacoes", "Checar captions, Etus/manual e agenda.", "alta", 25], ["Preparar proximos stories", "Manter tom espontaneo e sem localizacao.", "media", 20]] },
  { weekday: "sabado", objective: "Encerrar ciclo com reflexao, backup e snapshot.", route: "/workspace", tasks: [["Criar backup local", "Exportar JSON tecnico para guarda local.", "alta", 15], ["Criar snapshot semanal", "Registrar estado local antes da proxima coleta.", "alta", 10], ["Reflexao leve", "Conteudo humano sem sugerir rotina em tempo real.", "baixa", 15]] }
];

export function generateWeeklyRunbook(input: { workspace?: MarketingWorkspace; activeCycle?: ActiveCycle; weekStart?: string } = {}): RunbookPlan {
  const cycle = input.activeCycle ?? input.workspace?.activeCycle;
  const weekStart = input.weekStart ?? cycle?.periodStart ?? "2026-05-24";
  const start = new Date(`${weekStart}T00:00:00Z`);
  const days: RunbookDay[] = dayTemplates.map((template, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    const iso = date.toISOString().slice(0, 10);
    const tasks: RunbookTask[] = template.tasks.map(([title, description, priority, minutes], taskIndex) => ({
      id: `${template.weekday}-${taskIndex + 1}`,
      title,
      description,
      priority: priority as RunbookTask["priority"],
      estimatedMinutes: minutes,
      relatedRoute: taskIndex === 0 ? template.route : template.route,
      prerequisites: taskIndex === 0 ? ["workspace local saudavel"] : ["revisao humana"],
      status: "pendente"
    }));
    return {
      date: iso,
      weekday: template.weekday,
      objective: template.objective,
      tasks,
      exportText: [`## ${template.weekday} - ${iso}`, template.objective, ...tasks.map((task) => `- [ ] ${task.title}: ${task.description} (${task.estimatedMinutes}min)`) ].join("\n")
    };
  });
  const totalEstimatedMinutes = days.flatMap((day) => day.tasks).reduce((sum, task) => sum + task.estimatedMinutes, 0);
  const exportMarkdown = ["# Runbook semanal", "", `Semana: ${weekStart}`, `Campanha: ${cycle?.campaignName ?? "Marketing OS local"}`, "", ...days.map((day) => day.exportText)].join("\n\n");
  const checklistText = days.flatMap((day) => day.tasks.map((task) => `${day.weekday}\t${task.title}\t${task.relatedRoute}\t${task.priority}`)).join("\n");
  return {
    id: `runbook-${weekStart}`,
    weekStart,
    weekEnd: days[6]?.date ?? weekStart,
    status: "saudavel",
    days,
    totalEstimatedMinutes,
    exportMarkdown,
    checklistText
  };
}
