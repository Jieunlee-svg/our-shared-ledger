import { useState } from 'react';
import { ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import { CATEGORY_EMOJI, EXPENSE_CATEGORIES } from '@/constants/categories';
import { formatAmount, getMonthExpenses, groupByCategory } from '@/features/expenses/utils/expense.utils';
import type { Expense } from '@/features/expenses/types/expense.types';

interface MonthlyReportProps {
  expenses: Expense[];
}

export default function MonthlyReport({ expenses }: MonthlyReportProps) {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const yearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = `${targetDate.getFullYear()}년 ${targetDate.getMonth() + 1}월`;

  const monthData = getMonthExpenses(expenses, yearMonth);
  const expenseItems = monthData.filter(e => e.type !== 'income');
  const incomeItems = monthData.filter(e => e.type === 'income');
  const totalExpense = expenseItems.reduce((s, e) => s + e.amount, 0);
  const totalIncome = incomeItems.reduce((s, e) => s + e.amount, 0);
  const netTotal = totalIncome - totalExpense;

  // 실제 지출이 있는 카테고리
  const categoryTotals = groupByCategory(expenseItems);

  // 전체 카테고리 목록 (0원 포함) — 금액 큰 순 정렬, 0원은 뒤로
  const allCategories = EXPENSE_CATEGORIES.map(cat => ({
    name: cat,
    value: categoryTotals[cat] ?? 0,
  })).sort((a, b) => b.value - a.value);

  // 직접 입력 카테고리 (EXPENSE_CATEGORIES에 없는 것)
  const customCategories = Object.entries(categoryTotals)
    .filter(([cat]) => !EXPENSE_CATEGORIES.includes(cat))
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const categoryList = [...customCategories, ...allCategories];

  // 수입 카테고리
  const incomeCategoryTotals = groupByCategory(incomeItems);
  const incomeChartData = Object.entries(incomeCategoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const hasData = expenseItems.length > 0 || incomeItems.length > 0;

  return (
    <div className="px-5 pb-24">
      {/* Month Navigator */}
      <div className="flex items-center justify-center gap-4 py-4">
        <button onClick={() => setMonthOffset(o => o - 1)} className="p-2 rounded-full hover:bg-secondary">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">{monthLabel}</h2>
        <button
          onClick={() => setMonthOffset(o => o + 1)}
          disabled={monthOffset >= 0}
          className="p-2 rounded-full hover:bg-secondary disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="rounded-2xl bg-card p-3 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">수입</p>
          <p className="text-base amount-display text-accent">+{formatAmount(totalIncome)}</p>
        </div>
        <div className="rounded-2xl bg-card p-3 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">지출</p>
          <p className="text-base amount-display text-card-foreground">-{formatAmount(totalExpense)}</p>
        </div>
        <div className="rounded-2xl bg-card p-3 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">잔액</p>
          <p className={`text-base amount-display ${netTotal >= 0 ? 'text-accent' : 'text-destructive'}`}>
            {netTotal >= 0 ? '+' : ''}{formatAmount(netTotal)}
          </p>
        </div>
      </div>

      {!hasData && (
        <div className="text-center py-12 text-muted-foreground">
          <p>이번 달 데이터가 없어요 📊</p>
        </div>
      )}

      {/* 카테고리별 지출 리스트 */}
      {hasData && (
        <div className="rounded-2xl bg-card p-4 border border-border shadow-sm mb-6">
          <p className="text-xs text-muted-foreground mb-3">카테고리별 지출</p>
          <div className="space-y-2">
            {categoryList.map(item => {
              const pct = totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0;
              const isEmpty = item.value === 0;
              return (
                <div
                  key={item.name}
                  className={`flex items-center gap-3 ${isEmpty ? 'opacity-35' : ''}`}
                >
                  <span className="text-base w-6 text-center flex-shrink-0">
                    {CATEGORY_EMOJI[item.name] ?? '📝'}
                  </span>
                  <span className="text-sm text-card-foreground flex-1">{item.name}</span>
                  <span className="text-xs text-muted-foreground w-8 text-right">
                    {isEmpty ? '-' : `${pct}%`}
                  </span>
                  <span className={`text-sm font-medium w-24 text-right ${isEmpty ? 'text-muted-foreground' : 'text-card-foreground'}`}>
                    {formatAmount(item.value)}원
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 수입 내역 */}
      {incomeChartData.length > 0 && (
        <div className="rounded-2xl bg-card p-4 border border-border shadow-sm mb-6">
          <p className="text-xs text-muted-foreground mb-3">
            <Wallet className="inline h-3.5 w-3.5 mr-1" />수입 내역
          </p>
          <div className="space-y-2">
            {incomeChartData.map(item => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="text-base w-6 text-center">{CATEGORY_EMOJI[item.name] ?? '💸'}</span>
                <span className="text-sm text-card-foreground flex-1">{item.name}</span>
                <span className="text-sm font-medium text-accent">+{formatAmount(item.value)}원</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 인사이트 */}
      {hasData && (
        <div className="rounded-2xl bg-card p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground mb-3">💡 인사이트</p>
          <div className="space-y-2 text-sm text-card-foreground">
            {totalExpense > 0 && categoryList[0]?.value > 0 && (
              <p>
                가장 많이 쓴 카테고리는 <strong>{CATEGORY_EMOJI[categoryList[0].name] ?? '📝'} {categoryList[0].name}</strong>이에요.
                총 {formatAmount(categoryList[0].value)}원으로 전체의 {Math.round((categoryList[0].value / totalExpense) * 100)}%를 차지해요.
              </p>
            )}
            {totalIncome > 0 && totalExpense > 0 && (
              <p>
                저축률은 <strong>{Math.round(((totalIncome - totalExpense) / totalIncome) * 100)}%</strong>예요.
                {netTotal > 0 ? ' 잘 모으고 있어요! 🎉' : ' 수입보다 지출이 많아요. 조절해볼까요? 💪'}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
