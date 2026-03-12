import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "TranquilityHub",
  description: "Pause. Reflect. Grow.",
  icons: {
    icon: "/favicon.ico",
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
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          <div className="flex min-h-full flex-col">
            <SiteHeader links={footerLinks} />
            <div className="flex-1">{children}</div>
            <FooterSection links={footerLinks} />
          </div>
        </Providers>
      </body>
    </html>
  );
}
