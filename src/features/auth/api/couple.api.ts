import { supabase } from '@/lib/supabase/client';

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  couple_id: string | null;
}

export interface Couple {
  id: string;
  user1_id: string;
  user2_id: string | null;
  created_at: string;
}

export interface Invitation {
  id: string;
  inviter_id: string;
  couple_id: string;
  token: string;
  accepted_at: string | null;
  expires_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function getCouple(coupleId: string): Promise<Couple | null> {
  const { data, error } = await supabase
    .from('couples')
    .select('*')
    .eq('id', coupleId)
    .maybeSingle();
  if (error) return null;
  return data;
}

/** 커플 생성 + 기존 기록 이전 + 초대 토큰 발급 */
export async function createCouple(userId: string): Promise<{ couple: Couple; token: string }> {
  // 1. 커플 생성
  const { data: couple, error: coupleError } = await supabase
    .from('couples')
    .insert({ user1_id: userId })
    .select()
    .single();
  if (coupleError) throw coupleError;

  // 2. 프로필에 couple_id 저장
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId, couple_id: couple.id });
  if (profileError) throw profileError;

  // 3. 기존에 쌓인 기록들을 이 커플에 귀속
  await supabase
    .from('expenses')
    .update({ couple_id: couple.id })
    .is('couple_id', null);

  // 4. 초대 토큰 생성
  const { data: invite, error: inviteError } = await supabase
    .from('invitations')
    .insert({ inviter_id: userId, couple_id: couple.id })
    .select('token')
    .single();
  if (inviteError) throw inviteError;

  return { couple, token: invite.token };
}

/** 초대 링크 재발급 */
export async function createNewInvite(userId: string, coupleId: string): Promise<string> {
  // 기존 미사용 초대 삭제
  await supabase
    .from('invitations')
    .delete()
    .eq('couple_id', coupleId)
    .is('accepted_at', null);

  const { data, error } = await supabase
    .from('invitations')
    .insert({ inviter_id: userId, couple_id: coupleId })
    .select('token')
    .single();
  if (error) throw error;
  return data.token;
}

export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (error) return null;
  return data;
}

/** 초대 수락 — RPC 함수로 RLS 우회해서 처리 */
export async function acceptInvitation(token: string, userId: string): Promise<Couple> {
  const { data, error } = await supabase.rpc('accept_invitation', {
    p_token: token,
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
  return data as Couple;
}

export async function getPartnerProfile(couple: Couple, currentUserId: string): Promise<Profile | null> {
  const partnerId = couple.user1_id === currentUserId ? couple.user2_id : couple.user1_id;
  if (!partnerId) return null;
  return getProfile(partnerId);
}
