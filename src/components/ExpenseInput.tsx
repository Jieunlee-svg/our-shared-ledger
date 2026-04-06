import { useState, useRef, useEffect } from 'react';
import { parseExpenseInput, getToday, formatAmount, formatDateLabel } from '@/lib/expenses';
import { CheckCircle, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ExpenseInputProps {
  onAdd: (data: { label: string; amount: number; memo: string; category: string; date: string }) => void;
}

export default function ExpenseInput({ onAdd }: ExpenseInputProps) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = dateStr === getToday();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseExpenseInput(input);
    if (!parsed) return;

    onAdd({ ...parsed, date: dateStr });
    const dateLabel = isToday ? '오늘' : formatDateLabel(dateStr);
    setFeedback(`${dateLabel} · ${parsed.category} · ${formatAmount(parsed.amount)}원 기록됨`);
    setInput('');
    setTimeout(() => setFeedback(null), 2000);
  };

  const parsed = parseExpenseInput(input);

  return (
    <div className="px-5 pt-2 pb-4">
      {/* Date selector */}
      <div className="mb-3 flex items-center gap-2">
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
            오늘로 돌아가기
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder='예: 점심 12000 김치찌개'
          className="w-full rounded-2xl bg-card px-5 py-4 text-base text-card-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
        />
        {parsed && (
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            기록
          </button>
        )}
      </form>

      {/* Preview */}
      {parsed && !feedback && (
        <div className="mt-3 flex items-center gap-2 px-2 text-sm text-muted-foreground">
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {parsed.category}
          </span>
          <span className="font-medium text-foreground">{parsed.label}</span>
          <span className="ml-auto amount-display text-foreground">{formatAmount(parsed.amount)}원</span>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="mt-3 flex items-center gap-2 px-2 text-sm text-accent animate-in fade-in">
          <CheckCircle className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}
