import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getSession } from '@/services/authService';

interface UserContextType {
  session: Session | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  session: null,
  isLoading: true,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await getSession();
        setSession(session);
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ session, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
