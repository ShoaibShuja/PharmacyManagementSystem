const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabasePublicEnv() {
  if (!publicSupabaseUrl || !publicSupabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return {
    url: publicSupabaseUrl,
    anonKey: publicSupabaseAnonKey,
  };
}

export function hasSupabasePublicEnv() {
  return Boolean(publicSupabaseUrl && publicSupabaseAnonKey);
}
