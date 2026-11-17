import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = { title: "Sign up · Girl Math Stocks" };

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Free account · pretend money · real lessons"
      title={<>Start investing <em className="text-rose">like the CEO you are.</em></>}
      blurb="Create an account to get $10,000 in practice cash and save everything you learn along the way."
    >
      <h2 className="mb-5 font-display text-2xl font-semibold">Create your account</h2>
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
