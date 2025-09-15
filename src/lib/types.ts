export interface Transaction {
  Date: string;
  Description: string;
  Amount: number;
}

export type Category = 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Entertainment' | 'Health' | 'Misc';

export interface CategorizedTransaction extends Transaction {
  Category: Category;
}

export interface Anomaly {
  transactionIndex: number;
  isAnomalous: boolean;
  reason: string;
}

export interface AnnotatedTransaction extends CategorizedTransaction {
  isAnomalous: boolean;
  anomalyReason?: string;
}

export interface SavingsTip {
  tip: string;
  estimatedSavings: number;
}

export interface DashboardData {
  transactions: AnnotatedTransaction[];
  savingsTips: SavingsTip[];
  stats: {
    totalSpent: number;
    categoryTotals: { [key in Category]?: number };
    dailySpending: { date: string, amount: number }[];
  };
}
