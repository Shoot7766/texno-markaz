export function parseTimeMap(timeStr: string | null): Record<string, string> {
  if (!timeStr) return {};
  try {
    const parsed = JSON.parse(timeStr);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return { default: timeStr };
  }
}

export function formatTimeDisplay(timeStr: string | null): string {
  if (!timeStr) return "";
  try {
    const parsed = JSON.parse(timeStr);
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.entries(parsed)
        .filter(([_, t]) => Boolean(t))
        .map(([d, t]) => `${d} - ${t}`)
        .join(", ");
    }
  } catch {}
  return timeStr;
}

export function getTimeForDay(timeStr: string | null, day: string): string {
  const parsed = parseTimeMap(timeStr);
  return parsed[day] || parsed.default || "";
}
