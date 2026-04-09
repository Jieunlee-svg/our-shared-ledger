import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { getProfile, getCouple, getPartnerProfile } from '../api/couple.api';
import type { Profile, Couple } from '../api/couple.api';

export function useCouple(user: User | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [partner, setPartner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setCouple(null);
      setPartner(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const p = await getProfile(user.id);
      setProfile(p);

      if (p?.couple_id) {
        const c = await getCouple(p.couple_id);
        setCouple(c);
        if (c) {
          const partnerP = await getPartnerProfile(c, user.id);
          setPartner(partnerP);
        }
      } else {
        setCouple(null);
        setPartner(null);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, couple, partner, loading, refresh };
}
