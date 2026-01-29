"use client";

import { useState } from "react";
import { FooterSection } from "@/app/components/FooterSection";
import { SectionBlock, SectionTitle } from "@/app/components/ui";
import { contactPageContent, footerLinks } from "@/app/data/homepageData";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="grid min-h-screen bg-[radial-gradient(circle_at_top_right,_#d7e7e0,_#e8f2fa_40%,_#f7f8f4_75%)] text-slate-800">
      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <SectionBlock>
          <SectionTitle title="Contact" description={contactPageContent.intro} />
        </SectionBlock>

        <SectionBlock>
          <SectionTitle title="Get in Touch" />
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-slate-800 outline-none ring-emerald-300 transition focus:ring"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-slate-800 outline-none ring-emerald-300 transition focus:ring"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Message
              <textarea
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-slate-800 outline-none ring-emerald-300 transition focus:ring"
              />
            </label>
            <button
              type="submit"
              className="inline-grid w-fit place-items-center rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Send Message
            </button>
          </form>
          <p className="text-sm text-slate-600">Email: {contactPageContent.email}</p>
          {submitted ? (
            <p className="rounded-xl bg-emerald-50 px-4 py-3 text-slate-700 ring-1 ring-emerald-100">
              Thank you for reaching out. We will respond soon.
            </p>
          ) : null}
        </SectionBlock>
      </main>

      <div className="mx-auto grid w-full max-w-6xl px-5 pb-8 sm:px-8 lg:px-10">
        <FooterSection links={footerLinks} />
      </div>
    </div>
  );
}
