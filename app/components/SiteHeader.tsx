"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { AuthControls } from "@/app/components/AuthControls";
import type { NavLinkItem } from "@/types";

interface SiteHeaderProps {
  links: NavLinkItem[];
}

function subscribeToClientRender() {
  return () => {};
}

export function SiteHeader({ links }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isClient = useSyncExternalStore(subscribeToClientRender, () => true, () => false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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
    <header className="sticky top-0 z-50 border-b border-[var(--border-muted)] bg-[var(--header-bg)] backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="inline-flex min-w-0 items-center gap-3"
            aria-label="TranquilityHub home"
          >
            <Image src="/tranquilityhub-mark.svg" alt="TranquilityHub logo" width={38} height={38} priority />
            <span className="truncate font-serif text-lg tracking-tight text-[var(--text-strong)] sm:text-2xl">TranquilityHub</span>
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-muted)] text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)]"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-site-menu"
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              <span className="flex w-4 flex-col gap-1" aria-hidden="true">
                <span className="h-0.5 w-full rounded-full bg-current" />
                <span className="h-0.5 w-full rounded-full bg-current" />
                <span className="h-0.5 w-full rounded-full bg-current" />
              </span>
            </button>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <nav aria-label="Primary navigation" className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`text-sm font-medium transition ${
                      isActive ? "text-emerald-700" : "text-[var(--text-muted)] hover:text-emerald-700"
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

      {isClient
        ? createPortal(
            <>
              <div
                className={`fixed inset-0 z-[70] bg-slate-900/30 transition-opacity duration-300 md:hidden ${
                  isMobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
                }`}
                aria-hidden={!isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <div
                id="mobile-site-menu"
                className={`fixed inset-y-0 right-0 z-[80] flex h-dvh w-[min(88vw,22rem)] flex-col bg-[var(--surface)] px-5 pb-6 pt-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)] transition-transform duration-300 md:hidden ${
                  isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
                }`}
                aria-hidden={!isMobileMenuOpen}
              >
                <div className="flex items-center justify-between gap-4 border-b border-[var(--border-muted)] pb-4">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">Navigate</p>
                    <p className="truncate pt-1 font-serif text-xl text-[var(--text-strong)]">TranquilityHub</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-muted)] text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)]"
                    aria-label="Close navigation menu"
                  >
                    <span className="relative block h-4 w-4" aria-hidden="true">
                      <span className="absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
                      <span className="absolute left-1/2 top-1/2 block h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
                    </span>
                  </button>
                </div>

                <nav aria-label="Mobile primary navigation" className="grid gap-2 py-5">
                  {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMobileMenu}
                        className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-[var(--text-muted)] hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-auto border-t border-[var(--border-muted)] pt-5">
                  <AuthControls />
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </header>
  );
}