import { useState, useRef, useEffect } from 'react';
import { parseExpenseInput, getToday, formatAmount } from '@/lib/expenses';
import { CheckCircle } from 'lucide-react';

interface ExpenseInputProps {
  onAdd: (data: { label: string; amount: number; memo: string; category: string; date: string }) => void;
}

export default function ExpenseInput({ onAdd }: ExpenseInputProps) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseExpenseInput(input);
    if (!parsed) return;

    onAdd({ ...parsed, date: getToday() });
    setFeedback(`${parsed.category} · ${formatAmount(parsed.amount)}원 기록됨`);
    setInput('');
    setTimeout(() => setFeedback(null), 2000);
  };

  const parsed = parseExpenseInput(input);

  return (
    <div className="px-5 pt-2 pb-4">
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
