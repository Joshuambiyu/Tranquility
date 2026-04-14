"use client";

import { useState } from "react";
import { useToast } from "@/app/components/feedback/ToastProvider";
import { SectionBlock, SectionTitle } from "@/app/components/ui";
import { logClientError, parseApiError } from "@/lib/errors/client-error";
import { contactPageContent } from "@/app/data/homepageData";

const MESSAGE_MAX_LENGTH = 4000;

type ContactFieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

function validateContactFields(input: { name: string; email: string; message: string }) {
  const errors: ContactFieldErrors = {};

  const normalizedName = input.name.trim();
  const normalizedEmail = input.email.trim();
  const normalizedMessage = input.message.trim();

  if (normalizedName.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  if (normalizedMessage.length < 10) {
    errors.message = "Message is too short. Please write at least 10 characters.";
  }

  if (normalizedMessage.length > MESSAGE_MAX_LENGTH) {
    errors.message = `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`;
  }

  return errors;
}

export default function ContactPage() {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});

  const messageCharacterCount = message.length;

  const updateFieldError = (field: keyof ContactFieldErrors, values: { name: string; email: string; message: string }) => {
    const nextErrors = validateContactFields(values);
    setFieldErrors((previous) => ({
      ...previous,
      [field]: nextErrors[field],
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const localValidationErrors = validateContactFields({ name, email, message });
    setFieldErrors(localValidationErrors);

    if (localValidationErrors.name || localValidationErrors.email || localValidationErrors.message) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError("");
      setSubmitted(false);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          website,
        }),
      });

      if (!response.ok) {
        throw await parseApiError(response, "Unable to send your message.");
      }

      const result = (await response.json()) as { message?: string; emailSent?: boolean };

      setSubmitted(true);
      if (result.emailSent === false) {
        setSubmitError("Your message was saved, but email notification is currently unavailable.");
        showToast({
          type: "info",
          title: "Message saved",
          message: "Your message was saved, but email notification is currently unavailable.",
        });
      } else {
        showToast({
          type: "success",
          title: "Message sent",
          message: result.message ?? "Thank you for reaching out. We will respond soon.",
        });
      }
      setName("");
      setEmail("");
      setMessage("");
      setWebsite("");
      setFieldErrors({});
    } catch (error) {
      logClientError(error, {
        scope: "contact.submit",
      });
      const message = error instanceof Error ? error.message : "Unable to send your message.";
      setSubmitError(message);
      showToast({
        type: "error",
        title: "Unable to send message",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[radial-gradient(circle_at_top_right,_#d7e7e0,_#e8f2fa_40%,_#f7f8f4_75%)] text-slate-800">
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 sm:gap-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock>
          <SectionTitle title="Contact" description={contactPageContent.intro} />
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Get in Touch" />
          <form className="grid gap-4 sm:gap-5" onSubmit={handleSubmit} noValidate>
            <label className="hidden" aria-hidden="true">
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Name
              <input
                value={name}
                onChange={(event) => {
                  const nextName = event.target.value;
                  setName(nextName);
                  updateFieldError("name", {
                    name: nextName,
                    email,
                    message,
                  });
                }}
                required
                minLength={2}
                maxLength={100}
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-slate-800 outline-none ring-emerald-300 transition focus:ring"
              />
              {fieldErrors.name ? (
                <span id="contact-name-error" className="text-xs text-rose-700">
                  {fieldErrors.name}
                </span>
              ) : null}
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  const nextEmail = event.target.value;
                  setEmail(nextEmail);
                  updateFieldError("email", {
                    name,
                    email: nextEmail,
                    message,
                  });
                }}
                required
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "contact-email-error" : undefined}
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-slate-800 outline-none ring-emerald-300 transition focus:ring"
              />
              {fieldErrors.email ? (
                <span id="contact-email-error" className="text-xs text-rose-700">
                  {fieldErrors.email}
                </span>
              ) : null}
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Message
              <textarea
                rows={5}
                value={message}
                onChange={(event) => {
                  const nextMessage = event.target.value;
                  setMessage(nextMessage);
                  updateFieldError("message", {
                    name,
                    email,
                    message: nextMessage,
                  });
                }}
                required
                minLength={10}
                maxLength={4000}
                aria-invalid={Boolean(fieldErrors.message)}
                aria-describedby={fieldErrors.message ? "contact-message-error" : "contact-message-help"}
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-slate-800 outline-none ring-emerald-300 transition focus:ring"
              />
              <div id="contact-message-help" className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">Minimum 10 characters.</span>
                <span className={messageCharacterCount > MESSAGE_MAX_LENGTH ? "text-rose-700" : "text-slate-500"}>
                  {messageCharacterCount}/{MESSAGE_MAX_LENGTH}
                </span>
              </div>
              {fieldErrors.message ? (
                <span id="contact-message-error" className="text-xs text-rose-700">
                  {fieldErrors.message}
                </span>
              ) : null}
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-grid w-full place-items-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-fit"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </form>
          <p className="text-sm text-slate-600">Email: {contactPageContent.email}</p>
          {submitted ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-slate-700 ring-1 ring-emerald-100">
              Thank you for reaching out. We will respond soon.
            </p>
          ) : null}
          {submitError ? (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-rose-700 ring-1 ring-rose-100">{submitError}</p>
          ) : null}
        </SectionBlock>
      </main>
    </div>
  );
}
