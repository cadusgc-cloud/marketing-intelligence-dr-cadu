import {
  WEEKLY_MARKETING_DATA_MOCK,
  calculateConsultationShowRate,
  calculateGoogleConversionRate,
  calculateGoogleCostPerClick,
  calculateMetaCostPerProfileVisit,
  calculateMetaCostPerWhatsapp,
  calculateSurgeryCloseRate,
  convertWeeklyDataToDecisionInputs,
  isMetaPerformingBetterThanGoogle,
  summarizeWeeklyMarketingData,
  validateWeeklyMarketingData
} from "@/lib/weeklyDataInput";
import { channelLabel } from "@/lib/decisionSignals";

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
    </div>
  );
}

function formatCurrency(value: number | null): string {
  if (value === null) return "sem dado";
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function formatPercent(value: number | null): string {
  if (value === null) return "sem dado";
  return `${(value * 100).toFixed(1).replace(".", ",")}%`;
}

export default function WeeklyDataInputPage() {
  const data = WEEKLY_MARKETING_DATA_MOCK;
  const validation = validateWeeklyMarketingData(data);
  const decisionInputs = convertWeeklyDataToDecisionInputs(data);
  const metaCostPerWhatsapp = data.metaCostPerWhatsapp ?? calculateMetaCostPerWhatsapp(data.metaSpend, data.metaWhatsappConversations);
  const metaCostPerProfileVisit = data.metaCostPerProfileVisit ?? calculateMetaCostPerProfileVisit(data.metaSpend, data.metaProfileVisits);
  const googleCpc = data.googleCostPerClick ?? calculateGoogleCostPerClick(data.googleSpend, data.googleClicks);
  const googleConversionRate = data.googleConversionRate ?? calculateGoogleConversionRate(data.googleConversions, data.googleClicks);
  const showRate = calculateConsultationShowRate(data.consultationsAttended, data.consultationsScheduled);
  const closeRate = calculateSurgeryCloseRate(data.surgeriesClosed, data.consultationsAttended);

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Dados semanais</p>
        <h2 className="mt-1 text-2xl font-semibold">Dados semanais</h2>
        <p className="mt-2 text-sm text-slate-500">Entrada leve de métricas para alimentar a auditoria e os sinais de decisão.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Nesta fase, os dados são simulados; o upload de CSV ainda não foi implementado.
        </p>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Resumo da semana</h3>
        <p className="mt-2 text-sm text-slate-600">{summarizeWeeklyMarketingData(data)}</p>
        <p className="mt-3 text-sm text-slate-500">{data.notes}</p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Meta Ads" value={formatCurrency(data.metaSpend)} detail={`${data.metaWhatsappConversations} conversas no WhatsApp`} />
        <MetricCard label="Google Ads" value={formatCurrency(data.googleSpend)} detail={`${data.googleConversions} conversões`} />
        <MetricCard label="Stories por dia" value={data.instagramStories} detail="mínimo operacional: 6" />
        <MetricCard label="Funil" value={validation.valid ? "Completo" : "Incompleto"} detail={`${validation.missingFields.length} campo(s) ausente(s)`} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Meta Ads</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <MetricCard label="Custo por WhatsApp" value={formatCurrency(metaCostPerWhatsapp)} />
            <MetricCard label="Visitas ao perfil" value={data.metaProfileVisits} />
            <MetricCard label="Custo por visita" value={formatCurrency(metaCostPerProfileVisit)} />
            <MetricCard label="Canal principal" value={isMetaPerformingBetterThanGoogle(data) ? "Sim" : "Não"} detail="Meta Ads performa melhor que Google Ads nesta amostra" />
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Google Ads</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <MetricCard label="Cliques" value={data.googleClicks} />
            <MetricCard label="CPC" value={formatCurrency(googleCpc)} />
            <MetricCard label="Conversões" value={data.googleConversions} />
            <MetricCard label="Taxa de conversão" value={formatPercent(googleConversionRate)} detail="em diagnóstico até corrigir conversões" />
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Instagram orgânico</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <MetricCard label="Stories" value={data.instagramStories} />
            <MetricCard label="Reels/Shorts" value={data.instagramReels} />
            <MetricCard label="Posts" value={data.instagramPosts} />
            <MetricCard label="Visitas ao perfil" value={data.instagramProfileVisits} />
          </div>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Funil comercial</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <MetricCard label="WhatsApps totais" value={data.whatsappTotal} />
            <MetricCard label="Conversas qualificadas" value={data.qualifiedConversations} />
            <MetricCard label="Comparecimento" value={formatPercent(showRate)} />
            <MetricCard label="Fechamento" value={formatPercent(closeRate)} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Alertas de dados ausentes</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {validation.missingFields.map((field) => (
              <li key={field}>- {field}</li>
            ))}
          </ul>
          <h4 className="mt-5 text-sm font-semibold">Avisos operacionais</h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-600">
            {validation.warnings.map((warning) => (
              <li key={warning}>- {warning}</li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3 className="text-lg font-semibold">Prévia dos sinais de decisão</h3>
          <p className="mt-2 text-sm text-slate-500">Estas métricas seriam convertidas em entradas para o módulo Sinais de decisão.</p>
          <div className="mt-4 space-y-2">
            {decisionInputs.map((input) => (
              <div key={input.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                <p className="font-semibold">{channelLabel(input.channel)} - {input.metric}</p>
                <p className="mt-1">Valor: {input.value === null ? "sem dado" : String(input.value)} {input.unit}</p>
                <p className="mt-1 text-slate-500">{input.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
