"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type SignInState = {
  step: "email" | "code";
  email: string;
  error?: string;
};

// Step 1: email a sign-in link (and a code, once the email template includes one). Only
// guardians already in the family can get one; sign-ups are off in Supabase and
// shouldCreateUser is false here. The link lands on /auth/confirm in this same browser.
export async function sendCode(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return { step: "email", email, error: "Enter your email address." };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${origin}/auth/confirm` },
  });
  if (error) {
    const unknown = /signups? not allowed|not found/i.test(error.message);
    return {
      step: "email",
      email,
      error: unknown ? "That email isn't set up as a guardian." : `Couldn't send a code: ${error.message}`,
    };
  }
  return { step: "code", email };
}

// Step 2: check the code from the email.
export async function verifyCode(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "");
  const token = String(formData.get("code") ?? "").replace(/\s/g, "");

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) return { step: "code", email, error: "That code didn't work. Check it, or send a new one." };

  redirect("/parent");
}
