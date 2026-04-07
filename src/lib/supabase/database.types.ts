// Supabase CLI로 자동 생성:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.types.ts

export type Database = {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string;
          name: string;        // 정규화된 가맹점명 (lowercase)
          category: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['merchants']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['merchants']['Insert']>;
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          label: string;
          category: string;
          memo: string;
          date: string;
          type: 'expense' | 'income';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>;
      };
    };
  };
};
