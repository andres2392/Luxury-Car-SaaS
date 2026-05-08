"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, signupUser } from "@/lib/api";
import { canManageCars, storeAuthSession } from "@/lib/auth";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === "signup" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload =
        mode === "signup"
          ? await signupUser({ email, password })
          : await loginUser({ email, password });

      storeAuthSession(payload);
      router.push(canManageCars(payload.user) ? "/dashboard" : "/cars");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not complete request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-[linear-gradient(180deg,#010101_0%,#0A0E0C_42%,#18201d_100%)] px-6 py-12 text-[#F5F5F2] sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-[1180px] overflow-hidden bg-[#050706]/82 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden min-h-[620px] overflow-hidden lg:block">
          <img
            src="/homepage/luxury-generated-hero.png"
            alt="Luxury vehicle in an architectural setting"
            className="h-full w-full object-cover object-[58%_center] opacity-78"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(1,1,1,0.28)_0%,rgba(1,1,1,0.04)_48%,#050706_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,1,1,0.08)_0%,rgba(1,1,1,0.38)_100%)]" />
          <div className="absolute bottom-10 left-10 max-w-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#BFA46A]">
              Motorflow Dashboard
            </p>
            <p className="mt-4 font-heading text-3xl leading-tight tracking-[-0.03em] text-[#F5F5F2]">
              Private access for collector-grade inventory.
            </p>
          </div>
        </div>

        <div className="flex min-h-[620px] items-center px-6 py-12 sm:px-10 lg:px-14">
          <div className="w-full">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#BFA46A]">
              {mode === "signup" ? "Create Access" : "Dashboard Access"}
            </p>
            <h1 className="mt-5 font-heading text-4xl leading-[0.98] tracking-[-0.04em] text-[#F5F5F2] sm:text-5xl">
              {mode === "signup" ? "Join the collection." : "Welcome back."}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#C8C8C2]/68">
              {mode === "signup"
                ? "Create a private client account for saved vehicles, enquiries, and collection updates."
                : "Sign in to manage your dashboard, saved vehicles, and private enquiries."}
            </p>

            <form className="mt-9 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[11px] uppercase tracking-[0.22em] text-[#C8C8C2]/72">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-12 rounded-none border-white/14 bg-white/6 text-[#F5F5F2] shadow-none placeholder:text-[#C8C8C2]/38 focus:border-[#BFA46A] focus:ring-[#BFA46A]/16"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[11px] uppercase tracking-[0.22em] text-[#C8C8C2]/72">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-12 rounded-none border-white/14 bg-white/6 text-[#F5F5F2] shadow-none placeholder:text-[#C8C8C2]/38 focus:border-[#BFA46A] focus:ring-[#BFA46A]/16"
                />
              </div>

              {error ? <p className="text-sm text-[#f0a7a7]">{error}</p> : null}
              {status ? <p className="text-sm text-[#C8C8C2]/62">{status}</p> : null}

              <Button
                type="submit"
                className="h-12 w-full rounded-none bg-[#BFA46A] text-sm text-[#010101] shadow-none hover:bg-[#c9b176]"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Please wait..."
                  : mode === "signup"
                    ? "Create account"
                    : "Log in"}
              </Button>
            </form>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-sm text-[#C8C8C2]/62">
                {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
                <Link
                  href={mode === "signup" ? "/login" : "/signup"}
                  className="font-medium text-[#F5F5F2] underline-offset-4 hover:underline"
                >
                  {mode === "signup" ? "Log in" : "Sign up"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
