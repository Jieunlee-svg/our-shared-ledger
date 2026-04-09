import { useState } from 'react';
import { Receipt, BarChart3, PenLine, LogOut, RefreshCw } from 'lucide-react';
import { useExpenses } from '@/features/expenses/hooks/useExpenses';
import { useMigration } from '@/features/expenses/hooks/useMigration';
import { getToday, getMonthKey, getMonthExpenses } from '@/features/expenses/utils/expense.utils';
import ExpenseInput from '@/features/expenses/components/ExpenseInput';
import ExpenseList from '@/features/expenses/components/ExpenseList';
import MonthlyReport from '@/features/reports/components/MonthlyReport';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCouple } from '@/features/auth/hooks/useCouple';
import { signOut } from '@/features/auth/api/auth.api';
import { createNewInvite } from '@/features/auth/api/couple.api';
import { cn } from '@/lib/utils';

type Tab = 'input' | 'list' | 'report';

const TABS = [
  { key: 'input' as Tab, icon: PenLine, label: '기록' },
  { key: 'list' as Tab, icon: Receipt, label: '내역' },
  { key: 'report' as Tab, icon: BarChart3, label: '리포트' },
];

export default function Home() {
  useMigration();
  const { user } = useAuth();
  const { profile, couple, partner, refresh } = useCouple(user);
  const { expenses, add, remove, updateCategory, update } = useExpenses(couple?.id ?? null);
  const [tab, setTab] = useState<Tab>('input');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);

  const today = getToday();
  const currentMonth = getMonthKey(today);
  const monthExpenses = getMonthExpenses(expenses, currentMonth);

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  const handleShowInvite = async () => {
    if (!user || !couple) return;
    const token = await createNewInvite(user.id, couple.id);
    const url = `${window.location.origin}/?invite=${token}`;
    setInviteUrl(url);
    setShowInvite(true);
  };

  const handleCopyInvite = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2500);
  };

  const myName = profile?.display_name ?? '나';
  const partnerName = partner?.display_name ?? '배우자';
  const hasPartner = !!couple?.user2_id;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <header className="px-5 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">가계쀼 💰</h1>
          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="로그아웃"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        {/* 커플 상태 표시 */}
        <div className="flex items-center gap-2 mt-2">
          {hasPartner ? (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{myName}</span>
              <span>💕</span>
              <span className="font-medium text-foreground">{partnerName}</span>
            </div>
          ) : (
            <button
              onClick={handleShowInvite}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              배우자 초대하기
            </button>
          )}
        </div>

        {/* 초대 링크 팝업 */}
        {showInvite && inviteUrl && (
          <div className="mt-3 bg-muted rounded-2xl p-4 flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">초대 링크 (7일 유효)</p>
            <p className="text-xs break-all text-foreground">{inviteUrl}</p>
            <div className="flex gap-2">
              <button
                onClick={handleCopyInvite}
                className={cn(
                  'flex-1 rounded-xl py-2 text-sm font-medium transition-colors',
                  inviteCopied ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground',
                )}
              >
                {inviteCopied ? '✓ 복사됨!' : '링크 복사'}
              </button>
              <button
                onClick={() => setShowInvite(false)}
                className="px-3 rounded-xl border border-border text-sm text-muted-foreground"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-auto">
        {tab === 'input' && (
          <>
            <ExpenseInput onAdd={add} />
            <div className="px-5 pt-2">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">최근 기록</h2>
            </div>
            <ExpenseList
              expenses={expenses.slice(0, 10)}
              onDelete={remove}
              onUpdateCategory={updateCategory}
              onUpdate={update}
            />
          </>
        )}
        {tab === 'list' && (
          <>
            <div className="px-5 pt-2 pb-2">
              <h2 className="text-sm font-medium text-muted-foreground">전체 내역</h2>
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
      </main>

      <BottomNav tabs={TABS} activeTab={tab} onTabChange={setTab} />
    </div>
  );
}
