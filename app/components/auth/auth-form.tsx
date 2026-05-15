"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

type AuthFormProps = {
  mode: AuthMode;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === "login";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const action = isLogin
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });

    const { error: authError } = await action;

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-token bg-[var(--panel-bg-a)] p-6 shadow-2xl shadow-black/10 backdrop-blur">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold text-token-primary">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-token-secondary">
          {isLogin
            ? "Login to continue solving problems."
            : "Sign up to start coding challenges."}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm text-token-secondary">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-token bg-[var(--editor-bg)] px-3 py-2.5 text-sm text-token-primary outline-none ring-cyan-400/40 transition focus:ring"
            placeholder="you@example.com"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm text-token-secondary">Password</span>
          <input
            required
            minLength={6}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-token bg-[var(--editor-bg)] px-3 py-2.5 text-sm text-token-primary outline-none ring-cyan-400/40 transition focus:ring"
            placeholder="Minimum 6 characters"
          />
        </label>

        {error ? (
          <p className="rounded-md border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? isLogin
              ? "Signing in..."
              : "Creating account..."
            : isLogin
              ? "Sign In"
              : "Sign Up"}
        </button>
      </form>

      <p className="mt-5 text-sm text-token-secondary">
        {isLogin ? "New to CodeJudge?" : "Already have an account?"} {" "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="text-cyan-300 underline decoration-cyan-400/30 underline-offset-4"
        >
          {isLogin ? "Create account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
