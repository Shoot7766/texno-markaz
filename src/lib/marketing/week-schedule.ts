/** Hafta qisqa nomlari (admin/marketing bir xil tartibda). */
export const WEEKDAY_SHORT_UZ = ["Du", "Se", "Chor", "Pay", "Juma", "Shan", "Yak"] as const;

type HasScheduleFields = {
  schedule?: string | null;
  schedule_days?: string[] | null;
};

/**
 * Guruhlarni kun ustunlariga bo‘ladi. Kunlar bo‘sh bo‘lsa, bitta kunga majburan
 * qo‘ymaydi — `unscheduled` ro‘yxatiga chiqaradi (har hafta qo‘lda jadval uchun).
 */
export function partitionGroupsByWeekDays<T extends HasScheduleFields>(
  items: T[],
  weekDays: readonly string[] = WEEKDAY_SHORT_UZ
): { byDay: Record<string, T[]>; unscheduled: T[] } {
  const byDay = Object.fromEntries(weekDays.map((d) => [d, [] as T[]])) as Record<string, T[]>;
  const unscheduled: T[] = [];

  for (const g of items) {
    const fromField = (g.schedule_days ?? []).filter(Boolean);
    const fromText =
      fromField.length > 0
        ? fromField
        : weekDays.filter((day) => (g.schedule ?? "").toLowerCase().includes(day.toLowerCase()));

    if (fromText.length === 0) {
      unscheduled.push(g);
      continue;
    }
    for (const d of fromText) {
      if (byDay[d]) byDay[d].push(g);
    }
  }

  return { byDay, unscheduled };
}
