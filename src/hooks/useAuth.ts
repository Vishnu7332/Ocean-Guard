import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email?: string;
  phone?: string;
  role: 'citizen' | 'official' | 'analyst';
  verified: boolean;
}

const DEMO_USER: User = {
  id: 'demo-user',
  email: 'demo@oceanguard.com',
  role: 'citizen',
  verified: true,
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      phone: supabaseUser.phone,
      role: 'citizen',
      verified: supabaseUser.email_confirmed_at !== null || supabaseUser.phone_confirmed_at !== null,
    };
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return mapSupabaseUser(data.user);
  };

  const loginWithPhone = async (phone: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) throw error;
    return data;
  };

  const verifyOtp = async (phone: string, token: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (error) throw error;
    if (data.user) {
      return mapSupabaseUser(data.user);
    }
    throw new Error('Verification failed');
  };

  const registerWithEmail = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      return mapSupabaseUser(data.user);
    }
    throw new Error('Registration failed');
  };

  const logout = async () => {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  return {
    user,
    loading,
    loginWithEmail,
    loginWithPhone,
    verifyOtp,
    registerWithEmail,
    logout,
  };
}
