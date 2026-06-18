import type { Tables } from "@/lib/supabase/database.types";

export type AppRole = Tables<"profiles">["role"];
export type UserProfile = Tables<"profiles">;

export type AuthContext = {
  userId: string;
  email: string;
  profile: UserProfile;
};
