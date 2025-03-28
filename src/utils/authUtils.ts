
import { Session } from '@supabase/supabase-js';
import { AuthUser } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Convert Supabase User to our User type
export const formatUser = (session: Session | null): AuthUser | null => {
  if (!session?.user) return null;
  
  const { id, email, user_metadata } = session.user;
  
  return {
    id,
    email: email || '',
    name: user_metadata?.full_name || user_metadata?.name || email?.split('@')[0] || '',
    photoURL: user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user_metadata?.full_name || email?.split('@')[0] || 'User')}&background=0D8ABC&color=fff`,
  };
};

// Get the current user ID from Supabase auth
export const getUserId = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
};
