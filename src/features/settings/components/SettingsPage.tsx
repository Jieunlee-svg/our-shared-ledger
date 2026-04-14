import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { createNewInvite } from '@/features/auth/api/couple.api';
import type { Couple, Profile } from '@/features/auth/api/couple.api';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_EMOJI } from '@/constants/categories';
import { signOut } from '@/features/auth/api/auth.api';
import { cn } from '@/lib/utils';
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

interface SettingsPageProps {
  user: User;
  profile: Profile | null;
  couple: Couple | null;
  partner: Profile | null;
}

interface CustomTag {
  id: string;
  name: string;
  emoji: string;
  type: 'expense' | 'income';
}

interface TagStore {
  overrides: Record<string, { name: string; emoji: string }>;
  deleted: string[];
  custom: CustomTag[];
}

function loadTagStore(): TagStore {
  try {
    const raw = localStorage.getItem('tag_store');
    if (raw) return JSON.parse(raw);
    // 기존 category_customizations 데이터가 있으면 마이그레이션
    const legacy = localStorage.getItem('category_customizations');
    if (legacy) return { overrides: JSON.parse(legacy), deleted: [], custom: [] };
  } catch { /* empty */ }
  return { overrides: {}, deleted: [], custom: [] };
}

function saveTagStore(store: TagStore) {
  localStorage.setItem('tag_store', JSON.stringify(store));
}

