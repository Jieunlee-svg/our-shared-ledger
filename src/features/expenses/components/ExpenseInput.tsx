import { useState, useRef, useEffect } from 'react';
import { parseExpenseInput, getToday, formatAmount, formatDateLabel } from '../utils/expense.utils';
import { useMerchants } from '../hooks/useMerchants';
import { CategoryPicker } from './CategoryPicker';
import { CheckCircle, CalendarIcon, Minus, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { TransactionType, Expense } from '../types/expense.types';

interface ExpenseInputProps {
  onAdd: (data: Omit<Expense, 'id' | 'createdAt'>) => void;
}

export default function ExpenseInput({ onAdd }: ExpenseInputProps) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mode, setMode] = useState<TransactionType>('expense');
  // category overridden by user or resolved from merchant DB
  const [categoryOverride, setCategoryOverride] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { lookup, save } = useMerchants();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Reset override when input changes
  useEffect(() => {
    setCategoryOverride(null);
  }, [input, mode]);

  // Async merchant DB lookup: runs when parsed label is available
  useEffect(() => {
    const rawParsed = parseExpenseInput(mode === 'income' ? `+${input}` : input);
    if (!rawParsed) return;

    let cancelled = false;
    lookup(rawParsed.label).then(saved => {
      if (!cancelled && saved) setCategoryOverride(saved);
    });
    return () => { cancelled = true; };
  }, [input, mode, lookup]);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateStr === getToday();
  const rawParsed = parseExpenseInput(mode === 'income' ? `+${input}` : input);
  const resolvedCategory = categoryOverride ?? rawParsed?.category ?? null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawParsed || !resolvedCategory) return;

    // 유저가 카테고리를 변경했거나 DB에 없던 가맹점이면 저장
    const wasOverridden = categoryOverride !== null;
    const keywordCategory = rawParsed.category;
    if (wasOverridden || resolvedCategory !== keywordCategory) {
      await save(rawParsed.label, resolvedCategory);
    }

    onAdd({ ...rawParsed, category: resolvedCategory, date: dateStr, type: mode });
    const dateLabel = isToday ? '오늘' : formatDateLabel(dateStr);
    const typeLabel = mode === 'income' ? '수입' : '지출';
    setFeedback(`${dateLabel} · ${resolvedCategory} · ${formatAmount(rawParsed.amount)}원 ${typeLabel} 기록됨`);
    setInput('');
    setCategoryOverride(null);
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <div className="px-5 pt-2 pb-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex rounded-xl border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setMode('expense')}
            className={cn(
              'flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors',
              mode === 'expense' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground',
            )}
          >
            <Minus className="h-3.5 w-3.5" />
            지출
          </button>
          <button
            type="button"
            onClick={() => setMode('income')}
            className={cn(
              'flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors',
              mode === 'income' ? 'bg-accent text-accent-foreground' : 'bg-card text-muted-foreground',
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            수입
          </button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-border transition-colors',
                isToday ? 'bg-secondary text-secondary-foreground' : 'bg-primary/10 text-primary font-medium',
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              {isToday ? '오늘' : formatDateLabel(dateStr)}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => d && setSelectedDate(d)}
              disabled={(d) => d > new Date()}
              initialFocus
              className={cn('p-3 pointer-events-auto')}
            />
          </PopoverContent>
        </Popover>

        {!isToday && (
          <button
            onClick={() => setSelectedDate(new Date())}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            오늘
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={mode === 'income' ? '예: 월급 3000000' : '예: 점심 12000 김치찌개'}
          className={cn(
            'w-full rounded-2xl px-5 py-4 text-base placeholder:text-muted-foreground border focus:outline-none focus:ring-2 shadow-sm bg-card text-card-foreground',
            mode === 'income' ? 'border-accent/30 focus:ring-accent/40' : 'border-border focus:ring-ring',
          )}
        />
        {rawParsed && resolvedCategory && (
          <button
            type="submit"
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-4 py-2 text-sm font-medium',
              mode === 'income' ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground',
            )}
          >
            기록
          </button>
        )}
      </form>

      {/* Preview — CategoryPicker로 카테고리 수정 가능 */}
      {rawParsed && resolvedCategory && !feedback && (
        <div className="mt-3 flex items-center gap-2 px-2 text-sm text-muted-foreground">
          <CategoryPicker
            value={resolvedCategory}
            type={mode}
            onChange={setCategoryOverride}
          />
          <span className="font-medium text-foreground">{rawParsed.label}</span>
          <span className={cn(
            'ml-auto amount-display whitespace-nowrap',
            mode === 'income' ? 'text-accent' : 'text-foreground',
          )}>
            {mode === 'income' ? '+' : ''}{formatAmount(rawParsed.amount)}원
          </span>
        </div>
      )}

      {feedback && (
        <div className="mt-3 flex items-center gap-2 px-2 text-sm text-accent animate-in fade-in">
          <CheckCircle className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}
