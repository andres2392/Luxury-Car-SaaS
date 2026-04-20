"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createInquiry } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth";

export function InquiryForm({ carId }: { carId: number }) {
  const storedUser = getStoredUser();
  const [name, setName] = useState(storedUser?.email.split("@")[0] ?? "");
  const [email, setEmail] = useState(storedUser?.email ?? "");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      await createInquiry(
        {
          car_id: carId,
          name,
          email,
          message,
        },
        getStoredToken()
      );
      setMessage("");
      setStatus("Inquiry sent successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send inquiry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="I would like to schedule a viewing and learn more about this vehicle."
          required
        />
      </div>

      {status ? <p className="text-sm text-[var(--color-muted-foreground)]">{status}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send inquiry"}
      </Button>
    </form>
  );
}

