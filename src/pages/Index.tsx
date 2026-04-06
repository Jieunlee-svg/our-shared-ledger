import { useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { formatAmount, getToday, getMonthKey, getMonthExpenses } from '@/lib/expenses';
import ExpenseInput from '@/components/ExpenseInput';
import ExpenseList from '@/components/ExpenseList';
import MonthlyReport from '@/components/MonthlyReport';
import { Receipt, BarChart3, PenLine } from 'lucide-react';

type Tab = 'input' | 'list' | 'report';

const Index = () => {
  const { expenses, add, remove } = useExpenses();
  const [tab, setTab] = useState<Tab>('input');

  const today = getToday();
  const currentMonth = getMonthKey(today);
  const monthExpenses = getMonthExpenses(expenses, currentMonth);
  const todayExpenses = expenses.filter(e => e.date === today);

  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const todayTotal = todayExpenses.reduce((s, e) => s + e.amount, 0);

  const handleAdd = (data: { label: string; amount: number; memo: string; category: string; date: string }) => {
    add(data);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      {/* Header Summary */}
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">우리집 가계부 💰</h1>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 border border-border shadow-sm">
            <p className="text-xs text-muted-foreground">이번 달</p>
            <p className="text-xl amount-display text-card-foreground mt-1">{formatAmount(monthTotal)}<span className="text-sm font-normal">원</span></p>
          </div>
          <div className="rounded-2xl bg-card p-4 border border-border shadow-sm">
            <p className="text-xs text-muted-foreground">오늘</p>
            <p className="text-xl amount-display text-card-foreground mt-1">{formatAmount(todayTotal)}<span className="text-sm font-normal">원</span></p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {tab === 'input' && (
          <>
            <ExpenseInput onAdd={handleAdd} />
            <div className="px-5 pt-2">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">최근 기록</h2>
            </div>
            <ExpenseList expenses={expenses.slice(0, 10)} onDelete={remove} />
          </>
        )}
        {tab === 'list' && (
          <>
            <div className="px-5 pt-2 pb-2">
              <h2 className="text-sm font-medium text-muted-foreground">전체 내역</h2>
            </div>
            <ExpenseList expenses={monthExpenses} onDelete={remove} />
          </>
        )}
        {tab === 'report' && <MonthlyReport expenses={expenses} />}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-card border-t border-border px-6 py-3 flex justify-around items-center z-50">
        {([
          { key: 'input' as Tab, icon: PenLine, label: '기록' },
          { key: 'list' as Tab, icon: Receipt, label: '내역' },
          { key: 'report' as Tab, icon: BarChart3, label: '리포트' },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-col items-center gap-1 transition-colors ${tab === key ? 'tab-active' : 'tab-inactive'}`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Index;
