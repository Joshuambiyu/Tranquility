import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getAdminEmails,
  hasAdminAccess,
  listManagedAdminEmails,
} from "@/lib/admin";
import {
  addAdminEmailAction,
  removeAdminEmailAction,
} from "@/app/admin/admin-access/actions";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ResourceOfMonthAggregateModel = {
  aggregate: (args: {
    _count: { _all: true };
    where: { OR: Array<{ status: string } | { isCurrent: boolean }> };
  }) => Promise<{ _count: { _all: number } }>;
};

function getResourceOfMonthAggregateModel() {
  return (prisma as unknown as { resourceOfMonth: ResourceOfMonthAggregateModel }).resourceOfMonth;
}

export default async function AdminHomePage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (!(await hasAdminAccess(session.user.email))) {
    return (
      <main className="mx-auto grid min-h-[70vh] w-full max-w-4xl place-items-center px-5 py-10 sm:px-8 lg:px-10">
        <section className="grid w-full gap-4 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-rose-100">
          <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
          <p className="text-slate-700">
            Your account is signed in, but it is not allowed to access admin tools.
          </p>
        </section>
      </main>
    );
  }

  const [pendingVoices, totalContacts, resourceStats, managedAdmins] = await Promise.all([
    prisma.voiceSubmission.count({ where: { status: "pending" } }),
    prisma.contactSubmission.count(),
    getResourceOfMonthAggregateModel().aggregate({
      _count: { _all: true },
      where: {
        OR: [{ status: "published" }, { isCurrent: true }],
      },
    }),
    listManagedAdminEmails(),
  ]);
  const staticAdmins = Array.from(getAdminEmails()).sort();

  return (
    <main className="mx-auto grid min-h-[70vh] w-full max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:px-10">
      <section className="grid gap-2 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-600">
          Manage moderation and submissions from one place.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="grid gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Community Voices</h2>
          <p className="text-sm text-slate-600">
            Pending submissions: <span className="font-semibold text-slate-900">{pendingVoices}</span>
          </p>
          <p className="text-sm text-slate-700">
            Approve, reject, and set Voice of the Week.
          </p>
          <Link
            href="/admin/voices"
            className="inline-grid w-full place-items-center rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-fit"
          >
            Open Voices Admin
          </Link>
        </article>

        <article className="grid gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Contact Submissions</h2>
          <p className="text-sm text-slate-600">
            Total submissions: <span className="font-semibold text-slate-900">{totalContacts}</span>
          </p>
          <p className="text-sm text-slate-700">
            Review the latest messages from the contact page.
          </p>
          <Link
            href="/admin/contact-submissions"
            className="inline-grid w-full place-items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-fit"
          >
            Open Contact Admin
          </Link>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="grid gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Editorial Articles</h2>
          <p className="text-sm text-slate-700">
            Publish and feature blog articles directly from the admin panel.
          </p>
          <div className="grid gap-2 sm:flex sm:flex-wrap">
            <Link
              href="/admin/articles"
              className="inline-grid w-full place-items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-fit"
            >
              Open Articles Admin
            </Link>
            <Link
              href="/admin/articles/delete"
              className="inline-grid w-full place-items-center rounded-full border border-rose-300 px-5 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 sm:w-fit"
            >
              Delete Articles
            </Link>
          </div>
        </article>

        <article className="grid gap-3 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Resource of the Month</h2>
          <p className="text-sm text-slate-600">
            Managed resources: <span className="font-semibold text-slate-900">{resourceStats._count._all}</span>
          </p>
          <p className="text-sm text-slate-700">
            Create monthly resources, publish them, and select the current featured resource.
          </p>
          <Link
            href="/admin/resources"
            className="inline-grid w-full place-items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-fit"
          >
            Open Resources Admin
          </Link>
        </article>
      </section>

      <section className="grid gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">Admin Access</h2>
        <p className="text-sm text-slate-700">
          Add or remove admin emails without changing environment variables. Emails in ADMIN_EMAILS or CONTACT_NOTIFY_TO are bootstrap admins and always retain access.
        </p>

        <form action={addAdminEmailAction} className="grid gap-3 sm:max-w-xl sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Admin email
            <input
              type="email"
              name="email"
              required
              placeholder="name@example.com"
              className="rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none ring-emerald-400 transition focus:ring"
            />
          </label>
          <button
            type="submit"
            className="inline-grid h-11 w-full place-items-center rounded-full bg-emerald-700 px-6 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:w-fit"
          >
            Add Admin
          </button>
        </form>

        <div className="grid gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-600">Managed admin emails</h3>
          {managedAdmins.length === 0 ? (
            <p className="text-sm text-slate-600">No managed admins yet.</p>
          ) : (
            <div className="grid gap-2">
              {managedAdmins.map((admin) => (
                <article key={admin.email} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <div className="grid gap-1">
                    <p className="text-sm font-medium text-slate-900">{admin.email}</p>
                    <p className="text-xs text-slate-500">Added {new Date(admin.createdAt).toLocaleString()}</p>
                  </div>
                  <form action={removeAdminEmailAction}>
                    <input type="hidden" name="email" value={admin.email} />
                    <button
                      type="submit"
                      className="rounded-full border border-rose-300 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      Remove
                    </button>
                  </form>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-2 rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-amber-800">Bootstrap admins from env</h3>
          {staticAdmins.length === 0 ? (
            <p className="text-sm text-amber-900">No env admins configured.</p>
          ) : (
            <ul className="grid gap-1 text-sm text-amber-900">
              {staticAdmins.map((email) => (
                <li key={email}>{email}</li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
