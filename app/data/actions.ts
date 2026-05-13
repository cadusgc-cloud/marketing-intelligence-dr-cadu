"use server";

import { revalidatePath } from "next/cache";
import { parseWeeklyMarketingFormData } from "@/lib/weeklyMarketingForm";
import { WeeklyMarketingWeekValidationError, upsertWeeklyMarketingData } from "@/lib/weeklyMarketingWeeks";

export type SaveWeeklyMarketingDataState = {
  status: "idle" | "success" | "error";
  message: string | null;
  errors: string[];
};

export async function saveWeeklyMarketingData(
  _previousState: SaveWeeklyMarketingDataState,
  formData: FormData
): Promise<SaveWeeklyMarketingDataState> {
  const parsed = parseWeeklyMarketingFormData(formData);
  if (!parsed.input) {
    return {
      status: "error",
      message: "Nao foi possivel salvar a semana. Revise os campos destacados.",
      errors: parsed.errors
    };
  }

  try {
    const saved = await upsertWeeklyMarketingData(parsed.input);
    revalidatePath("/data");
    revalidatePath("/weekly");
    return {
      status: "success",
      message: `${saved.weekLabel} salva. A Central Semanal ja usa estes dados.`,
      errors: []
    };
  } catch (error) {
    if (error instanceof WeeklyMarketingWeekValidationError) {
      return {
        status: "error",
        message: "Nao foi possivel salvar a semana. Revise os campos destacados.",
        errors: error.errors
      };
    }

    return {
      status: "error",
      message: "Nao foi possivel salvar os dados semanais agora.",
      errors: []
    };
  }
}
