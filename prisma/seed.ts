import { PrismaClient } from "@prisma/client";
import { analyzeReport } from "../lib/engine/analyzeReport";
import { WEEKLY_MARKETING_DATA_MOCK } from "../lib/weeklyDataInput";

const prisma = new PrismaClient();

const benchmarks = [
  ["meta_cpl_ideal_min", "Meta Ads CPL ideal mínimo", 6, "BRL", "Referência inferior do intervalo ideal."],
  ["meta_cpl_ideal_max", "Meta Ads CPL ideal máximo", 15, "BRL", "Referência superior do intervalo ideal."],
  ["meta_cpl_excelente", "Meta Ads CPL excelente", 6, "BRL", "Abaixo deste valor é excelente."],
  ["meta_cpl_atencao", "Meta Ads CPL atenção", 20, "BRL", "Acima deste valor exige investigação."],
  ["google_cpa_excelente", "Google CPA excelente", 7, "BRL", "Até este valor é excelente."],
  ["google_cpa_atencao", "Google CPA atenção", 20, "BRL", "Acima deste valor exige atenção."],
  ["google_cpa_critico", "Google CPA crítico", 30, "BRL", "Acima deste valor é crítico."],
  ["followers_daily_min_3000", "Seguidores mínimos por dia para R$ 3.000/mês", 39, "seguidores/dia", "Meta mínima de crescimento para investimento mensal de R$ 3.000."],
  ["stories_retention_good", "Retenção boa de stories", 75, "%", "Acima deste percentual é bom ativo de relacionamento."],
  ["reach_drop_attention", "Queda importante de alcance", 10, "%", "Queda acima deste percentual pede renovação de ToFu."],
  ["google_conversion_drop_critical", "Queda crítica de conversões Google", 30, "%", "Queda acima deste percentual é crítica."],
  ["creative_concentration_risk", "Concentração perigosa em criativos", 70, "%", "Top 2 criativos acima deste percentual geram risco de saturação."]
] as const;

const reports = [
  `Relatório Quinzenal Tráfego - 08/03 a 22/03/2026
Tipo: biweekly
Período: 08/03/2026 a 22/03/2026
Investimento total: R$ 1.559,29
Meta Ads: R$ 1.351,98
Google Ads: R$ 207,31
Alcance: 154.382
Impressões: 820.856
Seguidores líquidos: 341
CPS: R$ 3,97
Conversas Meta: 85
CPL Meta: R$ 15,91
Google conversões: 14
Google CPA: R$ 14,81
Criativo vencedor: Resultado 3 meses pós — 33 leads — CPL R$ 3,52
Criativos Maternidade: 24 leads somados
Keywords vencedoras: lipoaspiração — 2 conversões — CPA R$ 4,93; cirurgia plástica nos seios — 2 conversões — CPA R$ 7,34
Diagnóstico: ToFu com alcance e seguidores abaixo do esperado, possível saturação.`,
  `Relatório Semanal — 13/04 a 19/04/2026
Tipo: weekly
Período: 13/04/2026 a 19/04/2026
Alcance: 105.513
Impressões: 167.058
Novos seguidores: 473
Conversas Meta: 27
CPL Meta: R$ 23,15
Investimento Meta: R$ 625,18
Google cliques: 45
Google conversões: 6
Google CPA: R$ 24,10
Investimento Google: R$ 144,59
Criativos: Resultado 3 meses pós — 12 conversas — CPL R$ 3,35
Criativos: Nem toda mulher — 8 conversas — CPL R$ 5,03
Keywords: cirurgia plástica nos seios — 4 conversões — CPA R$ 9,12; mamoplastia redutora — 2 conversões — CPA R$ 8,19
Diagnóstico: alcance recuperou, mas leads levemente menores. Top 2 criativos concentram 74% dos leads.`,
  `Relatório Semanal — 20/04 a 26/04/2026
Tipo: weekly
Período: 20/04/2026 a 26/04/2026
Investimento total: R$ 750,71
Meta Ads: R$ 622,87
Google Ads: R$ 127,84
Alcance: 87.698
Impressões: 155.322
Novos seguidores: 436
Conversas Meta: 27
CPL Meta: R$ 23,07
Google cliques: 49
Google conversões: 4
Google CPA: R$ 31,96
Criativos vencedores:
- Resultado 3 meses pós — 9 conversas — CPL R$ 5,89
- Nem toda mulher — 8 conversas — CPL R$ 4,89
- Você pesquisou — 8 conversas — CPL R$ 4,03
Criativo problemático: G1_IMG — R$ 215,00 investidos — 899 visitas ao perfil — apenas 1 conversa
Diagnóstico: queda de ToFu, Google crítico, bons criativos BoFu isolados.`
];

