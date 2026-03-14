import { prisma } from "../../shared/prisma";
import { TAuthUser } from "../../interfaces/common";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolves a `created_at` Prisma filter from the query params.
 * Supports period = day | week | month | year  AND  from_date / to_date (custom range).
 */
const resolveDateFilter = (
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

  if (period === "day") {
    from.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    from.setDate(from.getDate() - 7);
  } else if (period === "month") {
    from.setMonth(from.getMonth() - 1);
  } else if (period === "year") {
    from.setFullYear(from.getFullYear() - 1);
  } else {
    return undefined;
  }

  return { gte: from };
};

// ─── GET OVERVIEW ─────────────────────────────────────────────────────────────
/**
 * Returns 6 stats split between own books and shared books:
 *  1. Total own books count
 *  2. Total IN (income) in own books
 *  3. Total OUT (expense) in own books
 *  4. Total shared books count
 *  5. Total IN (income) in shared books
 *  6. Total OUT (expense) in shared books
 *
 * Filter by: period = day | week | month | year | all
 *        OR: from_date / to_date (ISO date strings, custom range)
 */
const getBookOverview = async (user: TAuthUser, query: Record<string, any>) => {
  const dateFilter = resolveDateFilter(query);
  const createdAtFilter = dateFilter ? { created_at: dateFilter } : {};

  // --- Own books ---
  const ownedBooks = await prisma.book.findMany({
    where: { user_id: user.id },
    select: { id: true },
  });
  const ownedBookIds = ownedBooks.map((b) => b.id);

  // --- Shared books (member of but NOT owner) ---
  const memberEntries = await prisma.bookMember.findMany({
    where: {
      user_id: user.id,
      book_id: { notIn: ownedBookIds }, // exclude own books
    },
    select: { book_id: true },
  });
  const sharedBookIds = [...new Set(memberEntries.map((m) => m.book_id))];

  // Fetch transactions for own and shared books in one parallel call
  const [ownTransactions, sharedTransactions] = await Promise.all([
    ownedBookIds.length > 0
      ? prisma.transaction.findMany({
          where: {
            book_id: { in: ownedBookIds },
            ...createdAtFilter,
          },
          select: { type: true, amount: true },
        })
      : Promise.resolve([]),
    sharedBookIds.length > 0
      ? prisma.transaction.findMany({
          where: {
            book_id: { in: sharedBookIds },
            ...createdAtFilter,
          },
          select: { type: true, amount: true },
        })
      : Promise.resolve([]),
  ]);

  let ownIncome = 0;
  let ownExpense = 0;
  for (const tx of ownTransactions) {
    const amt = Number(tx.amount);
    if (tx.type === "IN") ownIncome += amt;
    else ownExpense += amt;
  }

  let sharedIncome = 0;
  let sharedExpense = 0;
  for (const tx of sharedTransactions) {
    const amt = Number(tx.amount);
    if (tx.type === "IN") sharedIncome += amt;
    else sharedExpense += amt;
  }

  return {
    own_books: {
      total: ownedBookIds.length,
      total_income: ownIncome,
      total_expense: ownExpense,
      net_balance: ownIncome - ownExpense,
    },
    shared_books: {
      total: sharedBookIds.length,
      total_income: sharedIncome,
      total_expense: sharedExpense,
      net_balance: sharedIncome - sharedExpense,
    },
    // filter: {
    //   period: query.period ?? "all",
    //   from_date: query.from_date ?? null,
    //   to_date: query.to_date ?? null,
    // },
  };
};

// ─── GET TRANSACTION TREND ────────────────────────────────────────────────────
// Returns grouped income/expense by day (week), month (year), or month (month)
const getTransactionTrend = async (
  user: TAuthUser,
  query: Record<string, any>,
) => {
  const period: string = (query.period as string) || "month";
  const bookId: string | undefined = query.book_id;

  // Use resolveDateFilter but fall back to last-year if period is "all"
  const effectiveQuery =
    period === "all" ? { ...query, period: "year" } : query;
  const dateFilter = resolveDateFilter(effectiveQuery);

  const ownedBookIds = (
    await prisma.book.findMany({
      where: { user_id: user.id },
      select: { id: true },
    })
  ).map((b) => b.id);

  const memberBookIds = (
    await prisma.bookMember.findMany({
      where: { user_id: user.id },
      select: { book_id: true },
    })
  ).map((m) => m.book_id);

  const accessibleBookIds = [...new Set([...ownedBookIds, ...memberBookIds])];
  const bookFilter = bookId ? [bookId] : accessibleBookIds;

  const transactions = await prisma.transaction.findMany({
    where: {
      book_id: { in: bookFilter },
      ...(dateFilter ? { created_at: dateFilter } : {}),
    },
    select: { type: true, amount: true, created_at: true },
    orderBy: { created_at: "asc" },
  });

  // Group by date label
  const grouped: Record<string, { income: number; expense: number }> = {};

  for (const tx of transactions) {
    let label: string;
    if (period === "week" || period === "day") {
      label = tx.created_at.toISOString().slice(0, 10); // YYYY-MM-DD
    } else {
      label = tx.created_at.toISOString().slice(0, 7); // YYYY-MM
    }

    if (!grouped[label]) grouped[label] = { income: 0, expense: 0 };

    const amt = Number(tx.amount);
    if (tx.type === "IN") grouped[label].income += amt;
    else grouped[label].expense += amt;
  }

  const trend = Object.entries(grouped).map(([date, values]) => ({
    date,
    ...values,
  }));

  return { period, trend };
};

