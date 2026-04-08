import { supabase } from '@/lib/supabase/client';
import type { Expense, TransactionType } from '../types/expense.types';

function rowToExpense(row: Record<string, unknown>): Expense {
  return {
    id: row.id as string,
    amount: row.amount as number,
    label: row.label as string,
    category: row.category as string,
    memo: row.memo as string,
    date: row.date as string,
    type: row.type as TransactionType,
    createdAt: new Date(row.created_at as string).getTime(),
  };
}

export async function fetchExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(rowToExpense);
}

export async function createExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      amount: expense.amount,
      label: expense.label,
      category: expense.category,
      memo: expense.memo,
      date: expense.date,
      type: expense.type,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToExpense(data);
}

export async function removeExpense(id: string): Promise<string> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
  return id;
}

export async function updateExpenseCategory(id: string, category: string): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .update({ category })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToExpense(data);
}

export async function updateExpense(
  id: string,
  fields: Partial<Pick<Expense, 'label' | 'amount' | 'category' | 'date' | 'type'>>
): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return rowToExpense(data);
}

// localStorage → Supabase 일회성 마이그레이션
// Supabase에 데이터가 없을 때만 실행됨
const LS_KEY = 'household-expenses';

export async function migrateFromLocalStorage(): Promise<number> {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return 0;

  const local = JSON.parse(raw) as Expense[];
  if (local.length === 0) return 0;

  const { count } = await supabase
    .from('expenses')
    .select('*', { count: 'exact', head: true });

  if ((count ?? 0) > 0) {
    // 이미 Supabase에 데이터 있음 → 로컬만 정리
    localStorage.removeItem(LS_KEY);
    return 0;
  }

  const rows = local.map(e => ({
    id: e.id,
    amount: e.amount,
    label: e.label,
    category: e.category,
    memo: e.memo ?? '',
    date: e.date,
    type: e.type ?? 'expense',
  }));

  const { error } = await supabase.from('expenses').insert(rows);
  if (error) throw error;

  localStorage.removeItem(LS_KEY);
  return local.length;
}
