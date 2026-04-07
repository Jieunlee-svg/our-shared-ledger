import { useState } from 'react';
import { Receipt, BarChart3, PenLine } from 'lucide-react';
import { useExpenses } from '@/features/expenses/hooks/useExpenses';
import { useMigration } from '@/features/expenses/hooks/useMigration';
import { getToday, getMonthKey, getMonthExpenses } from '@/features/expenses/utils/expense.utils';
import ExpenseInput from '@/features/expenses/components/ExpenseInput';
import ExpenseList from '@/features/expenses/components/ExpenseList';
import MonthlyReport from '@/features/reports/components/MonthlyReport';
import { BottomNav } from '@/components/layout/BottomNav';

type Tab = 'input' | 'list' | 'report';

const TABS = [
  { key: 'input' as Tab, icon: PenLine, label: '기록' },
  { key: 'list' as Tab, icon: Receipt, label: '내역' },
  { key: 'report' as Tab, icon: BarChart3, label: '리포트' },
];

export default function Home() {
  useMigration();
  const { expenses, add, remove, updateCategory } = useExpenses();
  const [tab, setTab] = useState<Tab>('input');

  const today = getToday();
  const currentMonth = getMonthKey(today);
  const monthExpenses = getMonthExpenses(expenses, currentMonth);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <header className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-foreground">가계쀼 💰</h1>
      </header>

      <main className="flex-1 overflow-auto">
        {tab === 'input' && (
          <>
            <ExpenseInput onAdd={add} />
            <div className="px-5 pt-2">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">최근 기록</h2>
            </div>
            <ExpenseList expenses={expenses.slice(0, 10)} onDelete={remove} onUpdateCategory={updateCategory} />
          </>
        )}
        {tab === 'list' && (
          <>
            <div className="px-5 pt-2 pb-2">
              <h2 className="text-sm font-medium text-muted-foreground">전체 내역</h2>
            </div>
            <ExpenseList expenses={monthExpenses} onDelete={remove} onUpdateCategory={updateCategory} />
          </>
        )}
        {tab === 'report' && <MonthlyReport expenses={expenses} />}
      </main>

      <BottomNav tabs={TABS} activeTab={tab} onTabChange={setTab} />
    </div>
  );
}
