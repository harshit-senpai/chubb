import { supabase } from "@/integrations/supabase/client";

export async function saveUser(name: string, email: string) {
  const { data, error } = await supabase
    .from("form_users")
    .insert([{ name, email }])
    .select();

  // ✅ If user already exists, treat as success
  if (error && error.code === "23505") {
    return { data: [{ name, email }], error: null };
  }

  return { data, error };
}
