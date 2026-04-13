import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCouple } from '@/features/auth/hooks/useCouple';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { CoupleSetup } from '@/features/auth/components/CoupleSetup';
import { acceptInvitation } from '@/features/auth/api/couple.api';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { profile, couple, loading: coupleLoading, refresh } = useCouple(user);
  const [processingInvite, setProcessingInvite] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // URL 또는 sessionStorage에서 초대 토큰 읽기
  const urlParams = new URLSearchParams(window.location.search);
  const urlInviteToken = urlParams.get('invite')
    ?? sessionStorage.getItem('pending_invite_token')
    ?? undefined;

  // 로그인 후 자동으로 초대 수락
  useEffect(() => {
    if (!user || coupleLoading) return;
    if (profile?.couple_id) return; // 이미 커플 있음
    if (!urlInviteToken) return;

    setProcessingInvite(true);
    acceptInvitation(urlInviteToken, user.id)
      .then(() => {
        // 토큰 정리
        sessionStorage.removeItem('pending_invite_token');
        const url = new URL(window.location.href);
        url.searchParams.delete('invite');
        window.history.replaceState({}, '', url.toString());
        return refresh();
      })
      .catch((e: Error) => {
        setInviteError(e.message);
      })
      .finally(() => setProcessingInvite(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, coupleLoading, profile?.couple_id]);

  // 로딩 중
  if (authLoading || processingInvite || (user && coupleLoading)) {
    return (
      <LoadingScreen
        message={processingInvite ? '커플 계정에 연결 중...' : undefined}
      />
    );
  }

  // 로그인 안 됨 → 로그인 페이지
  if (!user) {
    return <LoginPage inviteToken={urlInviteToken} />;
  }

  // 초대 처리 오류
  if (inviteError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-2xl">😢</p>
        <p className="text-destructive font-medium text-center">{inviteError}</p>
        <button
          onClick={() => { setInviteError(''); refresh(); }}
          className="text-sm underline text-muted-foreground"
        >
          확인하고 계속
        </button>
      </div>
    );
  }

  // 커플 미설정 → 커플 셋업
  if (!couple) {
    return <CoupleSetup user={user} couple={couple} onComplete={refresh} />;
  }

  // 정상: 메인 앱 렌더
  return <>{children}</>;
}

function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="text-4xl">💰</div>
      <p className="text-muted-foreground text-sm animate-pulse">
        {message ?? '불러오는 중...'}
      </p>
    </div>
  );
}
