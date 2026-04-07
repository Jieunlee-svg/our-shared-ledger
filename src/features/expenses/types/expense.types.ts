export type TransactionType = 'expense' | 'income';

export interface Expense {
  id: string;
  amount: number;
  label: string;
  category: string;
  memo: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  createdAt: number;
}

export interface ParsedExpense {
  label: string;
  amount: number;
  memo: string;
  category: string;
  type: TransactionType;
}
