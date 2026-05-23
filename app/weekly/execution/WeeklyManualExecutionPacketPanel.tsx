import Link from "next/link";
import type {
  WeeklyExecutionApprovalGate,
  WeeklyExecutionCollectionItem,
  WeeklyExecutionGateStatus,
  WeeklyExecutionOwnerBrief,
  WeeklyManualExecutionPacket
} from "@/lib/weeklyManualExecutionPacket";

const gateStatusClasses: Record<WeeklyExecutionGateStatus, string> = {
  required: "bg-amber-50 text-amber",
  optional: "bg-cyan-50 text-ocean",
  blocked: "bg-red-50 text-red-700"
};

const collectionPriorityClasses: Record<WeeklyExecutionCollectionItem["priority"], string> = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber",
  low: "bg-slate-100 text-slate-700"
};

export function WeeklyManualExecutionPacketPanel({ packet }: { packet: WeeklyManualExecutionPacket }) {
  return (
    <section className="space-y-6">
      <div className="panel">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-ocean">Pacote manual</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal text-ink">Pacote de Execucao Manual</h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{packet.executiveBrief}</p>
            <p className="mt-1 text-xs text-slate-500">{packet.weekLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {packet.nextOpenLinks.slice(0, 3).map((link) => (
              <Link key={link.href} href={link.href} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <section className="panel">
        <SectionTitle eyebrow="Foco" title="Foco da semana" description="Itens para manter a revisao objetiva antes de qualquer execucao manual." />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {packet.weeklyFocus.map((item) => (
            <p key={item} className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-700">
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="panel">
        <SectionTitle eyebrow="Aprovacoes" title="Gates antes de executar" description="Nada aqui executa sozinho. Os gates existem para bloquear conclusoes apressadas." />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {packet.approvalGates.map((gate) => (
            <ApprovalGateCard key={gate.id} gate={gate} />
          ))}
        </div>
      </section>

      <section className="panel">
        <SectionTitle eyebrow="Responsaveis" title="Brief por responsavel sugerido" description="Agrupamento interno para preparar a revisao humana, sem acionar a equipe automaticamente." />
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {packet.ownerBriefs.map((brief) => (
            <OwnerBriefCard key={brief.id} brief={brief} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className="panel">
          <SectionTitle eyebrow="Coleta" title="Plano de coleta da proxima semana" description="Dados agregados que devem ser coletados para saber se a execucao ajudou." />
          <div className="mt-4 space-y-3">
            {packet.dataCollectionPlan.map((item) => (
              <CollectionItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="panel">
          <SectionTitle eyebrow="Roteiro" title="Roteiro de revisao" description="Sequencia curta para transformar o board em decisao humana registrada." />
          <div className="mt-4 space-y-3">
            {packet.reviewScript.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                <span className="badge bg-slate-100 text-slate-700">Passo {item.order}</span>
                <h4 className="mt-3 font-semibold text-slate-900">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.prompt}</p>
                <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{item.expectedDecision}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionTitle eyebrow="Limites" title="O que este pacote nao autoriza" />
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {packet.doNotDo.map((item) => (
            <p key={item} className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="panel">
        <SectionTitle eyebrow="Abrir modulos" title="Continuar a revisao" />
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {packet.nextOpenLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}

function ApprovalGateCard({ gate }: { gate: WeeklyExecutionApprovalGate }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`badge ${gateStatusClasses[gate.status]}`}>{gateStatusLabel(gate.status)}</span>
        <h4 className="font-semibold text-slate-900">{gate.title}</h4>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{gate.question}</p>
      <ul className="mt-3 space-y-1 text-sm text-slate-500">
        {gate.requiredEvidence.map((item) => (
          <li key={item}>- {item}</li>
        ))}
      </ul>
      <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{gate.defaultDecision}</p>
    </article>
  );
}

function OwnerBriefCard({ brief }: { brief: WeeklyExecutionOwnerBrief }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge bg-slate-100 text-slate-700">{brief.owner}</span>
        <span className="badge bg-cyan-50 text-ocean">Check-in: {brief.nextCheckIn}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{brief.focus}</p>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-md bg-slate-50 p-3">
          <h5 className="text-sm font-semibold text-slate-800">Tarefas</h5>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {brief.tasks.map((task) => (
              <li key={task.id}>#{task.rank} {task.title}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-md bg-slate-50 p-3">
          <h5 className="text-sm font-semibold text-slate-800">Riscos</h5>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {brief.risksToWatch.map((risk) => (
              <li key={risk}>- {risk}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function CollectionItemCard({ item }: { item: WeeklyExecutionCollectionItem }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`badge ${collectionPriorityClasses[item.priority]}`}>{priorityLabel(item.priority)}</span>
        <span className="badge bg-slate-100 text-slate-700">{item.source}</span>
      </div>
      <h4 className="mt-3 font-semibold text-slate-900">{item.label}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600">{item.whyItMatters}</p>
      <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700">{item.privacyRule}</p>
    </article>
  );
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-ocean">{eyebrow}</p>
      <h3 className="mt-1 text-lg font-semibold">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}

function gateStatusLabel(status: WeeklyExecutionGateStatus): string {
  return {
    required: "Obrigatorio",
    optional: "Opcional",
    blocked: "Bloqueio"
  }[status];
}

function priorityLabel(priority: WeeklyExecutionCollectionItem["priority"]): string {
  return {
    high: "Alta",
    medium: "Media",
    low: "Baixa"
  }[priority];
}
