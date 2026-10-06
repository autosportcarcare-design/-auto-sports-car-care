"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Notice, request } from "./common";
export function AuthForm({
  mode,
  redirectTo = "/account",
}: {
  mode: "login" | "register" | "forgot" | "reset" | "verify";
  redirectTo?: string;
}) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <section className="narrow">
      <h1>
        {mode === "register"
          ? "Create account"
          : mode === "login"
            ? "Sign in"
            : mode === "verify"
              ? "Verify email"
              : mode === "forgot"
                ? "Reset password"
                : "Choose new password"}
      </h1>
      <form
        className="card stack"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const data = Object.fromEntries(new FormData(e.currentTarget));
          try {
            const result = await request<{ message?: string }>(
              `/api/auth/${mode}`,
              "POST",
              data,
            );
            if (mode === "login") {
              router.push(redirectTo);
              router.refresh();
            } else setMessage(result.message ?? "Saved. You can now sign in.");
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {mode === "register" && (
          <>
            <label>
              First name
              <input name="firstName" required autoComplete="given-name" />
            </label>
            <label>
              Last name
              <input name="lastName" required autoComplete="family-name" />
            </label>
          </>
        )}
        {["login", "register", "forgot"].includes(mode) && (
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
        )}
        {["login", "register", "reset"].includes(mode) && (
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={mode === "login" ? 1 : 12}
              maxLength={128}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          </label>
        )}
        {["verify", "reset"].includes(mode) && (
          <label>
            Email token
            <input name="token" required minLength={64} maxLength={64} />
          </label>
        )}
        <Notice error={error} />
        {message && <p role="status">{message}</p>}
        <button disabled={busy}>{busy ? "Please wait…" : "Continue"}</button>
      </form>
      <p>
        <Link href="/login">Sign in</Link> ·{" "}
        <Link href="/register">Create account</Link> ·{" "}
        <Link href="/forgot">Forgot password</Link>
      </p>
    </section>
  );
}
