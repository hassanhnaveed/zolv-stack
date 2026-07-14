"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--color-text-1)",
  marginBottom: 8,
  letterSpacing: "-0.1px",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields before sending.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      toast.success("Message sent! We'll get back to you soon.");
      setForm(initialState);
    } catch {
      toast.error("Something went wrong. Please try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="contact-form glow-hover"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.04 }}
      style={{
        background: "var(--color-bg-2)",
        border: "1px solid var(--color-border)",
        borderRadius: 16,
        padding: "24px 22px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 18,
        }}
        className="contact-form__grid"
      >
        <div>
          <label htmlFor="contact-name" style={labelStyle}>
            Your Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            className="input-field"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div>
          <label htmlFor="contact-email" style={labelStyle}>
            Your Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="input-field"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="contact-subject" style={labelStyle}>
            Subject
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            placeholder="How can we help?"
            className="input-field"
            value={form.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label htmlFor="contact-message" style={labelStyle}>
            Your Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            placeholder="Tell us what's on your mind..."
            className="input-field contact-form__textarea"
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            disabled={submitting}
            required
          />
        </div>
      </div>

      <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-start" }}>
        <button type="submit" className="btn-primary" disabled={submitting} style={{ minWidth: 160 }}>
          {submitting ? (
            <>
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
              Sending...
            </>
          ) : (
            <>
              <Send size={16} />
              Send Message
            </>
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.form>
  );
}
