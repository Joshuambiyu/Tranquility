"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isClient = useSyncExternalStore(subscribeToClientRender, () => true, () => false);
  const searchQuery = searchParams.get("q") ?? "";

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
            <Image src="/tranquilityhub-mark.svg" alt="TranquilityHub logo" width={52} height={52} priority />
            <span className="truncate font-serif text-2xl tracking-tight text-[var(--text-strong)] sm:text-3xl">TranquilityHub</span>
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

          <div className="hidden w-fit items-end gap-2 md:flex md:flex-col md:items-stretch">
            <div className="flex items-center gap-4">
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

              <Link
                href="/search"
                aria-label="Open search"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-muted)] text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] lg:hidden"
              >
                <span className="relative block h-4 w-4" aria-hidden="true">
                  <span className="absolute left-0 top-0 h-3 w-3 rounded-full border-2 border-current" />
                  <span className="absolute bottom-0 right-0 h-2 w-0.5 rotate-[-45deg] rounded-full bg-current" />
                </span>
              </Link>
              <AuthControls variant="desktop" />
            </div>

            <form action="/search" method="get" className="hidden w-full lg:flex">
              <label className="sr-only" htmlFor="desktop-site-search">Search site content</label>
              <div className="flex w-full items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true">
                    <span className="relative block h-4 w-4">
                      <span className="absolute left-0 top-0 h-3 w-3 rounded-full border-2 border-current" />
                      <span className="absolute bottom-0 right-0 h-2 w-0.5 rotate-[-45deg] rounded-full bg-current" />
                    </span>
                  </span>
                  <input
                    id="desktop-site-search"
                    name="q"
                    type="search"
                    defaultValue={searchQuery}
                    placeholder="Search articles and voices"
                    className="w-full min-w-0 rounded-full border border-[var(--border-muted)] bg-[var(--surface)] py-2 pl-10 pr-4 text-sm text-[var(--text-strong)] outline-none ring-emerald-400 transition focus:ring"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full border border-[var(--border-muted)] px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-[var(--surface-muted)]"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      {isClient
        ? createPortal(
            <AnimatePresence initial={false}>
              {isMobileMenuOpen ? (
                <>
                  <motion.div
                    key="mobile-menu-backdrop"
                    className="fixed inset-0 z-[70] bg-slate-900/30 md:hidden"
                    aria-hidden="true"
                    onClick={() => setIsMobileMenuOpen(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />

                  <motion.div
                    key="mobile-menu-drawer"
                    id="mobile-site-menu"
                    className="fixed inset-y-0 right-0 z-[80] flex h-dvh w-[min(88vw,22rem)] flex-col bg-[var(--surface)] px-5 pb-6 pt-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)] md:hidden"
                    aria-hidden="false"
                    initial={{ x: "100%", opacity: 0.98 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0.98 }}
                    transition={{
                      x: { type: "spring", stiffness: 320, damping: 34, mass: 0.6 },
                      opacity: { duration: 0.2, ease: "easeOut" },
                    }}
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

                    <form action="/search" method="get" onSubmit={closeMobileMenu} className="border-b border-[var(--border-muted)] py-4">
                      <label className="sr-only" htmlFor="mobile-site-search">Search site content</label>
                      <div className="flex items-center gap-2">
                        <div className="relative min-w-0 flex-1">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true">
                            <span className="relative block h-4 w-4">
                              <span className="absolute left-0 top-0 h-3 w-3 rounded-full border-2 border-current" />
                              <span className="absolute bottom-0 right-0 h-2 w-0.5 rotate-[-45deg] rounded-full bg-current" />
                            </span>
                          </span>
                          <input
                            id="mobile-site-search"
                            name="q"
                            type="search"
                            defaultValue={searchQuery}
                            placeholder="Search articles and voices"
                            className="min-w-0 w-full rounded-full border border-[var(--border-muted)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-strong)] outline-none ring-emerald-400 transition focus:ring"
                          />
                        </div>
                        <button
                          type="submit"
                          className="rounded-full border border-[var(--border-muted)] px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-[var(--surface-muted)]"
                        >
                          Go
                        </button>
                      </div>
                    </form>

                    <motion.nav
                      aria-label="Mobile primary navigation"
                      className="mt-5 grid gap-2 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-[var(--surface-muted)] to-[var(--surface)] p-2"
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={{
                        open: {
                          transition: {
                            staggerChildren: prefersReducedMotion ? 0 : 0.06,
                            delayChildren: prefersReducedMotion ? 0 : 0.06,
                          },
                        },
                        closed: {
                          transition: {
                            staggerChildren: prefersReducedMotion ? 0 : 0.04,
                            staggerDirection: -1,
                          },
                        },
                      }}
                    >
                      {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                          <motion.div
                            key={link.href}
                            variants={{
                              open: { opacity: 1, x: 0 },
                              closed: { opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : 12 },
                            }}
                            transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
                          >
                            <Link
                              href={link.href}
                              onClick={closeMobileMenu}
                              className={`rounded-xl px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] transition ${
                                isActive
                                  ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"
                                  : "bg-white/70 text-[var(--text-muted)] hover:bg-emerald-50 hover:text-emerald-700"
                              }`}
                            >
                              {link.label}
                            </Link>
                          </motion.div>
                        );
                      })}
                    </motion.nav>

                    <div className="mt-auto border-t border-[var(--border-muted)] pt-5">
                      <AuthControls variant="mobile" />
                    </div>
                  </motion.div>
                </>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </header>
  );
}