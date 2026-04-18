import Link from "next/link";

/**
 * Shown when an authenticated user does not have the admin role.
 * Used across all admin pages in place of the raw inline "Access denied" block.
 */
export default function AdminAccessDenied() {
  return (
    <main className="mx-auto grid min-h-[80vh] w-full max-w-lg place-items-center px-5 py-16 sm:px-8">
      <section className="grid w-full gap-8 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-rose-100">

        {/* Illustration band */}
        <div className="relative flex h-44 items-center justify-center bg-gradient-to-br from-rose-50 via-rose-100 to-orange-50">
          {/* Large lock icon, purely decorative SVG — no image file needed */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            aria-hidden="true"
            className="h-24 w-24 drop-shadow-sm"
            fill="none"
          >
            {/* Shackle */}
            <rect
              x="18"
              y="28"
              width="28"
              height="24"
              rx="5"
              className="fill-rose-700/10 stroke-rose-400"
              strokeWidth="2"
            />
            {/* Body */}
            <rect
              x="18"
              y="28"
              width="28"
              height="24"
              rx="5"
              fill="white"
              className="stroke-rose-300"
              strokeWidth="1.5"
            />
            {/* Arc */}
            <path
              d="M22 28v-7a10 10 0 0 1 20 0v7"
              className="stroke-rose-500"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Keyhole circle */}
            <circle cx="32" cy="40" r="4" className="fill-rose-400" />
            {/* Keyhole stem */}
            <rect x="30.5" y="42" width="3" height="5" rx="1.5" className="fill-rose-400" />
          </svg>

          {/* Subtle "restricted" badge */}
          <span className="absolute right-4 top-4 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-rose-600">
            Restricted
          </span>
        </div>

        {/* Copy */}
        <div className="grid gap-4 px-8 pb-8">
          <div className="grid gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Access denied
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Your account is signed in but does not have the admin role required
              to view this area. If you believe this is a mistake, contact the
              site administrator.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/"
              className="inline-grid place-items-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Go to homepage
            </Link>
          </div>
        </div>

      </section>
    </main>
  );
}
