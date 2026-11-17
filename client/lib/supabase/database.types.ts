// Generated from the Supabase schema (supabase/migrations). Regenerate after schema changes.

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      holdings: {
        Row: { avg_cost: number; shares: number; ticker: string; updated_at: string; user_id: string };
        Insert: { avg_cost: number; shares: number; ticker: string; updated_at?: string; user_id: string };
        Update: { avg_cost?: number; shares?: number; ticker?: string; updated_at?: string; user_id?: string };
        Relationships: [];
      };
      learned_terms: {
        Row: { created_at: string; term_id: string; user_id: string };
        Insert: { created_at?: string; term_id: string; user_id: string };
        Update: { created_at?: string; term_id?: string; user_id?: string };
        Relationships: [];
      };
      profiles: {
        Row: { cash_balance: number; created_at: string; display_name: string | null; id: string; starting_cash: number };
        Insert: { cash_balance?: number; created_at?: string; display_name?: string | null; id: string; starting_cash?: number };
        Update: { cash_balance?: number; created_at?: string; display_name?: string | null; id?: string; starting_cash?: number };
        Relationships: [];
      };
      saved_scenarios: {
        Row: {
          amount: number;
          created_at: string;
          emoji: string | null;
          id: string;
          label: string;
          per_year: number;
          rate_pct: number;
          user_id: string;
          years: number;
        };
        Insert: {
          amount: number;
          created_at?: string;
          emoji?: string | null;
          id?: string;
          label: string;
          per_year: number;
          rate_pct: number;
          user_id: string;
          years: number;
        };
        Update: {
          amount?: number;
          created_at?: string;
          emoji?: string | null;
          id?: string;
          label?: string;
          per_year?: number;
          rate_pct?: number;
          user_id?: string;
          years?: number;
        };
        Relationships: [];
      };
      trades: {
        Row: {
          created_at: string;
          id: number;
          price: number;
          realized_gain: number | null;
          shares: number;
          side: string;
          ticker: string;
          total: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: never;
          price: number;
          realized_gain?: number | null;
          shares: number;
          side: string;
          ticker: string;
          total: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: never;
          price?: number;
          realized_gain?: number | null;
          shares?: number;
          side?: string;
          ticker?: string;
          total?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      watchlist: {
        Row: { created_at: string; ticker: string; user_id: string };
        Insert: { created_at?: string; ticker: string; user_id: string };
        Update: { created_at?: string; ticker?: string; user_id?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      execute_trade: {
        Args: { p_price: number; p_shares: number; p_side: string; p_ticker: string };
        Returns: {
          created_at: string;
          id: number;
          price: number;
          realized_gain: number | null;
          shares: number;
          side: string;
          ticker: string;
          total: number;
          user_id: string;
        };
        SetofOptions: { from: "*"; to: "trades"; isOneToOne: true; isSetofReturn: false };
      };
      reset_practice_account: { Args: never; Returns: undefined };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
