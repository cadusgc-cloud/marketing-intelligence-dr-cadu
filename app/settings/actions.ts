"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function updateBenchmark(formData: FormData) {
  const id = String(formData.get("id"));
  const value = Number(String(formData.get("value")).replace(",", "."));
  if (!id || !Number.isFinite(value)) return;
  await prisma.benchmarkSetting.update({ where: { id }, data: { value } });
  revalidatePath("/settings");
  revalidatePath("/benchmarks");
}
