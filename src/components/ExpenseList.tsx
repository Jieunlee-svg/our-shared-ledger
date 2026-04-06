import { type Expense, formatAmount, formatDateLabel, groupByDate } from '@/lib/expenses';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  '식비': '🍚', '카페': '☕', '마트/장보기': '🛒', '교통': '🚕',
  '쇼핑': '🛍️', '의료': '🏥', '문화/여가': '🎬', '생활': '🏠',
  '경조사': '💐', '기타': '📝',
  '급여': '💰', '부수입': '💵', '투자': '📈', '환급': '🔄', '기타수입': '💸',
};

export default function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const groups = groupByDate(expenses);
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg">아직 기록이 없어요</p>
        <p className="text-sm mt-1">위에서 지출/수입을 입력해보세요 ✨</p>
      </div>
    );
  }

  return (
    <div className="px-5 pb-24">
      {sortedDates.map(date => {
        const items = groups[date];
        const dayIncome = items.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
        const dayExpense = items.filter(e => e.type !== 'income').reduce((s, e) => s + e.amount, 0);
        return (
          <div key={date} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">{formatDateLabel(date)}</h3>
              <div className="flex items-center gap-2 text-sm">
                {dayIncome > 0 && <span className="font-semibold text-accent">+{formatAmount(dayIncome)}</span>}
                {dayExpense > 0 && <span className="font-semibold text-foreground">-{formatAmount(dayExpense)}</span>}
              </div>
            </div>
            <div className="space-y-2">
              {items.map(expense => (
                <div
                  key={expense.id}
                  className="group flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm border border-border"
                >
                  <span className="text-xl">{CATEGORY_EMOJI[expense.category] || '📝'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground truncate">{expense.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {expense.category}
                      {expense.memo && ` · ${expense.memo}`}
                    </p>
                  </div>
                  <span className={cn(
                    "amount-display whitespace-nowrap",
                    expense.type === 'income' ? "text-accent" : "text-card-foreground"
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
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
