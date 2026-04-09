import { supabase } from '@/lib/supabase/client';

/** 카카오 OAuth 로그인 — 로그인 후 redirectTo로 돌아옴 */
export async function signInWithKakao(redirectTo?: string) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: redirectTo ?? window.location.origin + '/',
    },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
