import { useState } from 'react';
import { signInWithKakao } from '../api/auth.api';

interface LoginPageProps {
  /** URL에 초대 토큰이 있을 때 전달됨 */
  inviteToken?: string;
}

export function LoginPage({ inviteToken }: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // 현재 URL(초대 토큰 포함)을 로그인 후 돌아올 주소로 사용
      await signInWithKakao(window.location.href);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full flex flex-col items-center gap-8">

        {/* 앱 소개 */}
        <div className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <h1 className="text-3xl font-bold text-foreground">가계쀼</h1>
          <p className="text-muted-foreground mt-2">부부가 함께 쓰는 가계부</p>
        </div>

        {/* 초대받은 경우 안내 */}
        {inviteToken && (
          <div className="w-full bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-primary">💌 초대를 받으셨군요!</p>
            <p className="text-xs text-muted-foreground mt-1">
              로그인하면 배우자의 계정에 자동으로 연결돼요
            </p>
          </div>
        )}

        {/* 카카오 로그인 버튼 */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-base font-bold transition-opacity disabled:opacity-60"
          style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
        >
          <KakaoIcon />
          {loading ? '연결 중...' : '카카오로 시작하기'}
        </button>

        {error && <p className="text-destructive text-sm text-center">{error}</p>}

        <p className="text-xs text-muted-foreground text-center">
          가입 없이 카카오 계정으로 바로 시작해요
        </p>
      </div>
    </div>
  );
}

function KakaoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 2C6.03 2 2 5.358 2 9.5c0 2.618 1.66 4.918 4.19 6.273L5.18 19.18c-.09.31.217.558.497.387l4.716-3.09c.197.016.397.023.607.023 4.97 0 9-3.358 9-7.5S15.97 2 11 2z"
        fill="#3C1E1E"
      />
    </svg>
  );
}
