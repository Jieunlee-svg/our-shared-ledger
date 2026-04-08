import { useState, useRef } from 'react';
import { CATEGORY_EMOJI } from '@/constants/categories';
import { formatAmount, formatDateLabel, getToday } from '../utils/expense.utils';
import { useMerchants } from '../hooks/useMerchants';
import { CategoryPicker } from './CategoryPicker';
import { Pencil, Trash2, CalendarIcon, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Expense, TransactionType } from '../types/expense.types';

interface ExpenseItemProps {
  expense: Expense;
  onDelete: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  onUpdate: (id: string, fields: Partial<Pick<Expense, 'label' | 'amount' | 'category' | 'date' | 'type'>>) => Promise<void>;
}

// 입력값 내 숫자에 자동으로 콤마 추가
function formatNumbersInText(text: string): string {
  const digits = text.replace(/,/g, '');
  if (!/^\d*$/.test(digits)) return text;
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('ko-KR');
}

export default function ExpenseItem({ expense, onDelete, onUpdateCategory, onUpdate }: ExpenseItemProps) {
  const { save } = useMerchants();
  const [editOpen, setEditOpen] = useState(false);

  // 편집 폼 상태
  const [editLabel, setEditLabel] = useState(expense.label);
  const [editAmount, setEditAmount] = useState(expense.amount.toLocaleString('ko-KR'));
  const [editCategory, setEditCategory] = useState(expense.category);
  const [editType, setEditType] = useState<TransactionType>(expense.type);
  const [editDate, setEditDate] = useState<Date>(new Date(expense.date + 'T00:00:00'));
  const [saving, setSaving] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const handleCategoryChange = async (category: string) => {
    await save(expense.label, category);
    onUpdateCategory(expense.id, category);
  };

  const openEdit = () => {
    // 열 때마다 현재 값으로 초기화
    setEditLabel(expense.label);
    setEditAmount(expense.amount.toLocaleString('ko-KR'));
    setEditCategory(expense.category);
    setEditType(expense.type);
    setEditDate(new Date(expense.date + 'T00:00:00'));
    setEditOpen(true);
  };

  const handleSave = async () => {
    const rawAmount = parseInt(editAmount.replace(/,/g, ''), 10);
    if (!editLabel.trim() || isNaN(rawAmount) || rawAmount <= 0) return;

    setSaving(true);
    try {
      await onUpdate(expense.id, {
        label: editLabel.trim(),
        amount: rawAmount,
        category: editCategory,
        date: format(editDate, 'yyyy-MM-dd'),
        type: editType,
      });
      // 카테고리 변경 시 merchant DB도 업데이트
      if (editCategory !== expense.category || editLabel.trim() !== expense.label) {
        await save(editLabel.trim(), editCategory);
      }
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const dateStr = format(editDate, 'yyyy-MM-dd');
  const isToday = dateStr === getToday();
  const isValid = editLabel.trim().length > 0 && parseInt(editAmount.replace(/,/g, ''), 10) > 0;

  return (
    <div className="group flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm border border-border">
      <span className="text-xl">{CATEGORY_EMOJI[expense.category] ?? '📝'}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-card-foreground truncate">{expense.label}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <CategoryPicker
            value={expense.category}
            type={expense.type}
            onChange={handleCategoryChange}
          />
        </div>
      </div>
      <span className={cn(
        'amount-display whitespace-nowrap',
        expense.type === 'income' ? 'text-accent' : 'text-card-foreground',
      )}>
        {expense.type === 'income' ? '+' : '-'}{formatAmount(expense.amount)}원
      </span>

      {/* 편집 아이콘 버튼 */}
      <button
        onClick={openEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary ml-1"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {/* 편집 다이얼로그 */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>내역 수정</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* 지출/수입 토글 */}
            <div className="flex rounded-xl border border-border overflow-hidden w-fit">
              <button
                type="button"
                onClick={() => { setEditType('expense'); setEditCategory('직접 입력'); }}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors',
                  editType === 'expense' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground',
                )}
              >
                <Minus className="h-3.5 w-3.5" />
                지출
              </button>
              <button
                type="button"
                onClick={() => { setEditType('income'); setEditCategory('기타수입'); }}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors',
                  editType === 'income' ? 'bg-accent text-accent-foreground' : 'bg-card text-muted-foreground',
                )}
              >
                <Plus className="h-3.5 w-3.5" />
                수입
              </button>
            </div>

            {/* 날짜 선택 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">날짜</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-3 py-2 text-sm border border-border transition-colors',
                      isToday ? 'bg-secondary text-secondary-foreground' : 'bg-primary/10 text-primary font-medium',
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {isToday ? '오늘' : formatDateLabel(dateStr)}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editDate}
                    onSelect={(d) => d && setEditDate(d)}
                    disabled={(d) => d > new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 항목명 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">항목명</label>
              <input
                type="text"
                value={editLabel}
                onChange={e => setEditLabel(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="항목명 입력"
              />
            </div>

            {/* 금액 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">금액</label>
              <div className="relative">
                <input
                  ref={amountInputRef}
                  type="text"
                  inputMode="numeric"
                  value={editAmount}
                  onChange={e => {
                    const el = e.target;
                    const selStart = el.selectionStart ?? el.value.length;
                    const nonCommasBefore = el.value.slice(0, selStart).replace(/,/g, '').length;
                    const formatted = formatNumbersInText(e.target.value);
                    setEditAmount(formatted);
                    requestAnimationFrame(() => {
                      if (!amountInputRef.current) return;
                      let count = 0;
                      let newPos = formatted.length;
                      for (let i = 0; i < formatted.length; i++) {
                        if (count === nonCommasBefore) { newPos = i; break; }
                        if (formatted[i] !== ',') count++;
                      }
                      amountInputRef.current.setSelectionRange(newPos, newPos);
                    });
                  }}
                  className="w-full rounded-xl px-3 py-2 pr-8 text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="금액 입력"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
              </div>
            </div>

            {/* 카테고리 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">카테고리</label>
              <CategoryPicker
                value={editCategory}
                type={editType}
                onChange={setEditCategory}
              />
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:justify-between">
            {/* 삭제 버튼 (왼쪽) */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors">
                  <Trash2 className="h-4 w-4" />
                  삭제
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    <span className="font-medium text-foreground">{expense.label}</span>
                    {' '}({formatAmount(expense.amount)}원) 내역이 영구 삭제돼요.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => { onDelete(expense.id); setEditOpen(false); }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* 저장 버튼 (오른쪽) */}
            <button
              onClick={handleSave}
              disabled={!isValid || saving}
              className={cn(
                'flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40',
                editType === 'income' ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground',
              )}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
