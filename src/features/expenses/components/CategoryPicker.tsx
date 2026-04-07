import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_EMOJI } from '@/constants/categories';
import { cn } from '@/lib/utils';
import type { TransactionType } from '../types/expense.types';

interface CategoryPickerProps {
  value: string;
  type: TransactionType;
  onChange: (category: string) => void;
  className?: string;
}

export function CategoryPicker({ value, type, onChange, className }: CategoryPickerProps) {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80',
            type === 'income'
              ? 'bg-accent/10 text-accent'
              : 'bg-secondary text-secondary-foreground',
            className,
          )}
        >
          {CATEGORY_EMOJI[value] ?? '📝'} {value}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <p className="text-xs text-muted-foreground mb-2 px-1">카테고리 선택</p>
        <div className="grid grid-cols-1 gap-0.5 max-h-60 overflow-y-auto">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => onChange(cat)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-left transition-colors hover:bg-secondary',
                cat === value && 'bg-secondary font-medium',
              )}
            >
              <span>{CATEGORY_EMOJI[cat] ?? '📝'}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
