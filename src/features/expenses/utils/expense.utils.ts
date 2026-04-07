import { CATEGORY_KEYWORDS, INCOME_KEYWORDS } from '@/constants/categories';
import type { Expense, TransactionType, ParsedExpense } from '../types/expense.types';

export function detectCategory(text: string, type: TransactionType): string {
  const lower = text.toLowerCase();
  const keywords = type === 'income' ? INCOME_KEYWORDS : CATEGORY_KEYWORDS;
  for (const [category, kws] of Object.entries(keywords)) {
    if (kws.some(kw => lower.includes(kw))) return category;
  }
  return type === 'income' ? '기타수입' : '직접 입력';
}

export function parseExpenseInput(input: string): ParsedExpense | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const isIncome = trimmed.startsWith('+');
  const cleaned = isIncome ? trimmed.slice(1).trim() : trimmed;

  const match = cleaned.match(/^(.+?)\s+(\d[\d,]*)\s*(.*)$/);
  if (!match) return null;

  const label = match[1].trim();
  const amount = parseInt(match[2].replace(/,/g, ''), 10);
  const memo = match[3]?.trim() || '';

  if (isNaN(amount) || amount <= 0) return null;

  const type: TransactionType = isIncome ? 'income' : 'expense';
  const category = detectCategory(label + ' ' + memo, type);
  return { label, amount, memo, category, type };
}

export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getMonthKey(date: string): string {
  return date.slice(0, 7);
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString('ko-KR');
}

export function getMonthExpenses(expenses: Expense[], yearMonth: string): Expense[] {
  return expenses.filter(e => e.date.startsWith(yearMonth));
}

export function groupByDate(expenses: Expense[]): Record<string, Expense[]> {
  const groups: Record<string, Expense[]> = {};
  for (const e of expenses) {
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  }
  return groups;
}

export function groupByCategory(expenses: Expense[]): Record<string, number> {
  const groups: Record<string, number> = {};
  for (const e of expenses) {
    groups[e.category] = (groups[e.category] || 0) + e.amount;
  }
  return groups;
}

export function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export function calcNetTotal(expenses: Expense[]): number {
  return expenses.reduce((s, e) => e.type === 'income' ? s + e.amount : s - e.amount, 0);
}
