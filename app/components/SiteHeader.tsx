"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { usePathname, useSearchParams } from "next/navigation";
import { AuthControls } from "@/app/components/AuthControls";
import { authClient, useSession } from "@/lib/auth-client";
import type { NavLinkItem } from "@/types";

// ── Icon helpers ────────────────────────────────────────────────────────────
function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`h-[18px] w-[18px] shrink-0 ${className}`}
    >
      <path d={d} />
    </svg>
  );
}

const NAV_ICONS: Record<string, string> = {
  "/":          "M3 9.75L12 3l9 6.75V21a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.75z M9 22V12h6v10",
  "/blog":      "M4 4h16v16H4z M8 9h8M8 13h6",
  "/journals":  "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z M8 7h8M8 11h5",
  "/voices":    "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  "/resources": "M12 2l9 4.5-9 4.5-9-4.5L12 2z M3 12l9 4.5 9-4.5 M3 17l9 4.5 9-4.5",
  "/about":     "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8h.01M12 12v4",
  "/contact":   "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  "/privacy":   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

interface SiteHeaderProps {
  links: NavLinkItem[];
}

function getInitials(nameOrEmail: string) {
  const parts = nameOrEmail.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return nameOrEmail.slice(0, 2).toUpperCase();
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
  const { data: session, status } = useSession();

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
                    className="fixed inset-y-0 right-0 z-[80] flex h-dvh w-[min(88vw,22rem)] flex-col overflow-hidden rounded-l-3xl border border-r-0 border-[var(--border-muted)] bg-[var(--surface)] shadow-[0_24px_80px_rgba(15,23,42,0.22)] md:hidden"
                    aria-hidden="false"
                    initial={{ x: "100%", opacity: 0.98 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0.98 }}
                    transition={{
                      x: { type: "spring", stiffness: 320, damping: 34, mass: 0.6 },
                      opacity: { duration: 0.2, ease: "easeOut" },
                    }}
                  >
                    {/* ── Profile header ──────────────────────────────── */}
                    <div className="flex items-start gap-3 border-b border-[var(--border-muted)] bg-[var(--surface-muted)] px-5 pb-4 pt-4">

                      {/* Avatar */}
                      <div className="relative mt-0.5 shrink-0">
                        {status === "authenticated" && session?.user?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={session.user.image}
                            alt={session.user.name ?? "Profile"}
                            width={52}
                            height={52}
                            className="h-[52px] w-[52px] rounded-full border border-[var(--border-muted)] object-cover"
                          />
                        ) : (
                          <span className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[var(--border-muted)] bg-[var(--surface)] text-base font-bold text-[var(--text-strong)]">
                            {status === "authenticated" && session?.user
                              ? getInitials(session.user.name ?? session.user.email ?? "U")
                              : "T"}
                          </span>
                        )}
                      </div>

                      {/* Identity text */}
                      <div className="min-w-0 flex-1 pt-0.5">
                        {status === "authenticated" && session?.user ? (
                          <>
                            <p className="truncate text-sm font-semibold text-[var(--text-strong)]">
                              {session.user.name ?? "Account"}
                            </p>
                            <p className="truncate text-[12px] text-[var(--text-muted)]">
                              {session.user.email ?? "Signed in"}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-serif text-base text-[var(--text-strong)]">TranquilityHub</p>
                            <p className="text-[12px] text-[var(--text-muted)]">Find your calm</p>
                          </>
                        )}
                      </div>

                      {/* Close button */}
                      <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface)] hover:text-[var(--text-strong)]"
                        aria-label="Close navigation menu"
                      >
                        <span className="relative block h-3.5 w-3.5" aria-hidden="true">
                          <span className="absolute left-1/2 top-1/2 block h-0.5 w-full -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-current" />
                          <span className="absolute left-1/2 top-1/2 block h-0.5 w-full -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
                        </span>
                      </button>
                    </div>

                    {/* ── Scrollable body ──────────────────────────────── */}
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 pt-3">
                      {/* Search */}
                      <form action="/search" method="get" onSubmit={closeMobileMenu} className="mb-4">
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
                              className="min-w-0 w-full rounded-full border border-[var(--border-muted)] bg-[var(--surface-muted)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-strong)] outline-none ring-emerald-400 transition focus:ring focus:bg-[var(--surface)]"
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

                      {/* Nav section label */}
                      <p className="mb-2 pl-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                        Navigation
                      </p>

                      {/* Nav link rows */}
                      <motion.nav
                        aria-label="Mobile primary navigation"
                        className="grid gap-0.5"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={{
                          open: {
                            transition: {
                              staggerChildren: prefersReducedMotion ? 0 : 0.055,
                              delayChildren: prefersReducedMotion ? 0 : 0.04,
                            },
                          },
                          closed: {
                            transition: {
                              staggerChildren: prefersReducedMotion ? 0 : 0.03,
                              staggerDirection: -1,
                            },
                          },
                        }}
                      >
                        {links.map((link) => {
                          const isActive = pathname === link.href;
                          const iconPath = NAV_ICONS[link.href];
                          return (
                            <motion.div
                              key={link.href}
                              variants={{
                                open: { opacity: 1, x: 0 },
                                closed: { opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : 10 },
                              }}
                              transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: "easeOut" }}
                            >
                              <Link
                                href={link.href}
                                onClick={closeMobileMenu}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                                  isActive
                                    ? "bg-emerald-50 font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200"
                                    : "font-medium text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-strong)]"
                                }`}
                              >
                                {iconPath ? (
                                  <Icon
                                    d={iconPath}
                                    className={isActive ? "text-emerald-700" : "text-[var(--text-muted)]"}
                                  />
                                ) : (
                                  <span className="h-[18px] w-[18px] shrink-0" />
                                )}
                                <span>{link.label}</span>
                                {isActive && (
                                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                                )}
                              </Link>
                            </motion.div>
                          );
                        })}
                      </motion.nav>
                    </div>

                    {/* ── Auth footer ──────────────────────────────────── */}
                    <div className="shrink-0 border-t border-[var(--border-muted)] px-4 py-4">
                      {status === "authenticated" ? (
                        <button
                          type="button"
                          onClick={async () => {
                            await authClient.signOut();
                            window.location.href = "/";
                          }}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-muted)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-semibold text-[var(--text-muted)] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                        >
                          <Icon d="M17 16l4-4-4-4M21 12H9M13 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8" />
                          Sign out
                        </button>
                      ) : (
                        <AuthControls variant="mobile" />
                      )}
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