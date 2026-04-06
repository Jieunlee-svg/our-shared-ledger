import { type Expense, formatAmount, getMonthExpenses, groupByCategory, getMonthKey } from '@/lib/expenses';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

interface MonthlyReportProps {
  expenses: Expense[];
}

const COLORS = [
  'hsl(12, 76%, 61%)',
  'hsl(200, 65%, 55%)',
  'hsl(45, 85%, 55%)',
  'hsl(160, 45%, 45%)',
  'hsl(280, 55%, 55%)',
  'hsl(330, 65%, 60%)',
  'hsl(90, 50%, 50%)',
  'hsl(20, 70%, 50%)',
];

const CATEGORY_EMOJI: Record<string, string> = {
  '식비': '🍚', '카페': '☕', '마트/장보기': '🛒', '교통': '🚕',
  '쇼핑': '🛍️', '의료': '🏥', '문화/여가': '🎬', '생활': '🏠',
  '경조사': '💐', '기타': '📝',
};

export default function MonthlyReport({ expenses }: MonthlyReportProps) {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const yearMonth = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
  const prevYearMonth = (() => {
    const d = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  })();

  const monthLabel = `${targetDate.getFullYear()}년 ${targetDate.getMonth() + 1}월`;

  const monthData = getMonthExpenses(expenses, yearMonth);
  const prevMonthData = getMonthExpenses(expenses, prevYearMonth);

  const totalThis = monthData.reduce((s, e) => s + e.amount, 0);
  const totalPrev = prevMonthData.reduce((s, e) => s + e.amount, 0);
  const diff = totalThis - totalPrev;
  const diffPercent = totalPrev > 0 ? Math.round((diff / totalPrev) * 100) : 0;

  const categoryTotals = groupByCategory(monthData);
  const chartData = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  const avgDaily = monthData.length > 0
    ? Math.round(totalThis / new Set(monthData.map(e => e.date)).size)
    : 0;

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
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl bg-card p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">총 지출</p>
          <p className="text-xl amount-display text-card-foreground">{formatAmount(totalThis)}원</p>
        </div>
        <div className="rounded-2xl bg-card p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">일 평균</p>
          <p className="text-xl amount-display text-card-foreground">{formatAmount(avgDaily)}원</p>
        </div>
      </div>

      {/* Month-over-Month */}
      <div className="rounded-2xl bg-card p-4 border border-border shadow-sm mb-6">
        <p className="text-xs text-muted-foreground mb-2">전월 대비</p>
        {totalPrev > 0 ? (
          <div className="flex items-center gap-2">
            {diff > 0 ? (
              <TrendingUp className="h-5 w-5 text-destructive" />
            ) : (
              <TrendingDown className="h-5 w-5 text-accent" />
            )}
            <span className={`text-lg font-bold ${diff > 0 ? 'text-destructive' : 'text-accent'}`}>
              {diff > 0 ? '+' : ''}{formatAmount(diff)}원
            </span>
            <span className="text-sm text-muted-foreground">
              ({diff > 0 ? '+' : ''}{diffPercent}%)
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">이전 달 데이터가 없어요</p>
        )}
      </div>

      {/* Pie Chart */}
      {chartData.length > 0 ? (
        <div className="rounded-2xl bg-card p-4 border border-border shadow-sm mb-6">
          <p className="text-xs text-muted-foreground mb-4">카테고리별 지출</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${formatAmount(value)}원`, '']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-2 mt-4">
            {chartData.map((item, i) => {
              const pct = Math.round((item.value / totalThis) * 100);
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-sm text-card-foreground flex-1">
                    {CATEGORY_EMOJI[item.name] || '📝'} {item.name}
                  </span>
                  <span className="text-sm text-muted-foreground">{pct}%</span>
                  <span className="text-sm font-medium text-card-foreground">{formatAmount(item.value)}원</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>이번 달 데이터가 없어요 📊</p>
        </div>
      )}

      {/* Insights */}
      {chartData.length > 0 && (
        <div className="rounded-2xl bg-card p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground mb-3">💡 인사이트</p>
          <div className="space-y-2 text-sm text-card-foreground">
            <p>
              가장 많이 쓴 카테고리는 <strong>{CATEGORY_EMOJI[chartData[0].name]} {chartData[0].name}</strong>이에요.
              총 {formatAmount(chartData[0].value)}원으로 전체의 {Math.round((chartData[0].value / totalThis) * 100)}%를 차지해요.
            </p>
            {monthData.length >= 5 && (
              <p>
                이번 달 총 <strong>{monthData.length}건</strong>을 기록했어요.
                하루 평균 {formatAmount(avgDaily)}원씩 지출하고 있어요.
              </p>
            )}
            {diff > 0 && totalPrev > 0 && (
              <p className="text-destructive">
                지난달보다 {formatAmount(diff)}원 더 쓰고 있어요. 지출을 줄여볼까요? 💪
              </p>
            )}
            {diff < 0 && totalPrev > 0 && (
              <p className="text-accent">
                지난달보다 {formatAmount(Math.abs(diff))}원 절약했어요! 잘하고 있어요 🎉
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
