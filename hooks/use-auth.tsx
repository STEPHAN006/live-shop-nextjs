'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const syncUserFromSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      const sessionUser = data.session?.user ?? null;
      if (!sessionUser) {
        setUser(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, email, role, avatar, is_verified, wallet_balance')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        setUser({
          id: sessionUser.id,
          name: sessionUser.user_metadata?.name ?? sessionUser.email ?? 'User',
          email: sessionUser.email ?? '',
          role: (sessionUser.user_metadata?.role as UserRole) ?? 'BUYER',
          avatar: sessionUser.user_metadata?.avatar,
          isVerified: false,
          walletBalance: 0,
          followedVendors: [],
        });
        return;
      }

      setUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar ?? undefined,
        isVerified: profile.is_verified,
        walletBalance: profile.wallet_balance,
        followedVendors: [],
      });
    };

    syncUserFromSession()
      .catch(() => {
        setUser(null);
      })
      .finally(() => setIsLoading(false));

    const { data: subscription } = supabase.auth.onAuthStateChange(() => {
      setIsLoading(true);
      syncUserFromSession()
        .catch(() => {
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      throw error;
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      setIsLoading(false);
      throw sessionError;
    }

    const sessionUser = sessionData.session?.user;
    if (!sessionUser) {
      setIsLoading(false);
      throw new Error('Failed to create session');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', sessionUser.id)
      .maybeSingle();

    if (profileError) {
      setIsLoading(false);
      throw profileError;
    }

    const role = (profile?.role ?? (sessionUser.user_metadata?.role as UserRole) ?? 'BUYER') as UserRole;

    if (role === 'ADMIN') router.push('/admin/dashboard');
    else if (role === 'VENDOR') router.push('/vendor/dashboard');
    else router.push('/buyer/feed');

    setIsLoading(false);
  };

  const logout = () => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.signOut().finally(() => {
      setUser(null);
      router.push('/');
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
