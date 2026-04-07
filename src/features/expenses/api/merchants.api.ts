import { supabase } from '@/lib/supabase/client';

export async function lookupMerchant(name: string): Promise<string | null> {
  const { data } = await supabase
    .from('merchants')
    .select('category')
    .eq('name', name.toLowerCase())
    .maybeSingle();
  return data?.category ?? null;
}

export async function upsertMerchant(name: string, category: string): Promise<void> {
  await supabase
    .from('merchants')
    .upsert({ name: name.toLowerCase(), category }, { onConflict: 'name' });
}
