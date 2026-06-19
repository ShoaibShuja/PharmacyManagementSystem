const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicSupabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabasePublicEnv() {
  if (!publicSupabaseUrl || !publicSupabaseKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or a Supabase publishable key.",
    );
  }

  return {
    url: publicSupabaseUrl,
    anonKey: publicSupabaseKey,
  };
}

export function hasSupabasePublicEnv() {
  return Boolean(publicSupabaseUrl && publicSupabaseKey);
}
