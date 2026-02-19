"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AuthControls } from "@/app/components/AuthControls";
import type { NavLinkItem } from "@/types";

interface SiteHeaderProps {
  links: NavLinkItem[];
}

export function SiteHeader({ links }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-[#f7f8f4]/90 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex min-w-0 items-center gap-3" aria-label="TranquilityHub home">
            <Image src="/tranquilityhub-mark.svg" alt="TranquilityHub logo" width={38} height={38} priority />
            <span className="truncate font-serif text-lg tracking-tight text-slate-800 sm:text-2xl">TranquilityHub</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 text-slate-700 transition hover:bg-emerald-50 md:hidden"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-site-menu"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
              {isMobileMenuOpen ? "Close" : "Menu"}
            </span>
          </button>

          <div className="hidden items-center gap-4 md:flex">
            <nav aria-label="Primary navigation" className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition ${
                      isActive ? "text-emerald-700" : "text-slate-600 hover:text-emerald-700"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <AuthControls />
          </div>
        </div>

      </div>

      <div
        className={`fixed inset-0 z-40 bg-slate-900/20 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isMobileMenuOpen}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div
        id="mobile-site-menu"
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(86vw,22rem)] flex-col border-l border-emerald-100 bg-[#f7f8f4] px-5 pb-6 pt-5 shadow-2xl transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex items-center justify-between gap-4 border-b border-emerald-100 pb-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">Navigate</p>
            <p className="truncate pt-1 font-serif text-xl text-slate-800">TranquilityHub</p>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-emerald-50"
            aria-label="Close navigation menu"
          >
            Close
          </button>
        </div>

        <nav aria-label="Mobile primary navigation" className="grid gap-2 py-5">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-emerald-100 pt-5">
          <AuthControls />
        </div>
      </div>
    </header>
  );
}