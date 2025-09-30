import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient = null as any;

try {
  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '') {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  console.log('Supabase not configured - running in demo mode');
}

export const supabase = supabaseClient;

export type HazardType = 'tsunami' | 'storm_surge' | 'high_waves' | 'coastal_flooding' | 'cyclone' | 'erosion';
export type HazardSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'pending' | 'verified' | 'responded' | 'resolved';

export interface HazardReport {
  id: string;
  user_id: string;
  hazard_type: HazardType;
  severity: HazardSeverity;
  latitude: number;
  longitude: number;
  description: string;
  location_name: string;
  media_url?: string;
  status: ReportStatus;
  created_at: string;
  user?: {
    email?: string;
    phone?: string;
  };
}

export interface SocialAnalytics {
  id: string;
  keyword: string;
  mention_count: number;
  sentiment_score: number;
  location: string;
  created_at: string;
}
