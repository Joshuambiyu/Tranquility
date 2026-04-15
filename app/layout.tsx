import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { FooterSection } from "@/app/components/FooterSection";
import { Libre_Baskerville, Manrope } from "next/font/google";
import { Providers } from "@/app/providers";
import { SiteHeader } from "@/app/components/SiteHeader";
import { footerLinks } from "@/app/data/homepageData";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-libre-baskerville",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const siteDescription =
  "TranquilityHub is a space dedicated to reflection, empathy and mental clarity. Our mission is to encourage thoughtful living by sharing ideas and stories with an aim of improving well-being in a fast-moving technology-driven world.";

const GA_MEASUREMENT_ID = "G-6K90MS1EJ1";

export const metadata: Metadata = {
  title: {
    default: "TranquilityHub",
    template: "%s | TranquilityHub",
  },
  description: siteDescription,
  icons: {
    icon: "/icon.svg",
  },
  metadataBase: new URL(
    process.env.BETTER_AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: "TranquilityHub",
    description: siteDescription,
    siteName: "TranquilityHub",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TranquilityHub",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${libreBaskerville.variable} h-full antialiased`}
    >
      <head />
      <body className="min-h-full overflow-x-hidden bg-background text-foreground">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Providers>
          <div className="flex min-h-full flex-col">
            <Suspense fallback={null}>
              <SiteHeader links={footerLinks} />
            </Suspense>
            <div className="flex-1">{children}</div>
            <FooterSection links={footerLinks} />
          </div>
        </Providers>
      </body>
    </html>
  );
}
