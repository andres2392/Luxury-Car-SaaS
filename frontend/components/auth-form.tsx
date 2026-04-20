"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup } from "@/lib/api";
import { storeAuthSession } from "@/lib/auth";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      const payload =
        mode === "signup"
          ? await signup({ email, password })
          : await login({ email, password });

      storeAuthSession(payload);
      router.push("/cars");
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not complete request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-14">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "signup" ? "Create account" : "Welcome back"}</CardTitle>
          <CardDescription>
            {mode === "signup"
              ? "New signups become customer accounts automatically. The reserved owner email becomes admin."
              : "Log in to access your account and protected actions."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            {status ? <p className="text-sm text-[var(--color-muted-foreground)]">{status}</p> : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait..."
                : mode === "signup"
                  ? "Create account"
                  : "Log in"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-[var(--color-muted-foreground)]">
            {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
            <Link
              href={mode === "signup" ? "/login" : "/signup"}
              className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:underline"
            >
              {mode === "signup" ? "Log in" : "Sign up"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
