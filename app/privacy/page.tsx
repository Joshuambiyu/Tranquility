import { Card, SectionBlock, SectionTitle } from "@/app/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy & Disclaimer — TranquilityHub" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="grid min-h-screen bg-background text-foreground">
      <main className="mx-auto grid w-full max-w-[84rem] gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:gap-10 lg:px-10 xl:gap-12">
        <SectionBlock className="lg:p-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-8 top-10 h-32 w-32 rounded-full bg-white/70 blur-3xl" />
            <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-[#dcebf4] blur-2xl" />
            <div className="absolute bottom-0 right-1/4 h-28 w-40 rounded-full bg-[#e0f1e6] blur-3xl" />
          </div>

          <div className="relative grid gap-4 lg:grid-cols-12 lg:auto-rows-[minmax(6rem,auto)] xl:gap-5">
            <Card className="gap-5 rounded-[32px] p-7 sm:p-9 lg:col-span-12 xl:p-12">
              <div className="inline-flex w-fit items-center rounded-full border border-white/80 bg-white/75 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 shadow-sm backdrop-blur">
                Legal
              </div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#4A7FA5] sm:text-4xl lg:text-5xl">
                Privacy Policy & Disclaimer
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl">
                Your privacy matters. This page explains how we handle your information and clarifies the nature of the content we share.
              </p>
              <p className="text-xs text-[var(--text-muted)]">Last updated: April 2026</p>
            </Card>
          </div>
        </SectionBlock>

        {/* Medical & Professional Disclaimer */}
        <SectionBlock>
          <SectionTitle title="Important Disclaimer" />
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="gap-3 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Not Medical Advice</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                TranquilityHub is <strong>not</strong> a medical, therapeutic, or clinical service. The content published on this website — including articles, reflections, journal prompts, and community voices — is intended for general informational and inspirational purposes only.
              </p>
            </Card>
            <Card className="gap-3 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">No Professional Credentials</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                The creator and contributors of TranquilityHub are <strong>not</strong> licensed medical practitioners, psychologists, psychiatrists, therapists, or counsellors. Nothing on this site should be interpreted as a diagnosis, treatment plan, or substitute for professional help.
              </p>
            </Card>
            <Card className="gap-3 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Seek Professional Help</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                If you are experiencing a mental health crisis, distress, or need support, please reach out to a qualified professional or contact your local emergency services. Our content is not a replacement for real clinical care.
              </p>
            </Card>
            <Card className="gap-3 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Personal Responsibility</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                By using this website, you acknowledge that any actions taken based on the content here are at your own discretion and risk. TranquilityHub assumes no liability for decisions made from reading our material.
              </p>
            </Card>
          </div>
        </SectionBlock>

        {/* Data We Collect */}
        <SectionBlock>
          <SectionTitle title="Information We Collect" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="gap-3 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Account Information</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                When you sign in with Google, we receive your name, email address, and profile picture. This information is used solely to identify your account and personalise your experience on the site.
              </p>
            </Card>
            <Card className="gap-3 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Contact Submissions</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                If you reach out through our contact form, we collect your name, email, and message. These are stored securely and used only to respond to your enquiry.
              </p>
            </Card>
            <Card className="gap-3 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Community Contributions</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                Reflections or voices you submit may be displayed on the site. You choose whether to share your name or remain anonymous. We will never publish your email alongside your contributions.
              </p>
            </Card>
          </div>
        </SectionBlock>

        {/* How We Use Your Data */}
        <SectionBlock>
          <SectionTitle title="How We Use Your Data" />
          <Card className="gap-4 rounded-[30px] p-6 sm:p-8 lg:p-10">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4A7FA5]">We Do</p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--text-muted)]">
                  <li>• Use your account info to manage your session and personalise your experience</li>
                  <li>• Store contact form submissions to reply to your enquiries</li>
                  <li>• Display community voices you choose to share</li>
                  <li>• Use cookies necessary for authentication and site functionality</li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4A7FA5]">We Do Not</p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--text-muted)]">
                  <li>• Sell, rent, or trade your personal information</li>
                  <li>• Share your data with third-party advertisers</li>
                  <li>• Use your information for marketing without your consent</li>
                  <li>• Track you across other websites</li>
                </ul>
              </div>
            </div>
          </Card>
        </SectionBlock>

        {/* Third-Party Services */}
        <SectionBlock>
          <SectionTitle title="Third-Party Services" />
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="gap-3 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Google Authentication</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                We use Google OAuth for sign-in. When you authenticate, Google shares basic profile information with us. This process is governed by Google&apos;s own privacy policy.
              </p>
            </Card>
            <Card className="gap-3 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Hosting & Infrastructure</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                This site is hosted on Vercel. Your interactions with the site may be subject to Vercel&apos;s infrastructure and their data handling practices.
              </p>
            </Card>
          </div>
        </SectionBlock>

        {/* Data Security & Your Rights */}
        <SectionBlock>
          <SectionTitle title="Security & Your Rights" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="gap-3 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Data Security</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                We take reasonable measures to protect your information, including encrypted connections (HTTPS) and secure database storage. However, no system is completely immune to risk.
              </p>
            </Card>
            <Card className="gap-3 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Your Rights</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                You may request access to, correction of, or deletion of your personal data at any time by contacting us through the contact page. We will respond within a reasonable time frame.
              </p>
            </Card>
            <Card className="gap-3 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Policy Updates</p>
              <p className="text-sm leading-6 text-[var(--text-muted)]">
                We may update this policy from time to time. Changes will be reflected on this page with an updated date. Continued use of the site after changes constitutes acceptance.
              </p>
            </Card>
          </div>
        </SectionBlock>

        {/* Contact */}
        <SectionBlock>
          <Card className="gap-2 rounded-[24px] p-5 lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#4A7FA5]">Questions?</p>
            <p className="mt-3 font-serif text-xl leading-relaxed text-[var(--text-strong)] sm:text-2xl">
              If you have any questions about this policy or how your data is handled, please reach out through our contact page. We are happy to clarify anything.
            </p>
          </Card>
        </SectionBlock>
      </main>
    </div>
  );
}
