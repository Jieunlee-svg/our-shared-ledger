import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { migrateFromLocalStorage } from '../api/expenses.api';
import { toast } from 'sonner';

// 앱 시작 시 1회만 실행: localStorage 데이터를 Supabase로 이전
export function useMigration() {
  const queryClient = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const run = async () => {
      try {
        const count = await migrateFromLocalStorage();
        if (count > 0) {
          await queryClient.invalidateQueries({ queryKey: ['expenses'] });
          toast.success(`기존 데이터 ${count}건을 불러왔어요 ✨`);
        }
      } catch {
        toast.error('데이터 이전 중 오류가 발생했어요. 다시 시도해주세요.');
      }
    };

    run();
  }, [queryClient]);
}
