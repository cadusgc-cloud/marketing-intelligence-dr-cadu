import { WeeklyDataInputClient } from "@/app/data/WeeklyDataInputClient";
import { WEEKLY_MARKETING_DATA_MOCK } from "@/lib/weeklyDataInput";

export default function WeeklyDataInputPage() {
  return <WeeklyDataInputClient initialData={WEEKLY_MARKETING_DATA_MOCK} />;
}
