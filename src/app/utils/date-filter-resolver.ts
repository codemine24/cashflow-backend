export const dateFilterResolver = (
  query: Record<string, any>,
): { gte?: Date; lte?: Date } | undefined => {
  const { period, from_date, to_date } = query;

  // Custom date range takes priority
  if (from_date || to_date) {
    const filter: { gte?: Date; lte?: Date } = {};
    if (from_date) filter.gte = new Date(from_date as string);
    if (to_date) {
      const end = new Date(to_date as string);
      end.setHours(23, 59, 59, 999);
      filter.lte = end;
    }
    return filter;
  }

  if (!period || period === "all") return undefined;

  const now = new Date();
  const from = new Date(now);

  if (period === "last_day") {
    from.setHours(0, 0, 0, 0);
  } else if (period === "last_week") {
    from.setDate(from.getDate() - 7);
  } else if (period === "last_month") {
    from.setMonth(from.getMonth() - 1);
  } else if (period === "last_year") {
    from.setFullYear(from.getFullYear() - 1);
  } else {
    return undefined;
  }

  return { gte: from };
};
