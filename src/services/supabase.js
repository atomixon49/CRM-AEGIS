import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function fetchAll(session, table, query = (q) => q, options = {}) {
  let q = supabase.from(table).select('*');
  q = query(q);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function insertRow(session, table, payload) {
  const { data, error } = await supabase.from(table).insert([payload]).select('*').single();
  if (error) throw error;
  return data;
}
