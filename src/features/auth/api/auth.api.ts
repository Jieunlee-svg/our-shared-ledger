import { supabase } from '@/lib/supabase/client';

/** 카카오 OAuth 로그인 — 로그인 후 redirectTo로 돌아옴 */
export async function signInWithKakao(redirectTo?: string) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: redirectTo ?? window.location.origin + '/',
      scopes: 'profile_nickname profile_image', // 이메일 제외 (비즈앱 인증 불필요)
    },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
