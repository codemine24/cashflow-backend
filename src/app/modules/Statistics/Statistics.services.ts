import { prisma } from "../../shared/prisma";
import { TAuthUser } from "../../interfaces/common";
import { dateFilterResolver } from "../../utils/date-filter-resolver";

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
  const dateFilter = dateFilterResolver(query);
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

// ─── GET CATEGORY BREAKDOWN ───────────────────────────────────────────────────
// Returns top categories by spending for the user
const getCategoryBreakdown = async (
  user: TAuthUser,
  query: Record<string, any>,
) => {
  const period: string = (query.period as string) || "month";
  const bookId: string | undefined = query.book_id;
  const type: "IN" | "OUT" = (query.type as "IN" | "OUT") || "OUT";

  const dateFilter = dateFilterResolver(query);

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

// ─── GET GOAL OVERVIEW ────────────────────────────────────────────────────────
const getGoalOverview = async (user: TAuthUser, query: Record<string, any>) => {
  const dateFilter = dateFilterResolver(query);
  const createdAtFilter = dateFilter ? { created_at: dateFilter } : {};

  // --- Own goals ---
  const ownedGoals = await prisma.goal.findMany({
    where: { user_id: user.id },
    select: { id: true, target_amount: true },
  });
  const ownedGoalIds = ownedGoals.map((g) => g.id);
  const ownedGoalsTargetAmount = ownedGoals.reduce(
    (acc, g) => acc + Number(g.target_amount),
    0,
  );

  // --- Shared goals (member of but NOT owner) ---
  const memberEntries = await prisma.goalMember.findMany({
    where: {
      user_id: user.id,
      goal_id: { notIn: ownedGoalIds },
    },
    select: { goal_id: true },
  });
  const sharedGoalIds = [...new Set(memberEntries.map((m) => m.goal_id))];

  const sharedGoals =
    sharedGoalIds.length > 0
      ? await prisma.goal.findMany({
          where: { id: { in: sharedGoalIds } },
          select: { target_amount: true },
        })
      : [];
  const sharedGoalsTargetAmount = sharedGoals.reduce(
    (acc, g) => acc + Number(g.target_amount),
    0,
  );

  // Fetch transactions for own and shared goals in one parallel call
  const [ownTransactions, sharedTransactions] = await Promise.all([
    ownedGoalIds.length > 0
      ? prisma.goalTransaction.findMany({
          where: {
            goal_id: { in: ownedGoalIds },
            ...createdAtFilter,
          },
          select: { type: true, amount: true },
        })
      : Promise.resolve([]),
    sharedGoalIds.length > 0
      ? prisma.goalTransaction.findMany({
          where: {
            goal_id: { in: sharedGoalIds },
            ...createdAtFilter,
          },
          select: { type: true, amount: true },
        })
      : Promise.resolve([]),
  ]);

  let ownSaved = 0;
  for (const tx of ownTransactions) {
    const amt = Number(tx.amount);
    if (tx.type === "IN") ownSaved += amt;
    else ownSaved -= amt;
  }

  let sharedSaved = 0;
  for (const tx of sharedTransactions) {
    const amt = Number(tx.amount);
    if (tx.type === "IN") sharedSaved += amt;
    else sharedSaved -= amt;
  }

  return {
    own_goals: {
      total: ownedGoalIds.length,
      total_target: ownedGoalsTargetAmount,
      total_saved: ownSaved,
      remaining: Math.max(ownedGoalsTargetAmount - ownSaved, 0),
    },
    shared_goals: {
      total: sharedGoalIds.length,
      total_target: sharedGoalsTargetAmount,
      total_saved: sharedSaved,
      remaining: Math.max(sharedGoalsTargetAmount - sharedSaved, 0),
    },
  };
};

// ─── GET DASHBOARD STATISTICS ────────────────────────────────────────────────
const getDashboardStatistics = async (
  user: TAuthUser,
  query: Record<string, any>,
) => {
  const bookId: string | undefined = query.book_id;
  const dateFilter = dateFilterResolver(query);

  // Determine accessible books
  const ownedBooks = (
    await prisma.book.findMany({
      where: { user_id: user.id },
      select: { id: true },
    })
  ).map((b) => b.id);

  const memberBooks = (
    await prisma.bookMember.findMany({
      where: { user_id: user.id },
      select: { book_id: true },
    })
  ).map((m) => m.book_id);

  const accessibleBookIds = [...new Set([...ownedBooks, ...memberBooks])];
  const bookFilter = bookId ? [bookId] : accessibleBookIds;

  // Fetch transactions
  const transactions = await prisma.transaction.findMany({
    where: {
      book_id: { in: bookFilter },
      ...(dateFilter ? { created_at: dateFilter } : {}),
    },
    select: {
      amount: true,
      type: true,
      created_at: true,
      category: { select: { title: true, color: true } },
      remark: true,
    },
    orderBy: { created_at: "asc" },
  });

  // Calculate Income vs Expense
  let totalIncome = 0;
  let totalExpense = 0;
  for (const tx of transactions) {
    const amt = Number(tx.amount);
    if (tx.type === "IN") totalIncome += amt;
    else totalExpense += amt;
  }

  // Category Spending (OUT)
  const categoryMap: Record<string, { total: number; color: string | null }> =
    {};
  for (const tx of transactions) {
    if (tx.type === "OUT") {
      const catName = tx.category?.title || "Uncategorized";
      if (!categoryMap[catName]) {
        categoryMap[catName] = { total: 0, color: tx.category?.color || null };
      }
      categoryMap[catName].total += Number(tx.amount);
    }
  }

  const categorySpending = Object.entries(categoryMap)
    .map(([category, data]) => ({
      category,
      amount: data.total,
      percentage: totalExpense > 0 ? (data.total / totalExpense) * 100 : 0,
      color: data.color,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Top Sources (IN)
  const sourceMap: Record<string, number> = {};
  for (const tx of transactions) {
    if (tx.type === "IN") {
      const source = tx.remark || tx.category?.title || "Other";
      sourceMap[source] = (sourceMap[source] || 0) + Number(tx.amount);
    }
  }

  const topSources = Object.entries(sourceMap)
    .map(([source, amount]) => ({ source, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  // Net Balance Trend
  const trendMap: Record<string, number> = {};
  let runningBalance = 0;

  for (const tx of transactions) {
    const amt = Number(tx.amount);
    if (tx.type === "IN") runningBalance += amt;
    else runningBalance -= amt;

    const dateKey = tx.created_at.toISOString().split("T")[0];
    trendMap[dateKey] = runningBalance;
  }

  const balanceTrend = Object.entries(trendMap).map(([date, balance]) => ({
    date,
    balance,
  }));

  return {
    balance_trend: balanceTrend,
    income_vs_expense: {
      income: totalIncome,
      expense: totalExpense,
    },
    category_spending: categorySpending,
    top_sources: topSources,
  };
};

export const StatisticsServices = {
  getBookOverview,
  getCategoryBreakdown,
  getLoanSummary,
  getGoalSummary,
  getGoalOverview,
  getDashboardStatistics,
};
