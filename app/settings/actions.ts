"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function updateBenchmark(formData: FormData) {
  const id = String(formData.get("id"));
  const unit = String(formData.get("unit") ?? "");
  const value = Number(String(formData.get("value")).replace(",", "."));
  if (!id || !Number.isFinite(value) || value <= 0) return;
  if (unit === "%" && (value < 1 || value > 100)) return;
  await prisma.benchmarkSetting.update({ where: { id }, data: { value } });
  revalidatePath("/settings");
  revalidatePath("/benchmarks");
}
