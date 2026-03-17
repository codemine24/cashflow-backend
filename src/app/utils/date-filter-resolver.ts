export const dateFilterResolver = (
  query: Record<string, any>,
): { gte?: Date; lte?: Date } | undefined => {
  const { period, from_date, to_date, date } = query;

  // Custom date range takes priority
  if (from_date || to_date) {
    const filter: { gte?: Date; lte?: Date } = {};
    if (from_date) {
      // Append time to ensure it's parsed as local time, consistent with record creation
      const start = new Date(`${from_date as string}T00:00:00`);
      if (!isNaN(start.getTime())) {
        filter.gte = start;
      }
    }
    if (to_date) {
      // Append time to ensure it's parsed as local time
      const end = new Date(`${to_date as string}T23:59:59.999`);
      if (!isNaN(end.getTime())) {
        filter.lte = end;
      }
    }

    if (Object.keys(filter).length > 0) {
      return filter;
    }
  }

  // Single day filtering
  if (date) {
    const start = new Date(`${date as string}T00:00:00`);
    const end = new Date(`${date as string}T23:59:59.999`);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      return { gte: start, lte: end };
    }
  }

  if (!period || period === "all") return undefined;

  const now = new Date();
  const from = new Date(now);
  const to = new Date(now);

  if (period === "today") {
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return { gte: from, lte: to };
  } else if (period === "yesterday") {
    from.setDate(from.getDate() - 1);
    from.setHours(0, 0, 0, 0);
    to.setDate(to.getDate() - 1);
    to.setHours(23, 59, 59, 999);
    return { gte: from, lte: to };
  } else if (period === "this_month") {
    from.setDate(1);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    return { gte: from, lte: to };
  } else if (period === "last_month") {
    from.setMonth(from.getMonth() - 1);
    from.setDate(1);
    from.setHours(0, 0, 0, 0);
    to.setDate(0); // Set to last day of previous month
    to.setHours(23, 59, 59, 999);
    return { gte: from, lte: to };
  } else if (period === "last_day") {
    from.setHours(0, 0, 0, 0);
    return { gte: from };
  } else if (period === "last_week") {
    from.setDate(from.getDate() - 7);
    return { gte: from };
  } else if (period === "last_year") {
    from.setFullYear(from.getFullYear() - 1);
    return { gte: from };
  } else {
    return undefined;
  }
};
