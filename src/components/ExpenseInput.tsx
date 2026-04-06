import { useState, useRef, useEffect } from 'react';
import { parseExpenseInput, getToday, formatAmount, formatDateLabel } from '@/lib/expenses';
import { CheckCircle, CalendarIcon, Minus, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { TransactionType } from '@/lib/expenses';

interface ExpenseInputProps {
  onAdd: (data: { label: string; amount: number; memo: string; category: string; date: string; type: TransactionType }) => void;
}

export default function ExpenseInput({ onAdd }: ExpenseInputProps) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [mode, setMode] = useState<TransactionType>('expense');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateStr === getToday();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseExpenseInput(mode === 'income' ? `+${input}` : input);
    if (!parsed) return;

    onAdd({ ...parsed, date: dateStr, type: mode });
    const dateLabel = isToday ? '오늘' : formatDateLabel(dateStr);
    const typeLabel = mode === 'income' ? '수입' : '지출';
    setFeedback(`${dateLabel} · ${parsed.category} · ${formatAmount(parsed.amount)}원 ${typeLabel} 기록됨`);
    setInput('');
    setTimeout(() => setFeedback(null), 2000);
  };

  // Parse without + prefix since mode toggle handles it
  const rawParsed = parseExpenseInput(mode === 'income' ? `+${input}` : input);

  return (
    <div className="px-5 pt-2 pb-4">
      {/* Mode toggle + Date selector */}
      <div className="mb-3 flex items-center gap-2">
        {/* Income/Expense toggle */}
        <div className="flex rounded-xl border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setMode('expense')}
            className={cn(
              "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors",
              mode === 'expense' ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
            )}
          >
            <Minus className="h-3.5 w-3.5" />
            지출
          </button>
          <button
            type="button"
            onClick={() => setMode('income')}
            className={cn(
              "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors",
              mode === 'income' ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground"
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
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-border transition-colors",
                isToday ? "bg-secondary text-secondary-foreground" : "bg-primary/10 text-primary font-medium"
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
              className={cn("p-3 pointer-events-auto")}
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
            "w-full rounded-2xl px-5 py-4 text-base placeholder:text-muted-foreground border focus:outline-none focus:ring-2 shadow-sm bg-card text-card-foreground",
            mode === 'income' ? "border-accent/30 focus:ring-accent/40" : "border-border focus:ring-ring"
          )}
        />
        {rawParsed && (
          <button
            type="submit"
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-4 py-2 text-sm font-medium",
              mode === 'income' ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
            )}
          >
            기록
          </button>
        )}
      </form>

      {/* Preview */}
      {rawParsed && !feedback && (
        <div className="mt-3 flex items-center gap-2 px-2 text-sm text-muted-foreground">
          <span className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            mode === 'income' ? "bg-accent/10 text-accent" : "bg-secondary text-secondary-foreground"
          )}>
            {rawParsed.category}
          </span>
          <span className="font-medium text-foreground">{rawParsed.label}</span>
          <span className={cn(
            "ml-auto amount-display whitespace-nowrap",
            mode === 'income' ? "text-accent" : "text-foreground"
          )}>
            {mode === 'income' ? '+' : ''}{formatAmount(rawParsed.amount)}원
          </span>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={cn(
          "mt-3 flex items-center gap-2 px-2 text-sm animate-in fade-in",
          mode === 'income' ? "text-accent" : "text-accent"
        )}>
          <CheckCircle className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}
