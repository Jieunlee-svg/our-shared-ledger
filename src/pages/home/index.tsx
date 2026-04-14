import { useState } from 'react';
import { BarChart3, PenLine, Settings } from 'lucide-react';
import { useExpenses } from '@/features/expenses/hooks/useExpenses';
import { useMigration } from '@/features/expenses/hooks/useMigration';
import { getToday, getMonthKey, getMonthExpenses } from '@/features/expenses/utils/expense.utils';
import ExpenseInput from '@/features/expenses/components/ExpenseInput';
import ExpenseList from '@/features/expenses/components/ExpenseList';
import MonthlyReport from '@/features/reports/components/MonthlyReport';
import SettingsPage from '@/features/settings/components/SettingsPage';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCouple } from '@/features/auth/hooks/useCouple';

type Tab = 'record' | 'report' | 'settings';

const TABS = [
  { key: 'record' as Tab, icon: PenLine, label: '기록' },
  { key: 'report' as Tab, icon: BarChart3, label: '리포트' },
  { key: 'settings' as Tab, icon: Settings, label: '설정' },
];

export default function Home() {
  useMigration();
  const { user } = useAuth();
  const { profile, couple, partner } = useCouple(user);
  const { expenses, add, remove, updateCategory, update } = useExpenses(couple?.id ?? null);
  const [tab, setTab] = useState<Tab>('record');

  const today = getToday();
  const currentMonth = getMonthKey(today);
  const monthExpenses = getMonthExpenses(expenses, currentMonth);

  const myName = profile?.display_name ?? '나';
  const partnerName = partner?.display_name ?? '배우자';
  const hasPartner = !!couple?.user2_id;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <header className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">가계쀼 💰</h1>
        </div>
        <div className="mt-2">
          {hasPartner ? (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{myName}</span>
              <span>💕</span>
              <span className="font-medium text-foreground">{partnerName}</span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">설정에서 배우자를 초대해보세요</p>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {tab === 'record' && (
          <>
            <ExpenseInput onAdd={add} />
            <div className="px-5 pt-2 pb-2">
              <h2 className="text-sm font-medium text-muted-foreground">이번 달 내역</h2>
            </div>
            <ExpenseList
              expenses={monthExpenses}
              onDelete={remove}
              onUpdateCategory={updateCategory}
              onUpdate={update}
            />
          </>
        )}
        {tab === 'report' && <MonthlyReport expenses={expenses} />}
        {tab === 'settings' && user && (
          <SettingsPage
            user={user}
            profile={profile}
            couple={couple}
            partner={partner}
          />
        )}
      </main>

      <BottomNav tabs={TABS} activeTab={tab} onTabChange={setTab} />
    </div>
  );
}