// ─── GET CATEGORY BREAKDOWN ───────────────────────────────────────────────────
// Returns top categories by spending for the user
const getCategoryBreakdown = async (
  user: TAuthUser,
  query: Record<string, any>,
) => {
  const period: string = (query.period as string) || "month";
  const bookId: string | undefined = query.book_id;
  const type: "IN" | "OUT" = (query.type as "IN" | "OUT") || "OUT";

  const dateFilter = resolveDateFilter(query);

  const ownedBookIds = (
    await prisma.book.findMany({
      where: { user_id: user.id },
      select: { id: true },
    })
  ).map((b) => b.id);

  const memberBookIds = (
    await prisma.bookMember.findMany({
      where: { user_id: user.id },
      select: { book_id: true },
    })
  ).map((m) => m.book_id);

  const accessibleBookIds = [...new Set([...ownedBookIds, ...memberBookIds])];
  const bookFilter = bookId ? [bookId] : accessibleBookIds;

  const transactions = await prisma.transaction.findMany({
    where: {
      book_id: { in: bookFilter },
      type,
      ...(dateFilter ? { created_at: dateFilter } : {}),
    },
    select: {
      amount: true,
      category: { select: { id: true, title: true, icon: true, color: true } },
    },
  });

  const categoryMap: Record<
    string,
    {
      id: string;
      title: string;
      icon: string | null;
      color: string | null;
      total: number;
    }
  > = {};

  let uncategorizedTotal = 0;

  for (const tx of transactions) {
    const amt = Number(tx.amount);
    if (!tx.category) {
      uncategorizedTotal += amt;
      continue;
    }
    const key = tx.category.id;
    if (!categoryMap[key]) {
      categoryMap[key] = { ...tx.category, total: 0 };
    }
    categoryMap[key].total += amt;
  }

  const categories = Object.values(categoryMap).sort(
    (a, b) => b.total - a.total,
  );

  if (uncategorizedTotal > 0) {
    categories.push({
      id: "uncategorized",
      title: "Uncategorized",
      icon: null,
      color: null,
      total: uncategorizedTotal,
    });
  }

  return { period, type, categories };
};

// ─── GET LOAN SUMMARY ─────────────────────────────────────────────────────────
const getLoanSummary = async (user: TAuthUser) => {
  const loans = await prisma.loan.findMany({
    where: { user_id: user.id },
    select: { type: true, amount: true, paid_amount: true, status: true },
  });

  let totalGiven = 0;
  let totalTaken = 0;
  let totalPaidGiven = 0;
  let totalPaidTaken = 0;
  let ongoingCount = 0;
  let overdueCount = 0;
  let paidCount = 0;

  for (const loan of loans) {
    const amt = Number(loan.amount);
    const paid = Number(loan.paid_amount);

    if (loan.type === "GIVEN") {
      totalGiven += amt;
      totalPaidGiven += paid;
    } else {
      totalTaken += amt;
      totalPaidTaken += paid;
    }

    if (loan.status === "ONGOING") ongoingCount++;
    else if (loan.status === "OVERDUE") overdueCount++;
    else paidCount++;
  }

  return {
    given: {
      total: totalGiven,
      paid: totalPaidGiven,
      remaining: totalGiven - totalPaidGiven,
    },
    taken: {
      total: totalTaken,
      paid: totalPaidTaken,
      remaining: totalTaken - totalPaidTaken,
    },
    status_breakdown: {
      ongoing: ongoingCount,
      overdue: overdueCount,
      paid: paidCount,
    },
  };
};

// ─── GET GOAL SUMMARY ─────────────────────────────────────────────────────────
const getGoalSummary = async (user: TAuthUser) => {
  const goals = await prisma.goal.findMany({
    where: { user_id: user.id },
    include: {
      transactions: {
        select: { type: true, amount: true },
      },
    },
  });

  const result = goals.map((goal) => {
    let saved = 0;
    for (const tx of goal.transactions) {
      const amt = Number(tx.amount);
      if (tx.type === "IN") saved += amt;
      else saved -= amt;
    }
    const progress =
      Number(goal.target_amount) > 0
        ? Math.min((saved / Number(goal.target_amount)) * 100, 100)
        : 0;

    return {
      id: goal.id,
      name: goal.name,
      target_amount: Number(goal.target_amount),
      saved_amount: saved,
      remaining_amount: Math.max(Number(goal.target_amount) - saved, 0),
      progress_percentage: Math.round(progress * 100) / 100,
    };
  });

  const totalTargetAmount = result.reduce((s, g) => s + g.target_amount, 0);
  const totalSavedAmount = result.reduce((s, g) => s + g.saved_amount, 0);

  return {
    total_goals: goals.length,
    total_target_amount: totalTargetAmount,
    total_saved_amount: totalSavedAmount,
    goals: result,
  };
};

export const StatisticsServices = {
  getBookOverview,
  getTransactionTrend,
  getCategoryBreakdown,
  getLoanSummary,
  getGoalSummary,
};
