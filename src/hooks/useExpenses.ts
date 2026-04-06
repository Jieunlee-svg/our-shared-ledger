import { useState, useCallback } from 'react';
import { loadExpenses, addExpense, deleteExpense, type Expense } from '@/lib/expenses';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());

  const refresh = useCallback(() => {
    setExpenses(loadExpenses());
  }, []);

  const add = useCallback((data: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExp = addExpense(data);
    setExpenses(prev => [newExp, ...prev]);
    return newExp;
  }, []);

  const remove = useCallback((id: string) => {
    deleteExpense(id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  return { expenses, add, remove, refresh };
}
