"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLinkItem } from "@/types";

interface SiteHeaderProps {
  links: NavLinkItem[];
}

export function SiteHeader({ links }: SiteHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-[#f7f8f4]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="TranquilityHub home">
          <Image src="/tranquilityhub-mark.svg" alt="TranquilityHub logo" width={38} height={38} priority />
          <span className="font-serif text-xl tracking-tight text-slate-800 sm:text-2xl">TranquilityHub</span>
        </Link>

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
      </div>
    </header>
  );
}