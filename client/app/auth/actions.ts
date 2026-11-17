"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
  message?: string;
  email?: string;
}

function read(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** Plain-language versions of Supabase's auth errors. */
function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match. Try again, babe.";
  if (m.includes("email not confirmed")) return "Confirm your email first: check your inbox for our link.";
  if (m.includes("already registered")) return "There's already an account with that email. Try logging in.";
  if (m.includes("rate limit")) return "Too many tries. Give it a minute, then try again.";
  return message;
}

export async function signIn(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = read(form, "email");
  const password = read(form, "password");
  if (!email || !password) return { error: "Email and password, please.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendly(error.message), email };
  redirect("/");
}

export async function signUp(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = read(form, "email");
  const password = read(form, "password");
  const displayName = read(form, "displayName").slice(0, 40);
  if (!email) return { error: "We need an email to save your progress.", email };
  if (password.length < 8) return { error: "Make your password at least 8 characters.", email };

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName || null },
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });
  if (error) return { error: friendly(error.message), email };

  // Email confirmation off: signed in already.
  if (data.session) redirect("/");
  return {
    message: `Almost there! We sent a confirmation link to ${email}. Click it, then you're in.`,
    email,
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
