import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm, LinkError } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = { title: "Log in · Girl Math Stocks" };

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title={<>Your portfolio <em className="text-rose">missed you.</em></>}
      blurb="Log in to check on your closet of shares, your practice cash, and every girl math lesson you've saved."
    >
      <h2 className="mb-5 font-display text-2xl font-semibold">Log in</h2>
      <Suspense fallback={null}>
        <LinkError />
      </Suspense>
      <AuthForm mode="login" />
    </AuthShell>
  );
}
