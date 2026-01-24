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
    <footer className="grid gap-5 rounded-3xl bg-slate-800 p-8 text-slate-100">
      <div className="inline-flex items-center gap-3">
        <Image src="/tranquilityhub-mark.svg" alt="TranquilityHub logo" width={34} height={34} />
        <p className="font-serif text-lg tracking-tight text-white">TranquilityHub</p>
      </div>
      <nav aria-label="Quick links" className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto">
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
    </footer>
  );
}
