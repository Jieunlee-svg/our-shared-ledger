import { CATEGORY_EMOJI } from '@/constants/categories';
import { formatAmount } from '../utils/expense.utils';
import { useMerchants } from '../hooks/useMerchants';
import { CategoryPicker } from './CategoryPicker';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Expense } from '../types/expense.types';

interface ExpenseItemProps {
  expense: Expense;
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
}

export default function ExpenseItem({ expense, onDelete, onUpdateCategory }: ExpenseItemProps) {
  const { save } = useMerchants();

  const handleCategoryChange = async (category: string) => {
    await save(expense.label, category);
    onUpdateCategory(expense.id, category);
  };

  return (
    <div className="group flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm border border-border">
      <span className="text-xl">{CATEGORY_EMOJI[expense.category] ?? '📝'}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-card-foreground truncate">{expense.label}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <CategoryPicker
            value={expense.category}
            type={expense.type}
            onChange={handleCategoryChange}
          />
          {expense.memo && (
            <span className="text-xs text-muted-foreground">· {expense.memo}</span>
          )}
        </div>
      </div>
      <span className={cn(
        'amount-display whitespace-nowrap',
        expense.type === 'income' ? 'text-accent' : 'text-card-foreground',
      )}>
        {expense.type === 'income' ? '+' : '-'}{formatAmount(expense.amount)}원
      </span>
      <button
        onClick={() => onDelete(expense.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive ml-1"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
