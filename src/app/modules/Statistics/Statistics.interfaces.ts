export type StatsPeriod = "weekly" | "monthly" | "yearly" | "all";

export interface IBalanceTrend {
  date: string;
  balance: number;
}

export interface ICategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string | null;
}

export interface ITopSource {
  source: string;
  amount: number;
}

export interface IDashboardStatsResponse {
  balance_trend: IBalanceTrend[];
  income_vs_expense: {
    income: number;
    expense: number;
  };
  category_spending: ICategorySpending[];
  top_sources: ITopSource[];
}
