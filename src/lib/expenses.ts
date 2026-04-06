export type TransactionType = 'expense' | 'income';

export interface Expense {
  id: string;
  amount: number;
  label: string;
  category: string;
  memo: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  createdAt: number;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  '식비': ['점심', '저녁', '아침', '밥', '식사', '배달', '치킨', '피자', '햄버거', '국밥', '찌개', '라면', '분식', '김밥', '떡볶이', '족발', '삼겹살', '고기', '초밥', '회'],
  '카페': ['커피', '카페', '스타벅스', '투썸', '이디야', '메가커피', '빽다방', '컴포즈', '음료', '아메리카노', '라떼'],
  '마트/장보기': ['마트', '이마트', '홈플러스', '코스트코', '장보기', '쿠팡', '식재료', '반찬', '편의점', 'GS', 'CU', '세븐'],
  '교통': ['택시', '버스', '지하철', '교통', '주유', '기름', '톨게이트', '주차', '카카오택시'],
  '쇼핑': ['옷', '신발', '쇼핑', '다이소', '무신사', '백화점', '아울렛', '의류'],
  '의료': ['병원', '약국', '약', '의료', '치과', '안과', '피부과', '한의원', '진료'],
  '문화/여가': ['영화', '넷플릭스', '구독', '게임', '헬스', '운동', '요가', '필라테스', '여행', '숙소', '호텔'],
  '생활': ['관리비', '전기', '수도', '가스', '인터넷', '통신', '핸드폰', '세탁', '청소'],
  '경조사': ['축의금', '부의금', '선물', '생일', '기념일', '화환'],
};

const INCOME_KEYWORDS: Record<string, string[]> = {
  '급여': ['월급', '급여', '봉급', '연봉', '상여금', '보너스', '성과급'],
  '부수입': ['부수입', '알바', '아르바이트', '프리랜서', '외주', '용돈'],
  '투자': ['배당', '이자', '투자수익', '주식', '펀드', '수익금'],
  '환급': ['환급', '캐시백', '리워드', '포인트', '환불'],
  '기타수입': [],
};

export function detectCategory(text: string, type: TransactionType): string {
  const lower = text.toLowerCase();
  const keywords = type === 'income' ? INCOME_KEYWORDS : CATEGORY_KEYWORDS;
  for (const [category, kws] of Object.entries(keywords)) {
    if (kws.some(kw => lower.includes(kw))) return category;
  }
  return type === 'income' ? '기타수입' : '기타';
}

export function parseExpenseInput(input: string): { label: string; amount: number; memo: string; category: string; type: TransactionType } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Check for + prefix → income
  const isIncome = trimmed.startsWith('+');
  const cleaned = isIncome ? trimmed.slice(1).trim() : trimmed;

  const match = cleaned.match(/^(.+?)\s+(\d[\d,]*)\s*(.*)$/);
  if (!match) return null;

  const label = match[1].trim();
  const amount = parseInt(match[2].replace(/,/g, ''), 10);
  const memo = match[3]?.trim() || '';

  if (isNaN(amount) || amount <= 0) return null;

  const type: TransactionType = isIncome ? 'income' : 'expense';
  const category = detectCategory(label + ' ' + memo, type);
  return { label, amount, memo, category, type };
}

const STORAGE_KEY = 'household-expenses';

export function loadExpenses(): Expense[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data) as Expense[];
    // Migrate old data without type
    return parsed.map(e => ({ ...e, type: e.type || 'expense' }));
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export function addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Expense {
  const newExpense: Expense = {
    ...expense,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  const expenses = loadExpenses();
  expenses.unshift(newExpense);
  saveExpenses(expenses);
  return newExpense;
}

export function deleteExpense(id: string) {
  const expenses = loadExpenses().filter(e => e.id !== id);
  saveExpenses(expenses);
}

export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getMonthKey(date: string): string {
  return date.slice(0, 7);
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString('ko-KR');
}

export function getMonthExpenses(expenses: Expense[], yearMonth: string): Expense[] {
  return expenses.filter(e => e.date.startsWith(yearMonth));
}

export function groupByDate(expenses: Expense[]): Record<string, Expense[]> {
  const groups: Record<string, Expense[]> = {};
  for (const e of expenses) {
    if (!groups[e.date]) groups[e.date] = [];
    groups[e.date].push(e);
  }
  return groups;
}

export function groupByCategory(expenses: Expense[]): Record<string, number> {
  const groups: Record<string, number> = {};
  for (const e of expenses) {
    groups[e.category] = (groups[e.category] || 0) + e.amount;
  }
  return groups;
}

export function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

/** Net total: income - expense */
export function calcNetTotal(expenses: Expense[]): number {
  return expenses.reduce((s, e) => e.type === 'income' ? s + e.amount : s - e.amount, 0);
}
