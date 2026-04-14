import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Edit2 } from 'lucide-react';
import { createNewInvite } from '@/features/auth/api/couple.api';
import type { Couple, Profile } from '@/features/auth/api/couple.api';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_EMOJI } from '@/constants/categories';
import { signOut } from '@/features/auth/api/auth.api';
import { cn } from '@/lib/utils';

interface SettingsPageProps {
  user: User;
  profile: Profile | null;
  couple: Couple | null;
  partner: Profile | null;
}

type CategoryCustomization = { name: string; emoji: string };
type Customizations = Record<string, CategoryCustomization>;

function loadCustomizations(): Customizations {
  try {
    return JSON.parse(localStorage.getItem('category_customizations') ?? '{}');
  } catch {
    return {};
  }
}

export default function SettingsPage({ user, profile, couple, partner }: SettingsPageProps) {
  // 초대 코드
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);

  // 태그 편집
  const [customizations, setCustomizations] = useState<Customizations>(loadCustomizations);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editEmoji, setEditEmoji] = useState('');
  const [editName, setEditName] = useState('');

  const hasPartner = !!couple?.user2_id;

  const handleGenerateInvite = async () => {
    if (!user || !couple) return;
    setLoadingInvite(true);
    try {
      const token = await createNewInvite(user.id, couple.id);
      setInviteUrl(`${window.location.origin}/?invite=${token}`);
    } finally {
      setLoadingInvite(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const startEdit = (category: string) => {
    const custom = customizations[category];
    setEditingCategory(category);
    setEditEmoji(custom?.emoji ?? CATEGORY_EMOJI[category] ?? '📌');
    setEditName(custom?.name ?? category);
  };

  const saveEdit = () => {
    if (!editingCategory) return;
    const updated = {
      ...customizations,
      [editingCategory]: { emoji: editEmoji, name: editName },
    };
    setCustomizations(updated);
    localStorage.setItem('category_customizations', JSON.stringify(updated));
    setEditingCategory(null);
  };

  const kakaoName = profile?.display_name ?? user.user_metadata?.full_name ?? '—';
  const kakaoAvatar = profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined);

  const allCategories = [
    { label: '지출', items: EXPENSE_CATEGORIES },
    { label: '수입', items: INCOME_CATEGORIES },
  ];

  return (
    <div className="px-5 pb-24 pt-2 space-y-8">

      {/* ── 파트너 ── */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">파트너</h2>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          {hasPartner ? (
            <div className="flex items-center gap-3 pb-1">
              <span className="text-2xl">💕</span>
              <div>
                <p className="font-medium">{partner?.display_name ?? '배우자'}</p>
                <p className="text-xs text-muted-foreground">연결됨</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">아직 배우자와 연결되지 않았어요</p>
          )}

          <button
            onClick={handleGenerateInvite}
            disabled={loadingInvite || !couple}
            className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium disabled:opacity-50 transition-opacity"
          >
            {loadingInvite ? '생성 중...' : '초대 코드 생성'}
          </button>

          {inviteUrl && (
            <>
              <div className="bg-muted rounded-xl px-3 py-2.5">
                <p className="text-xs text-muted-foreground mb-1">초대 링크 (7일 유효)</p>
                <p className="text-xs break-all leading-relaxed">{inviteUrl}</p>
              </div>
              <button
                onClick={handleCopy}
                className={cn(
                  'w-full rounded-xl py-2.5 text-sm font-medium transition-colors',
                  copied ? 'bg-green-500 text-white' : 'bg-secondary text-secondary-foreground',
                )}
              >
                {copied ? '✓ 복사됐어요!' : '링크 복사하기'}
              </button>
            </>
          )}
        </div>
      </section>

      {/* ── 지출 태그 ── */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">지출 태그</h2>
        <div className="space-y-4">
          {allCategories.map(({ label, items }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground mb-2 px-1">{label}</p>
              <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                {items.map(category => {
                  const custom = customizations[category];
                  const emoji = custom?.emoji ?? CATEGORY_EMOJI[category] ?? '📌';
                  const name = custom?.name ?? category;
                  const isEditing = editingCategory === category;

                  return (
                    <div key={category} className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={editEmoji}
                            onChange={e => setEditEmoji(e.target.value)}
                            className="w-12 text-center rounded-lg border border-border bg-background py-1.5 text-base"
                            maxLength={2}
                          />
                          <input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingCategory(null); }}
                          />
                          <button onClick={saveEdit} className="text-primary text-sm font-medium px-1">저장</button>
                          <button onClick={() => setEditingCategory(null)} className="text-muted-foreground text-sm px-1">취소</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl w-7 text-center">{emoji}</span>
                            <span className="text-sm font-medium">{name}</span>
                          </div>
                          <button
                            onClick={() => startEdit(category)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 내 계정 ── */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">내 계정</h2>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            {kakaoAvatar ? (
              <img src={kakaoAvatar} alt="프로필" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl">👤</div>
            )}
            <div>
              <p className="font-medium">{kakaoName}</p>
              <p className="text-xs text-muted-foreground">카카오 계정</p>
            </div>
          </div>
          <button
            onClick={async () => { await signOut(); window.location.reload(); }}
            className="w-full rounded-xl border border-border py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            로그아웃
          </button>
        </div>
      </section>

    </div>
  );
}
