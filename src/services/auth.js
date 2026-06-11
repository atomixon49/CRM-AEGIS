import { supabase, signIn, signOut, getSession } from '../services/supabase';

export async function loginWithEmail(email, password) {
  return signIn(email, password);
}

export async function logout() {
  return signOut();
}

export async function currentSession() {
  return getSession();
}
