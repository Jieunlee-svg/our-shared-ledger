import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createCouple, createNewInvite, acceptInvitation } from '../api/couple.api';
import type { Couple } from '../api/couple.api';
import { cn } from '@/lib/utils';

interface CoupleSetupProps {
  user: User;
  couple: Couple | null;
  onComplete: () => void;
}

type Mode = 'choose' | 'invite' | 'join';

export function CoupleSetup({ user, couple, onComplete }: CoupleSetupProps) {
  const [mode, setMode] = useState<Mode>(couple ? 'invite' : 'choose');
  const [inviteUrl, setInviteUrl] = useState('');
  const [joinToken, setJoinToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const makeInviteUrl = (token: string) => `${window.location.origin}/?invite=${token}`;

  const handleCreateCouple = async () => {
    setLoading(true);
    setError('');
    try {
      const { token } = await createCouple(user.id);
      setInviteUrl(makeInviteUrl(token));
      setMode('invite');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshInvite = async () => {
    if (!couple) return;
    setLoading(true);
    setError('');
    try {
      const token = await createNewInvite(user.id, couple.id);
      setInviteUrl(makeInviteUrl(token));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoin = async () => {
    // 전체 URL을 붙여넣어도 토큰만 추출
    const raw = joinToken.trim();
    const token = raw.includes('invite=') ? raw.split('invite=')[1].split('&')[0] : raw;
    if (!token) { setError('초대 코드를 입력해주세요'); return; }

    setLoading(true);
    setError('');
    try {
      await acceptInvitation(token, user.id);
      onComplete();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // ── 초대 링크 화면 ──
  if (mode === 'invite') {
    const url = inviteUrl || (couple ? '' : '');
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full flex flex-col gap-6">
          <div className="text-center">
            <div className="text-5xl mb-3">💌</div>
            <h2 className="text-2xl font-bold">배우자를 초대하세요</h2>
            <p className="text-muted-foreground text-sm mt-1">
              아래 링크를 카카오톡으로 전송하세요
            </p>
          </div>

          {url ? (
            <>
              <div className="bg-muted rounded-2xl p-4">
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">초대 링크</p>
                <p className="text-sm break-all text-foreground leading-relaxed">{url}</p>
              </div>

              <button
                onClick={handleCopy}
                className={cn(
                  'w-full rounded-2xl py-4 font-bold text-base transition-colors',
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-primary text-primary-foreground',
                )}
              >
                {copied ? '✓ 복사됐어요!' : '링크 복사하기'}
              </button>

              <p className="text-xs text-center text-muted-foreground">
                링크는 7일간 유효해요 ·{' '}
                <button
                  onClick={handleRefreshInvite}
                  disabled={loading}
                  className="underline"
                >
                  새 링크 발급
                </button>
              </p>
            </>
          ) : (
            <button
              onClick={handleRefreshInvite}
              disabled={loading}
              className="w-full rounded-2xl bg-primary text-primary-foreground py-4 font-bold disabled:opacity-60"
            >
              {loading ? '생성 중...' : '초대 링크 만들기'}
            </button>
          )}

          {error && <p className="text-destructive text-sm text-center">{error}</p>}

          <button
            onClick={onComplete}
            className="text-sm text-muted-foreground underline text-center"
          >
            나중에 초대하기 → 혼자 먼저 시작
          </button>
        </div>
      </div>
    );
  }

  // ── 초대 코드 입력 화면 ──
  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full flex flex-col gap-5">
          <div className="text-center">
            <div className="text-5xl mb-3">🔗</div>
            <h2 className="text-2xl font-bold">초대 링크로 참여</h2>
            <p className="text-muted-foreground text-sm mt-1">
              배우자에게 받은 초대 링크 또는 코드를 붙여넣으세요
            </p>
          </div>

          <input
            type="text"
            value={joinToken}
            onChange={e => { setJoinToken(e.target.value); setError(''); }}
            placeholder="https://... 또는 코드 붙여넣기"
            className="w-full rounded-2xl px-4 py-4 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={loading || !joinToken.trim()}
            className="w-full rounded-2xl bg-primary text-primary-foreground py-4 font-bold disabled:opacity-40"
          >
            {loading ? '참여 중...' : '커플 계정 참여하기 💕'}
          </button>

          <button
            onClick={() => setMode('choose')}
            className="text-sm text-muted-foreground text-center"
          >
            ← 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ── 선택 화면 ──
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full flex flex-col gap-6">
        <div className="text-center">
          <div className="text-5xl mb-3">💕</div>
          <h2 className="text-2xl font-bold">커플 계정 설정</h2>
          <p className="text-muted-foreground text-sm mt-1">
            배우자와 함께 가계부를 관리해요
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleCreateCouple}
            disabled={loading}
            className="w-full rounded-2xl bg-primary text-primary-foreground py-4 font-bold disabled:opacity-60"
          >
            {loading ? '만드는 중...' : '✨ 새 커플 계정 만들기'}
          </button>
          <p className="text-xs text-center text-muted-foreground -mt-1">
            먼저 가입하고 배우자에게 초대 링크를 보내요
          </p>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">또는</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={() => setMode('join')}
            className="w-full rounded-2xl border-2 border-border py-4 font-bold text-foreground hover:bg-muted transition-colors"
          >
            💌 초대 링크로 참여하기
          </button>
          <p className="text-xs text-center text-muted-foreground -mt-1">
            배우자에게 초대 링크를 받은 경우
          </p>
        </div>

        {error && <p className="text-destructive text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}
