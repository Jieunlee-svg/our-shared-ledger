import { CATEGORY_EMOJI } from '@/constants/categories';
import { formatAmount } from '../utils/expense.utils';
import { useMerchants } from '../hooks/useMerchants';
import { CategoryPicker } from './CategoryPicker';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive ml-1">
            <Trash2 className="h-4 w-4" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{expense.label}</span>
              {' '}({formatAmount(expense.amount)}원) 내역이 영구 삭제돼요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(expense.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
