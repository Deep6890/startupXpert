import { supabase } from "./supabase";

export async function signUpUser(fullName, email, password, role) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  const user = data.user;
  if (user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert([{ id: user.id, full_name: fullName, role }]);
    if (profileError) throw profileError;
  }

  return data;
}

export async function signInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}