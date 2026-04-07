import { useCallback, useRef } from 'react';
import { lookupMerchant, upsertMerchant } from '../api/merchants.api';

/**
 * 가맹점 카테고리 DB 훅
 * - 인메모리 캐시로 동일 가맹점 중복 조회 방지
 * - lookup: 저장된 카테고리 반환 (없으면 null)
 * - save: 카테고리 저장/수정 (유저 보정 시 호출)
 */
export function useMerchants() {
  const cache = useRef<Map<string, string>>(new Map());

  const lookup = useCallback(async (name: string): Promise<string | null> => {
    const key = name.toLowerCase();
    if (cache.current.has(key)) return cache.current.get(key)!;
    const category = await lookupMerchant(key);
    if (category) cache.current.set(key, category);
    return category;
  }, []);

  const save = useCallback(async (name: string, category: string): Promise<void> => {
    const key = name.toLowerCase();
    cache.current.set(key, category);
    await upsertMerchant(key, category);
  }, []);

  return { lookup, save };
}
