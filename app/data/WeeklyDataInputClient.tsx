"use client";

import { useMemo, useState } from "react";
import { channelLabel } from "@/lib/decisionSignals";
import {
  WEEKLY_MARKETING_DATA_MOCK,
  createEmptyWeeklyMarketingData,
  getCalculatedWeeklyMetrics,
  isMetaPerformingBetterThanGoogle,
  normalizeWeeklyMarketingData,
  summarizeWeeklyMarketingData,
  updateWeeklyMarketingDataField,
  validateWeeklyMarketingData,
  convertWeeklyDataToDecisionInputs,
  type WeeklyMarketingData
} from "@/lib/weeklyDataInput";

type NumberField = {
  key: keyof WeeklyMarketingData;
  label: string;
  nullable?: boolean;
  step?: string;
};

function MetricCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="metric-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date";
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ocean focus:ring-1 focus:ring-ocean"
      />
    </label>
  );
}

function NumberInput({ field, data, onChange }: { field: NumberField; data: WeeklyMarketingData; onChange: (field: NumberField, value: string) => void }) {
  const value = data[field.key] as number | null;
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{field.label}</span>
      <input
        type="number"
        min="0"
        step={field.step ?? "1"}
        value={value ?? ""}
        onChange={(event) => onChange(field, event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ocean focus:ring-1 focus:ring-ocean"
      />
    </label>
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

export function WeeklyDataInputClient({ initialData }: { initialData: WeeklyMarketingData }) {
  const [data, setData] = useState(() => normalizeWeeklyMarketingData(initialData));
  const metrics = useMemo(() => getCalculatedWeeklyMetrics(data), [data]);
  const validation = useMemo(() => validateWeeklyMarketingData(data), [data]);
  const decisionInputs = useMemo(() => convertWeeklyDataToDecisionInputs(data), [data]);

  function setTextField(field: keyof WeeklyMarketingData, value: string) {
    setData((current) => updateWeeklyMarketingDataField(current, field, value as never));
  }

  function setNumberField(field: NumberField, rawValue: string) {
    const value = rawValue.trim() === "" && field.nullable ? null : Number(rawValue);
    setData((current) => updateWeeklyMarketingDataField(current, field.key, (Number.isFinite(value as number) ? value : 0) as never));
  }

  function restoreMockData() {
    setData(normalizeWeeklyMarketingData(WEEKLY_MARKETING_DATA_MOCK));
  }

  function clearData() {
    setData(createEmptyWeeklyMarketingData());
  }

  function recalculateData() {
    setData((current) => normalizeWeeklyMarketingData(current));
  }

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="text-sm font-medium text-ocean">Dados semanais</p>
        <h2 className="mt-1 text-2xl font-semibold">Dados semanais</h2>
        <p className="mt-2 text-sm text-slate-500">Entrada leve de métricas para alimentar a auditoria e os sinais de decisão.</p>
        <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm font-medium text-amber">
          Nesta fase, os dados são editáveis apenas localmente. Upload de CSV, banco de dados e persistência ainda não foram implementados.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={restoreMockData} className="rounded-md bg-ocean px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800">
            Restaurar dados simulados
          </button>
          <button type="button" onClick={clearData} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Limpar dados da semana
          </button>
          <button type="button" onClick={recalculateData} className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            Recalcular indicadores
          </button>
        </div>
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Dados da semana</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <TextInput label="Rótulo da semana" value={data.weekLabel} onChange={(value) => setTextField("weekLabel", value)} />
          <TextInput label="Início" type="date" value={data.startDate} onChange={(value) => setTextField("startDate", value)} />
          <TextInput label="Fim" type="date" value={data.endDate} onChange={(value) => setTextField("endDate", value)} />
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">Observações</span>
          <textarea
            value={data.notes}
            onChange={(event) => setTextField("notes", event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-ocean focus:ring-1 focus:ring-ocean"
          />
        </label>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <InputGroup title="Meta Ads" fields={metaFields} data={data} onChange={setNumberField} />
        <InputGroup title="Google Ads" fields={googleFields} data={data} onChange={setNumberField} />
        <InputGroup title="Instagram orgânico" fields={instagramFields} data={data} onChange={setNumberField} />
        <InputGroup title="Funil comercial" fields={funnelFields} data={data} onChange={setNumberField} />
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Resumo da semana</h3>
        <p className="mt-2 text-sm text-slate-600">{summarizeWeeklyMarketingData(data)}</p>
        {data.notes ? <p className="mt-3 text-sm text-slate-500">{data.notes}</p> : null}
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <MetricCard label="Meta Ads" value={formatCurrency(data.metaSpend)} detail={`${data.metaWhatsappConversations} conversas no WhatsApp`} />
        <MetricCard label="Google Ads" value={formatCurrency(data.googleSpend)} detail={`${data.googleConversions} conversões`} />
        <MetricCard label="Stories na semana" value={data.instagramStories} detail="mínimo operacional: 42" />
        <MetricCard label="Funil" value={validation.valid ? "Completo" : "Incompleto"} detail={`${validation.missingFields.length} campo(s) ausente(s)`} />
      </section>

      <section className="panel">
        <h3 className="text-lg font-semibold">Indicadores calculados</h3>
        <p className="mt-1 text-sm text-slate-500">Campos calculados são resultados automáticos. O usuário não precisa digitá-los.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <MetricCard label="Custo por WhatsApp" value={formatCurrency(metrics.metaCostPerWhatsapp)} />
          <MetricCard label="Custo por visita ao perfil" value={formatCurrency(metrics.metaCostPerProfileVisit)} />
          <MetricCard label="CPC Google" value={formatCurrency(metrics.googleCostPerClick)} />
          <MetricCard label="Taxa de conversão Google" value={formatPercent(metrics.googleConversionRate)} detail="Google segue em diagnóstico quando conversões estão zeradas" />
          <MetricCard label="Taxa de comparecimento" value={formatPercent(metrics.consultationShowRate)} />
          <MetricCard label="Taxa de fechamento" value={formatPercent(metrics.surgeryCloseRate)} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h3 className="text-lg font-semibold">Alertas e dados ausentes</h3>
          <p className="mt-1 text-sm text-slate-500">Alertas indicam lacunas operacionais, não erro técnico.</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {validation.missingFields.map((field) => (
              <li key={field}>- Campo ausente ou zerado: {field}</li>
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
          <p className="mt-4 text-sm font-medium text-slate-600">
            Meta como leitura mais confiável: {isMetaPerformingBetterThanGoogle(data) ? "sim" : "não"}
          </p>
        </div>
      </section>
    </div>
  );
}

function InputGroup({
  title,
  fields,
  data,
  onChange
}: {
  title: string;
  fields: NumberField[];
  data: WeeklyMarketingData;
  onChange: (field: NumberField, value: string) => void;
}) {
  return (
    <section className="panel">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <NumberInput key={String(field.key)} field={field} data={data} onChange={onChange} />
        ))}
      </div>
    </section>
  );
}

const metaFields: NumberField[] = [
  { key: "metaSpend", label: "Investimento Meta Ads", step: "0.01" },
  { key: "metaWhatsappConversations", label: "Conversas no WhatsApp" },
  { key: "metaProfileVisits", label: "Visitas ao perfil" }
];

const googleFields: NumberField[] = [
  { key: "googleSpend", label: "Investimento Google Ads", step: "0.01" },
  { key: "googleClicks", label: "Cliques" },
  { key: "googleConversions", label: "Conversões" }
];

const instagramFields: NumberField[] = [
  { key: "instagramStories", label: "Stories na semana" },
  { key: "instagramReels", label: "Reels/Shorts na semana" },
  { key: "instagramPosts", label: "Posts na semana" },
  { key: "instagramProfileVisits", label: "Visitas ao perfil" }
];

const funnelFields: NumberField[] = [
  { key: "whatsappTotal", label: "WhatsApps totais" },
  { key: "qualifiedConversations", label: "Conversas qualificadas" },
  { key: "consultationsScheduled", label: "Consultas marcadas", nullable: true },
  { key: "consultationsAttended", label: "Consultas comparecidas", nullable: true },
  { key: "surgeriesClosed", label: "Cirurgias fechadas", nullable: true }
];
