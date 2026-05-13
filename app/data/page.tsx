import { WeeklyDataInputClient } from "@/app/data/WeeklyDataInputClient";
import { WEEKLY_MARKETING_DATA_MOCK } from "@/lib/weeklyDataInput";
import { getLatestWeeklyMarketingData } from "@/lib/weeklyMarketingWeeks";

export const dynamic = "force-dynamic";

export default async function WeeklyDataInputPage() {
  const latestWeek = await getLatestWeeklyMarketingData();
  return <WeeklyDataInputClient initialData={latestWeek ?? WEEKLY_MARKETING_DATA_MOCK} source={latestWeek ? "saved" : "draft"} />;
}
