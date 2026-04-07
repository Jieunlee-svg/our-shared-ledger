import { useState, useRef, useEffect } from 'react';
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
  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const customInputRef = useRef<HTMLInputElement>(null);

  // "직접 입력" 상태로 열리면 텍스트 입력창에 자동 포커스
  useEffect(() => {
    if (open && value === '직접 입력') {
      setTimeout(() => customInputRef.current?.focus(), 50);
    }
  }, [open, value]);

  const handleSelect = (cat: string) => {
    onChange(cat);
    setOpen(false);
  };

  const handleCustomSubmit = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setCustomInput('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80',
            type === 'income'
              ? 'bg-accent/10 text-accent'
              : 'bg-secondary text-secondary-foreground',
            value === '직접 입력' && 'border border-dashed border-muted-foreground/50',
            className,
          )}
        >
          {CATEGORY_EMOJI[value] ?? '📝'} {value}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        {/* 직접 입력 섹션 */}
        <div className="mb-2">
          <p className="text-xs text-muted-foreground mb-1.5 px-1">직접 입력</p>
          <div className="flex gap-1">
            <input
              ref={customInputRef}
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustomSubmit()}
              placeholder="카테고리 이름 입력"
              className="flex-1 text-xs rounded-lg px-2 py-1.5 border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="button"
              onClick={handleCustomSubmit}
              disabled={!customInput.trim()}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
            >
              확인
            </button>
          </div>
        </div>

        <div className="border-t border-border pt-2">
          <p className="text-xs text-muted-foreground mb-1.5 px-1">카테고리 선택</p>
          <div className="grid grid-cols-1 gap-0.5 max-h-48 overflow-y-auto">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => handleSelect(cat)}
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
        </div>
      </PopoverContent>
    </Popover>
  );
}
