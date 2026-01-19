"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLinkItem } from "@/types";

interface FooterSectionProps {
  links: NavLinkItem[];
}

export function FooterSection({ links }: FooterSectionProps) {
  const pathname = usePathname();

  return (
    <footer className="grid gap-5 rounded-3xl bg-slate-900 p-8 text-slate-200">
      <nav aria-label="Quick links" className="grid grid-flow-col auto-cols-max gap-4 overflow-x-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition ${
                isActive ? "text-sky-300" : "text-slate-400 hover:text-sky-300"
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