export default function SettingsPage({ user, profile, couple, partner }: SettingsPageProps) {
  // 초대 코드
  const [inviteUrl, setInviteUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [loadingInvite, setLoadingInvite] = useState(false);

  // 태그 상태
  const [store, setStore] = useState<TagStore>(loadTagStore);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editEmoji, setEditEmoji] = useState('');
  const [editName, setEditName] = useState('');
  const [addingType, setAddingType] = useState<'expense' | 'income' | null>(null);
  const [newEmoji, setNewEmoji] = useState('📌');
  const [newName, setNewName] = useState('');

  const hasPartner = !!couple?.user2_id;

  // ── 초대 코드 ──
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

  // ── 태그 편집 ──
  const updateStore = (next: TagStore) => {
    setStore(next);
    saveTagStore(next);
  };

  const startEdit = (id: string, currentEmoji: string, currentName: string) => {
    setEditingId(id);
    setEditEmoji(currentEmoji);
    setEditName(currentName);
    setAddingType(null);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    const next = { ...store };
    // base category
    if (EXPENSE_CATEGORIES.includes(editingId) || INCOME_CATEGORIES.includes(editingId)) {
      next.overrides = { ...next.overrides, [editingId]: { emoji: editEmoji, name: editName.trim() } };
    } else {
      next.custom = next.custom.map(t => t.id === editingId ? { ...t, emoji: editEmoji, name: editName.trim() } : t);
    }
    updateStore(next);
    setEditingId(null);
  };

  const deleteTag = (id: string) => {
    const next = { ...store };
    if (EXPENSE_CATEGORIES.includes(id) || INCOME_CATEGORIES.includes(id)) {
      next.deleted = [...next.deleted, id];
    } else {
      next.custom = next.custom.filter(t => t.id !== id);
    }
    updateStore(next);
  };

  const addTag = () => {
    if (!addingType || !newName.trim()) return;
    const newTag: CustomTag = {
      id: `custom_${Date.now()}`,
      name: newName.trim(),
      emoji: newEmoji,
      type: addingType,
    };
    updateStore({ ...store, custom: [...store.custom, newTag] });
    setAddingType(null);
    setNewName('');
    setNewEmoji('📌');
  };

  const kakaoName = profile?.display_name ?? user.user_metadata?.full_name ?? '—';
  const kakaoAvatar = profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined);

  const sections: { label: string; type: 'expense' | 'income'; baseItems: string[] }[] = [
    { label: '지출', type: 'expense', baseItems: EXPENSE_CATEGORIES },
    { label: '수입', type: 'income', baseItems: INCOME_CATEGORIES },
  ];

  return (
    <div className="px-5 pb-24 pt-2 space-y-8">

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

      {/* ── 파트너 ── */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">파트너</h2>
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          {hasPartner ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">💕</span>
              <div>
                <p className="font-medium">{partner?.display_name ?? '배우자'}</p>
                <p className="text-xs text-muted-foreground">연결됨</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">아직 배우자와 연결되지 않았어요</p>
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
            </>
          )}
        </div>
      </section>

      {/* ── 태그 ── */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">태그</h2>
        <div className="space-y-4">
          {sections.map(({ label, type, baseItems }) => {
            const visibleBase = baseItems.filter(c => !store.deleted.includes(c));
            const customItems = store.custom.filter(t => t.type === type);

            return (
              <div key={type}>
                <p className="text-xs text-muted-foreground mb-2 px-1">{label}</p>
                <div className="bg-card border border-border rounded-2xl divide-y divide-border">

                  {/* 기본 태그 */}
                  {visibleBase.map(category => {
                    const override = store.overrides[category];
                    const emoji = override?.emoji ?? CATEGORY_EMOJI[category] ?? '📌';
                    const name = override?.name ?? category;
                    const isEditing = editingId === category;

                    return (
                      <div key={category} className="px-4 py-3">
                        {isEditing ? (
                          <EditRow
                            emoji={editEmoji} name={editName}
                            onEmojiChange={setEditEmoji} onNameChange={setEditName}
                            onSave={saveEdit} onCancel={() => setEditingId(null)}
                          />
                        ) : (
                          <TagRow
                            emoji={emoji} name={name}
                            onEdit={() => startEdit(category, emoji, name)}
                            onDelete={() => deleteTag(category)}
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* 사용자 추가 태그 */}
                  {customItems.map(tag => {
                    const isEditing = editingId === tag.id;
                    return (
                      <div key={tag.id} className="px-4 py-3">
                        {isEditing ? (
                          <EditRow
                            emoji={editEmoji} name={editName}
                            onEmojiChange={setEditEmoji} onNameChange={setEditName}
                            onSave={saveEdit} onCancel={() => setEditingId(null)}
                          />
                        ) : (
                          <TagRow
                            emoji={tag.emoji} name={tag.name}
                            onEdit={() => startEdit(tag.id, tag.emoji, tag.name)}
                            onDelete={() => deleteTag(tag.id)}
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* 추가 행 */}
                  {addingType === type ? (
                    <div className="px-4 py-3">
                      <EditRow
                        emoji={newEmoji} name={newName}
                        onEmojiChange={setNewEmoji} onNameChange={setNewName}
                        onSave={addTag} onCancel={() => { setAddingType(null); setNewName(''); setNewEmoji('📌'); }}
                        placeholder="태그 이름"
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingType(type); setEditingId(null); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-primary hover:bg-muted/50 transition-colors rounded-b-2xl"
                    >
                      <Plus className="h-4 w-4" />
                      태그 추가
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}

// ── 공통 서브컴포넌트 ──

function TagRow({ emoji, name, onEdit, onDelete }: {
  emoji: string; name: string;
  onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xl w-7 text-center">{emoji}</span>
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onEdit} className="text-muted-foreground hover:text-foreground transition-colors p-1.5">
          <Edit2 className="h-4 w-4" />
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="text-muted-foreground hover:text-destructive transition-colors p-1.5">
              <Trash2 className="h-4 w-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>태그를 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-medium text-foreground">{emoji} {name}</span> 태그가 목록에서 사라져요.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function EditRow({ emoji, name, onEmojiChange, onNameChange, onSave, onCancel, placeholder = '' }: {
  emoji: string; name: string;
  onEmojiChange: (v: string) => void;
  onNameChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        value={emoji}
        onChange={e => onEmojiChange(e.target.value)}
        className="w-12 text-center rounded-lg border border-border bg-background py-1.5 text-base"
        maxLength={2}
      />
      <input
        value={name}
        onChange={e => onNameChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        autoFocus
        onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }}
      />
      <button onClick={onSave} className="text-primary text-sm font-medium px-1">저장</button>
      <button onClick={onCancel} className="text-muted-foreground text-sm px-1">취소</button>
    </div>
  );
}
