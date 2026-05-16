export type WeeklyCollectionTemplateField = {
  label: string;
  sourceHint: string;
  required: boolean;
  example: string;
};

export type WeeklyCollectionTemplateSection = {
  title: string;
  source: string;
  fields: WeeklyCollectionTemplateField[];
};

export type WeeklyCollectionTemplateOptions = {
  weekLabel?: string;
  startDateLabel?: string;
  endDateLabel?: string;
};

const sections: WeeklyCollectionTemplateSection[] = [
  {
    title: "Meta Ads",
    source: "Meta Ads Manager, usando apenas metricas agregadas da semana.",
    fields: [
      field("Investimento Meta Ads", "Total gasto no periodo semanal.", "R$ 780,00"),
      field("Conversas Meta", "Conversas iniciadas ou atribuidas ao Meta Ads.", "118"),
      field("Visitas ao perfil Meta", "Visitas ao perfil vindas das campanhas, quando disponivel.", "6100", false)
    ]
  },
  {
    title: "Google Ads",
    source: "Google Ads, campanha ou conta filtrada pelo mesmo periodo semanal.",
    fields: [
      field("Investimento Google Ads", "Total gasto no periodo semanal.", "R$ 220,00"),
      field("Cliques Google Ads", "Cliques agregados da semana.", "48"),
      field("Conversoes Google Ads", "Conversoes rastreadas na semana, mesmo quando for zero.", "0")
    ]
  },
  {
    title: "Instagram organico",
    source: "Instagram Insights, Meta Business Suite ou conferencia editorial manual.",
    fields: [
      field("Stories publicados", "Quantidade total de Stories publicados na semana.", "42"),
      field("Reels publicados", "Quantidade total de Reels/Shorts publicados na semana.", "3"),
      field("Posts publicados", "Quantidade total de posts no feed ou carrossel.", "2"),
      field("Visitas ao perfil Instagram", "Visitas agregadas ao perfil no periodo.", "1290", false)
    ]
  },
  {
    title: "WhatsApp e funil comercial",
    source: "Planilha interna ou consolidado manual do atendimento.",
    fields: [
      field("WhatsApps totais", "Total agregado de conversas recebidas na semana.", "126"),
      field("Conversas qualificadas", "Conversas com potencial comercial apos triagem.", "42"),
      field("Consultas marcadas", "Consultas marcadas no periodo.", "12"),
      field("Consultas comparecidas", "Consultas que compareceram.", "9"),
      field("Cirurgias fechadas", "Fechamentos comerciais confirmados na semana.", "2")
    ]
  }
];

const safetyChecklist = [
  "Usar apenas numeros consolidados da semana.",
  "Nao colar nomes, telefones, DMs, prints, conversas individuais ou dados clinicos.",
  "Manter Instagram, Meta Ads, Google Ads e funil no mesmo periodo.",
  "Revisar manualmente antes de aplicar e salvar a semana.",
  "Tratar campos vazios como ausencia de dado, nao como resultado ruim."
];

export function getWeeklyCollectionTemplateSections(): WeeklyCollectionTemplateSection[] {
  return sections.map((section) => ({
    ...section,
    fields: section.fields.map((fieldItem) => ({ ...fieldItem }))
  }));
}

export function getWeeklyCollectionSafetyChecklist(): string[] {
  return [...safetyChecklist];
}

export function buildWeeklyCollectionTemplate(options: WeeklyCollectionTemplateOptions = {}): string {
  const weekLabel = options.weekLabel ?? "Semana DD/MM a DD/MM/AAAA";
  const startDateLabel = options.startDateLabel ?? "DD/MM/AAAA";
  const endDateLabel = options.endDateLabel ?? "DD/MM/AAAA";
  const lines = [
    `Periodo: ${startDateLabel} a ${endDateLabel}`,
    `Rotulo da semana: ${weekLabel}`,
    "",
    "# Cole abaixo apenas dados agregados. Nao inclua nomes, telefones, DMs ou conversas individuais.",
    ""
  ];

  for (const section of sections) {
    lines.push(`# ${section.title}`);
    for (const sectionField of section.fields) {
      lines.push(`${sectionField.label}: `);
    }
    lines.push("");
  }

  lines.push("# Observacoes agregadas");
  lines.push("Observacoes: ");

  return lines.join("\n").trimEnd();
}

export function buildWeeklyCollectionExample(): string {
  const lines = [
    "Periodo: 11/05/2026 a 17/05/2026",
    "Rotulo da semana: Semana 11/05 a 17/05/2026",
    "",
    "# Exemplo com dados simulados e agregados."
  ];

  for (const section of sections) {
    lines.push("", `# ${section.title}`);
    for (const sectionField of section.fields) {
      lines.push(`${sectionField.label}: ${sectionField.example}`);
    }
  }

  lines.push("", "Observacoes: exemplo agregado sem dados pessoais");

  return lines.join("\n");
}

function field(label: string, sourceHint: string, example: string, required = true): WeeklyCollectionTemplateField {
  return {
    label,
    sourceHint,
    required,
    example
  };
}
