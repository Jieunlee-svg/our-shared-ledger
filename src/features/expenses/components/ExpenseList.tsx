import { formatAmount, formatDateLabel, groupByDate } from '../utils/expense.utils';
import ExpenseItem from './ExpenseItem';
import type { Expense } from '../types/expense.types';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  onUpdate: (id: string, fields: Partial<Pick<Expense, 'label' | 'amount' | 'category' | 'date' | 'type'>>) => Promise<void>;
}

export default function ExpenseList({ expenses, onDelete, onUpdateCategory, onUpdate }: ExpenseListProps) {
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
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onDelete={onDelete}
                  onUpdateCategory={onUpdateCategory}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
