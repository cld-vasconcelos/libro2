import { supabase } from '@/lib/supabase';
import type { SupabaseError } from '@/lib/supabase';

export const signInWithLink = async (email: string) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  });

  if (error) {
    throw new Error(error.message);
  }
};

export type SignInData = {
  email: string;
  password: string;
};

export type SignUpData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export const signUp = async ({ email, password, firstName, lastName }: SignUpData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  // Handle existing user error cases:
  // 1. When we get a response with user but no identities (email exists)
  // 2. When we get the specific "User already registered" error
  if (data?.user && !data.user.identities?.length) {
    throw new Error('Email already registered');
  }

  if (error) {
    if (error.message.includes('already registered')) {
      throw new Error('Email already registered');
    }
    throw new Error(error.message);
  }

  return data;
};

export const signIn = async ({ email, password }: SignInData) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    const supabaseError = error as SupabaseError;
    throw new Error(supabaseError.message);
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  } catch (error) {
    const supabaseError = error as SupabaseError;
    throw new Error(supabaseError.message);
  }
};

export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }
    return data.session;
  } catch (error) {
    const supabaseError = error as SupabaseError;
    throw new Error(supabaseError.message);
  }
};
