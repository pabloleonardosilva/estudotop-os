"use client";

/**
 * ARQUIVO: Contexto de autenticação
 * OBJETIVO: centraliza usuário, perfil, loading, login e logout.
 * ONDE MEXER: busca de profile, login/logout e estados globais.
 * CUIDADO: alteração aqui afeta permissões no sistema inteiro.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type UserProfile = {
  id: string;
  name: string;
  role: "admin" | "operator";
};

type AuthContextType = {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verificarUsuario();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      verificarUsuario();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function verificarUsuario() {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("AUTH USER:", user);
    console.log("AUTH ERROR:", userError);

    if (!user) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    setUser(user);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, role")
      .eq("id", user.id)
      .maybeSingle();

    console.log("PROFILE DATA:", profileData);
    console.log("PROFILE ERROR:", profileError);

    if (profileError) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setProfile(profileData || null);
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}