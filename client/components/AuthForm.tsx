"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  const [state, action, pending] = useActionState<AuthState, FormData>(isSignup ? signUp : signIn, {});

  if (state.message) {
    return (
      <div role="status" className="rounded-2xl bg-gain-soft p-5 text-gain">
        <p className="font-display text-xl font-semibold">Check your inbox 💌</p>
        <p className="mt-1 text-sm">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {isSignup && (
        <label className="text-sm font-semibold">
          What should we call you? <span className="font-normal text-plum-soft">(optional)</span>
          <input name="displayName" maxLength={40} autoComplete="nickname" className="field mt-1" placeholder="Bestie" />
        </label>
      )}
      <label className="text-sm font-semibold">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.email}
          className="field mt-1"
        />
      </label>
      <label className="text-sm font-semibold">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={isSignup ? 8 : undefined}
          autoComplete={isSignup ? "new-password" : "current-password"}
          className="field mt-1"
        />
        {isSignup && <span className="mt-1 block text-xs font-normal text-plum-soft">At least 8 characters.</span>}
      </label>

      {state.error && (
        <p role="alert" className="rounded-2xl bg-loss-soft px-4 py-2 text-sm text-loss">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary mt-1 disabled:opacity-60">
        {pending ? "One sec…" : isSignup ? "Create my account" : "Log in"}
      </button>

      <p className="text-center text-sm text-plum-soft">
        {isSignup ? (
          <>Already have an account? <Link href="/login" className="font-semibold text-rose-deep underline">Log in</Link></>
        ) : (
          <>New here? <Link href="/signup" className="font-semibold text-rose-deep underline">Create a free account</Link></>
        )}
      </p>
    </form>
  );
}

/** Shows a note when an email link was expired or already used. */
export function LinkError() {
  const params = useSearchParams();
  if (params.get("error") !== "link") return null;
  return (
    <p role="alert" className="mb-4 rounded-2xl bg-loss-soft px-4 py-2 text-sm text-loss">
      That link expired or was already used. Log in, or sign up again for a fresh one.
    </p>
  );
}
