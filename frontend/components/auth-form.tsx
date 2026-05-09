"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/lib/api";
import { storeAuthSession } from "@/lib/auth";

export function AuthForm() {
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

    setIsSubmitting(true);

    try {
      const payload = await loginUser({ email, password });
      storeAuthSession(payload);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not complete request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-[linear-gradient(180deg,#050505_0%,#050505_34%,#10211B_72%,#090909_100%)] text-[#F3EFE7]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_34%,rgba(194,168,120,0.12),transparent_32%),radial-gradient(circle_at_18%_78%,rgba(37,64,54,0.42),transparent_34%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-[1440px] lg:grid-cols-[0.52fr_0.48fr]">
        <div className="relative hidden overflow-hidden lg:block">
          <img
            src="/collector/analog-icons-garage.png"
            alt="Collector vehicles in a private architectural garage"
            className="absolute inset-0 h-full w-full object-cover object-[56%_center] opacity-86 [filter:brightness(1.02)_contrast(1.06)_saturate(0.94)_sepia(0.04)]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,0.04)_0%,rgba(5,5,5,0.1)_46%,#050505_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.2)_0%,rgba(5,5,5,0.04)_36%,rgba(5,5,5,0.48)_100%)]" />
          <div className="absolute bottom-16 left-12 max-w-md xl:left-20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#C2A878]">
              By Appointment Only
            </p>
            <p className="mt-5 font-heading text-5xl leading-[0.92] tracking-[-0.045em] text-[#F3EFE7]">
              Private access for significant motor cars.
            </p>
            <div className="mt-6 h-px w-14 bg-[#C2A878]/48" />
          </div>
        </div>

        <div className="flex items-center px-6 py-14 sm:px-10 lg:px-12 xl:px-20">
          <div className="w-full max-w-[460px]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#C2A878]">
              Platform Access
            </p>
            <h1 className="mt-5 max-w-md font-heading text-5xl leading-[0.92] tracking-[-0.045em] text-[#F3EFE7] sm:text-6xl">
              Welcome back.
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#8E8A83]">
              Sign in to manage inventory, review inquiries, and operate the private dealership platform.
            </p>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#F3EFE7]/68">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-12 rounded-none border-0 border-b border-[#F3EFE7]/18 bg-transparent px-0 text-[#F3EFE7] shadow-none placeholder:text-[#8E8A83]/52 focus:border-[#C2A878] focus-visible:ring-0"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#F3EFE7]/68">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-12 rounded-none border-0 border-b border-[#F3EFE7]/18 bg-transparent px-0 text-[#F3EFE7] shadow-none placeholder:text-[#8E8A83]/52 focus:border-[#C2A878] focus-visible:ring-0"
                />
              </div>

              {error ? <p className="text-sm text-[#f0a7a7]">{error}</p> : null}
              {status ? <p className="text-sm text-[#8E8A83]">{status}</p> : null}

              <Button
                type="submit"
                className="h-11 w-full rounded-none border border-[#C2A878]/42 bg-transparent text-sm text-[#F3EFE7] shadow-none hover:bg-white/6 hover:text-[#F3EFE7]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Please wait..." : "Log in"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
