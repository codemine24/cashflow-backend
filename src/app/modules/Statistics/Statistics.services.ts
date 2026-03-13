import { prisma } from "../../shared/prisma";
import { TAuthUser } from "../../interfaces/common";
import { StatsPeriod } from "./Statistics.interfaces";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDateRange = (period: StatsPeriod): Date | null => {
  const now = new Date();
  if (period === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (period === "month") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    return d;
  }
  if (period === "year") {
    const d = new Date(now);
    d.setFullYear(d.getFullYear() - 1);
    return d;
  }
  return null; // "all"
};

const buildDateFilter = (from: Date | null) =>
  from ? { gte: from } : undefined;

// ─── GET OVERVIEW ─────────────────────────────────────────────────────────────
// Returns total income, total expense, net balance and book count for the user
const getOverview = async (
  user: TAuthUser,
  query: Record<string, any>,
) => {
  const period: StatsPeriod = (query.period as StatsPeriod) || "all";
  const bookId: string | undefined = query.book_id;

  const from = getDateRange(period);
  const dateFilter = buildDateFilter(from);

  // Resolve which book IDs belong to the user (owned or member)
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

  const bookFilter = bookId
    ? [bookId]
    : accessibleBookIds;

  const [totalBookCount, transactions] = await Promise.all([
    prisma.book.count({ where: { user_id: user.id } }),
    prisma.transaction.findMany({
      where: {
        book_id: { in: bookFilter },
        ...(dateFilter ? { created_at: dateFilter } : {}),
      },
      select: { type: true, amount: true },
    }),
  ]);

  let totalIncome = 0;
  let totalExpense = 0;

  for (const tx of transactions) {
    const amt = Number(tx.amount);
    if (tx.type === "IN") totalIncome += amt;
    else totalExpense += amt;
  }

  return {
    total_books: totalBookCount,
    total_income: totalIncome,
    total_expense: totalExpense,
    net_balance: totalIncome - totalExpense,
    period,
  };
};

// ─── GET TRANSACTION TREND ────────────────────────────────────────────────────
// Returns grouped income/expense by day (week), month (year), or month (month)
const getTransactionTrend = async (
  user: TAuthUser,
  query: Record<string, any>,
) => {
  const period: StatsPeriod = (query.period as StatsPeriod) || "month";
  const bookId: string | undefined = query.book_id;

  const from = getDateRange(period === "all" ? "year" : period);

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
      ...(from ? { created_at: { gte: from } } : {}),
    },
    select: { type: true, amount: true, created_at: true },
    orderBy: { created_at: "asc" },
  });

  // Group by date label
  const grouped: Record<string, { income: number; expense: number }> = {};

  for (const tx of transactions) {
    let label: string;
    if (period === "week") {
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
  const period: StatsPeriod = (query.period as StatsPeriod) || "month";
  const bookId: string | undefined = query.book_id;
  const type: "IN" | "OUT" = (query.type as "IN" | "OUT") || "OUT";

  const from = getDateRange(period);
  const dateFilter = buildDateFilter(from);

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
    { id: string; title: string; icon: string | null; color: string | null; total: number }
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
    const progress = Number(goal.target_amount) > 0
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
  getOverview,
  getTransactionTrend,
  getCategoryBreakdown,
  getLoanSummary,
  getGoalSummary,
};
