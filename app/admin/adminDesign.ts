type AdminButtonTone = "primary" | "secondary" | "danger" | "warning";
type AdminButtonSize = "default" | "compact";

const ADMIN_BUTTON_BASE =
  "inline-grid min-h-11 place-items-center rounded-xl border text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const ADMIN_BUTTON_TONE_STYLES: Record<AdminButtonTone, string> = {
  primary:
    "border-emerald-700 bg-emerald-700 text-white hover:border-emerald-800 hover:bg-emerald-800 focus-visible:outline-emerald-700",
  secondary:
    "border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus-visible:outline-slate-400",
  danger:
    "border-rose-300 bg-white text-rose-700 hover:bg-rose-50 focus-visible:outline-rose-400",
  warning:
    "border-amber-200 bg-white text-amber-700 hover:bg-amber-50 focus-visible:outline-amber-300",
};

const ADMIN_BUTTON_SIZE_STYLES: Record<AdminButtonSize, string> = {
  default: "px-5 py-2.5",
  compact: "min-h-9 px-3.5 py-2 text-xs uppercase tracking-[0.12em]",
};

type AdminButtonClassOptions = {
  tone?: AdminButtonTone;
  size?: AdminButtonSize;
  fullWidth?: boolean;
  className?: string;
};

export function adminButtonClass({
  tone = "secondary",
  size = "default",
  fullWidth = true,
  className = "",
}: AdminButtonClassOptions = {}) {
  return [
    ADMIN_BUTTON_BASE,
    ADMIN_BUTTON_TONE_STYLES[tone],
    ADMIN_BUTTON_SIZE_STYLES[size],
    fullWidth ? "w-full sm:w-fit" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export const ADMIN_PANEL_CLASS = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200";
export const ADMIN_HERO_PANEL_CLASS = "grid gap-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-emerald-100";
export const ADMIN_CARD_CLASS = "grid gap-3 rounded-xl border border-slate-200 px-4 py-3";