async function main() {
  await prisma.dataIssue.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.keywordPerformance.deleteMany();
  await prisma.creativePerformance.deleteMany();
  await prisma.channelSummary.deleteMany();
  await prisma.weeklyMarketingWeek.deleteMany();
  await prisma.report.deleteMany();
  await prisma.benchmarkSetting.deleteMany();

  for (const [key, label, value, unit, description] of benchmarks) {
    await prisma.benchmarkSetting.create({ data: { key, label, value, unit, description } });
  }

  for (const rawText of reports) {
    const parsed = analyzeReport(rawText);
    await prisma.report.create({
      data: {
        title: parsed.title,
        rawText: parsed.rawText,
        reportType: parsed.reportType,
        periodStart: parsed.periodStart,
        periodEnd: parsed.periodEnd,
        receivedAt: parsed.receivedAt,
        sourceLabel: parsed.sourceLabel,
        isOperationalAnomaly: parsed.isOperationalAnomaly,
        anomalyReason: parsed.anomalyReason,
        confidenceScore: parsed.confidenceScore,
        channelSummaries: {
          create: parsed.channels.map((channel) => ({
            channel: channel.channel,
            investment: channel.investment,
            reach: channel.reach,
            impressions: channel.impressions,
            frequency: channel.frequency,
            clicks: channel.clicks,
            profileVisits: channel.profileVisits,
            newFollowers: channel.newFollowers,
            followersTotal: channel.followersTotal,
            conversations: channel.conversations,
            conversions: channel.conversions,
            opportunities: channel.opportunities,
            cpl: channel.cpl,
            cpa: channel.cpa,
            cps: channel.cps,
            cpc: channel.cpc,
            ctr: channel.ctr,
            engagementRate: channel.engagementRate,
            storyCount: channel.storyCount,
            storyViews: channel.storyViews,
            storyRetention: channel.storyRetention,
            reelCount: channel.reelCount,
            postCount: channel.postCount
          }))
        },
        creatives: {
          create: parsed.creatives.map((creative) => ({
            platform: creative.platform,
            name: creative.name,
            format: creative.format ?? "unknown",
            funnelStage: creative.funnelStage ?? "unknown",
            investment: creative.investment,
            conversations: creative.conversations,
            conversions: creative.conversions,
            leads: creative.leads,
            cpl: creative.cpl,
            cpa: creative.cpa,
            profileVisits: creative.profileVisits,
            reach: creative.reach,
            impressions: creative.impressions,
            interactions: creative.interactions,
            saves: creative.saves,
            shares: creative.shares,
            comments: creative.comments,
            diagnosis: creative.diagnosis ?? "unknown"
          }))
        },
        keywords: { create: parsed.keywords },
        recommendations: { create: parsed.recommendations },
        dataIssues: { create: parsed.dataIssues }
      }
    });
  }

  await prisma.weeklyMarketingWeek.upsert({
    where: {
      startDate_endDate: {
        startDate: WEEKLY_MARKETING_DATA_MOCK.startDate,
        endDate: WEEKLY_MARKETING_DATA_MOCK.endDate
      }
    },
    update: {
      weekLabel: WEEKLY_MARKETING_DATA_MOCK.weekLabel,
      metaSpend: WEEKLY_MARKETING_DATA_MOCK.metaSpend,
      metaWhatsappConversations: WEEKLY_MARKETING_DATA_MOCK.metaWhatsappConversations,
      metaProfileVisits: WEEKLY_MARKETING_DATA_MOCK.metaProfileVisits,
      googleSpend: WEEKLY_MARKETING_DATA_MOCK.googleSpend,
      googleClicks: WEEKLY_MARKETING_DATA_MOCK.googleClicks,
      googleConversions: WEEKLY_MARKETING_DATA_MOCK.googleConversions,
      instagramStories: WEEKLY_MARKETING_DATA_MOCK.instagramStories,
      instagramReels: WEEKLY_MARKETING_DATA_MOCK.instagramReels,
      instagramPosts: WEEKLY_MARKETING_DATA_MOCK.instagramPosts,
      instagramProfileVisits: WEEKLY_MARKETING_DATA_MOCK.instagramProfileVisits,
      whatsappTotal: WEEKLY_MARKETING_DATA_MOCK.whatsappTotal,
      qualifiedConversations: WEEKLY_MARKETING_DATA_MOCK.qualifiedConversations,
      consultationsScheduled: WEEKLY_MARKETING_DATA_MOCK.consultationsScheduled,
      consultationsAttended: WEEKLY_MARKETING_DATA_MOCK.consultationsAttended,
      surgeriesClosed: WEEKLY_MARKETING_DATA_MOCK.surgeriesClosed,
      notes: WEEKLY_MARKETING_DATA_MOCK.notes
    },
    create: {
      weekLabel: WEEKLY_MARKETING_DATA_MOCK.weekLabel,
      startDate: WEEKLY_MARKETING_DATA_MOCK.startDate,
      endDate: WEEKLY_MARKETING_DATA_MOCK.endDate,
      metaSpend: WEEKLY_MARKETING_DATA_MOCK.metaSpend,
      metaWhatsappConversations: WEEKLY_MARKETING_DATA_MOCK.metaWhatsappConversations,
      metaProfileVisits: WEEKLY_MARKETING_DATA_MOCK.metaProfileVisits,
      googleSpend: WEEKLY_MARKETING_DATA_MOCK.googleSpend,
      googleClicks: WEEKLY_MARKETING_DATA_MOCK.googleClicks,
      googleConversions: WEEKLY_MARKETING_DATA_MOCK.googleConversions,
      instagramStories: WEEKLY_MARKETING_DATA_MOCK.instagramStories,
      instagramReels: WEEKLY_MARKETING_DATA_MOCK.instagramReels,
      instagramPosts: WEEKLY_MARKETING_DATA_MOCK.instagramPosts,
      instagramProfileVisits: WEEKLY_MARKETING_DATA_MOCK.instagramProfileVisits,
      whatsappTotal: WEEKLY_MARKETING_DATA_MOCK.whatsappTotal,
      qualifiedConversations: WEEKLY_MARKETING_DATA_MOCK.qualifiedConversations,
      consultationsScheduled: WEEKLY_MARKETING_DATA_MOCK.consultationsScheduled,
      consultationsAttended: WEEKLY_MARKETING_DATA_MOCK.consultationsAttended,
      surgeriesClosed: WEEKLY_MARKETING_DATA_MOCK.surgeriesClosed,
      notes: WEEKLY_MARKETING_DATA_MOCK.notes
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
