"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLinkItem } from "@/types";

interface FooterSectionProps {
  links: NavLinkItem[];
}

export function FooterSection({ links }: FooterSectionProps) {
  const pathname = usePathname();

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-100">
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-10 sm:px-8 lg:px-10">
        <div className="inline-flex items-center gap-3">
          <Image src="/tranquilityhub-mark.svg" alt="TranquilityHub logo" width={34} height={34} />
          <p className="font-serif text-lg tracking-tight text-white">TranquilityHub</p>
        </div>
        <nav aria-label="Quick links" className="flex flex-wrap gap-x-5 gap-y-3">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition ${
                  isActive ? "text-cyan-200" : "text-slate-300 hover:text-cyan-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <p className="text-xs text-slate-300">
          © 2026 TranquilityHub | Designed to inspire reflection and mindful growth
        </p>
      </div>
    </footer>
  );
}
