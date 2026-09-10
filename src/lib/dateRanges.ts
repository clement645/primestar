export type DateRangeKey = "today" | "7d" | "30d" | "month" | "custom";

export function resolveDateRange(
  key: DateRangeKey | undefined,
  customFrom?: string,
  customTo?: string
): { from: Date; to: Date } {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);

  if (key === "custom" && customFrom && customTo) {
    return { from: new Date(customFrom), to: new Date(customTo) };
  }

  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  switch (key) {
    case "today":
      return { from, to };
    case "30d":
      from.setDate(from.getDate() - 29);
      return { from, to };
    case "month":
      from.setDate(1);
      return { from, to };
    case "7d":
    default:
      from.setDate(from.getDate() - 6);
      return { from, to };
  }
}
