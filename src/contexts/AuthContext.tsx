import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AppRole } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nome: string, token?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isTecnico: boolean;
  isFinanceiro: boolean;
  isCliente: boolean;
  hasRole: (roles: AppRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }
      return data as Profile | null;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetch with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then(setProfile);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then((profile) => {
          setProfile(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, nome: string, token?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nome,
          invite_token: token,
        },
      },
    });

    if (error) {
      return { error: error as Error };
    }

    // Criar perfil automaticamente
    if (data.user) {
      let role: AppRole = 'cliente';
      let clienteId: string | null = null;

      // Se tem token de convite, buscar informações do convite
      if (token) {
        const { data: convite } = await supabase
          .from('convites')
          .select('*')
          .eq('token', token)
          .eq('status', 'pendente')
          .maybeSingle();

        if (convite) {
          role = convite.role as AppRole;
          clienteId = convite.cliente_id;

          // Atualizar convite como aceito
          await supabase
            .from('convites')
            .update({ status: 'aceito', accepted_at: new Date().toISOString() })
            .eq('id', convite.id);
        }
      }

      // Criar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: data.user.id,
          nome,
          email,
          role,
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
      }

      // Se for cliente, vincular ao cliente
      if (role === 'cliente' && clienteId) {
        await supabase
          .from('cliente_usuarios')
          .insert({
            cliente_id: clienteId,
            user_id: data.user.id,
            is_primary: true,
          });
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const isAdmin = profile?.role === 'admin';
  const isTecnico = profile?.role === 'tecnico';
  const isFinanceiro = profile?.role === 'financeiro';
  const isCliente = profile?.role === 'cliente';

  const hasRole = (roles: AppRole[]) => {
    if (!profile) return false;
    return roles.includes(profile.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin,
        isTecnico,
        isFinanceiro,
        isCliente,
        hasRole,
      }}
    >
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
