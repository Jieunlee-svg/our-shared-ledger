import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchExpenses, createExpense, removeExpense, updateExpenseCategory } from '../api/expenses.api';
import type { Expense } from '../types/expense.types';

const QUERY_KEY = ['expenses'] as const;

export function useExpenses() {
  const queryClient = useQueryClient();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchExpenses,
  });

  const addMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: (newExpense) => {
      queryClient.setQueryData<Expense[]>(QUERY_KEY, prev => [newExpense, ...(prev ?? [])]);
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeExpense,
    onSuccess: (id) => {
      queryClient.setQueryData<Expense[]>(QUERY_KEY, prev => prev?.filter(e => e.id !== id) ?? []);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, category }: { id: string; category: string }) =>
      updateExpenseCategory(id, category),
    onSuccess: (updated) => {
      queryClient.setQueryData<Expense[]>(QUERY_KEY, prev =>
        prev?.map(e => e.id === updated.id ? updated : e) ?? []
      );
    },
  });

  return {
    expenses,
    isLoading,
    add: (data: Omit<Expense, 'id' | 'createdAt'>) => addMutation.mutate(data),
    remove: (id: string) => removeMutation.mutate(id),
    updateCategory: (id: string, category: string) => updateCategoryMutation.mutate({ id, category }),
  };
}
