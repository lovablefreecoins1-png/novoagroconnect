import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "produtor" | "prestador" | "ambos" | "admin";

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
  productionTypes?: string[];
  propertySize?: string;
}

// Convert Supabase session to AppUser
function sessionToAppUser(user: User, profile?: any): AppUser {
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    name: profile?.full_name || meta.full_name || "",
    phone: profile?.phone || meta.phone || "",
    email: user.email || "",
    role: (profile?.user_type || meta.user_type || "produtor") as UserRole,
    city: profile?.city || meta.city || "Boa Esperança",
    state: profile?.state || meta.state || "MG",
    lat: profile?.lat,
    lng: profile?.lng,
    productionTypes: profile?.production_types,
    propertySize: profile?.property_size,
  };
}

export async function signUp(email: string, password: string, metadata: Record<string, any>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  // Clear legacy localStorage
  localStorage.removeItem("agroconnect_user");
}

export function getUser(): AppUser | null {
  // Legacy support during transition
  try {
    const data = localStorage.getItem("agroconnect_user");
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          // Fetch profile with setTimeout to avoid deadlock
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
            const appUser = sessionToAppUser(session.user, profile);
            setUser(appUser);
            // Keep localStorage in sync for BottomNav etc.
            localStorage.setItem("agroconnect_user", JSON.stringify(appUser));
            setLoading(false);
          }, 0);
        } else {
          setUser(null);
          localStorage.removeItem("agroconnect_user");
          setLoading(false);
        }
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Check legacy localStorage
        const legacy = getUser();
        if (legacy) setUser(legacy);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading,
    signIn: async (email: string, password: string) => {
      const data = await signIn(email, password);
      return data;
    },
    signUp: async (email: string, password: string, metadata: Record<string, any>) => {
      const data = await signUp(email, password, metadata);
      return data;
    },
    signOut: async () => {
      await signOut();
      setUser(null);
      setSession(null);
    },
    // Legacy compatibility
    login: (phone: string, pin: string) => {
      // Keep for backward compat — will be removed
      return null;
    },
    logout: async () => {
      await signOut();
      setUser(null);
      setSession(null);
    },
  };
}
