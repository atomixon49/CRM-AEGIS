import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://adingsvcqljyiyuyihdn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6htqXQ8FA4fa2GVlm_wqDQ_b731g6Qv';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
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

export async function fetchRows(table, query = (q) => q) {
  const q = query(supabase.from(table).select('*'));
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function insertRow(table, payload) {
  const { data, error } = await supabase.from(table).insert([payload]).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateRow(table, id, payload) {
  const { data, error } = await supabase.from(table).update(payload).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}
