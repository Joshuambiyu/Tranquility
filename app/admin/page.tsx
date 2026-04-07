import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/admin";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (!isAdminEmail(session.user.email)) {
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

  const [pendingVoices, totalContacts, resourceStats] = await Promise.all([
    prisma.voiceSubmission.count({ where: { status: "pending" } }),
    prisma.contactSubmission.count(),
    prisma.resourceOfMonth.aggregate({
      _count: { _all: true },
      where: {
        OR: [{ status: "published" }, { isCurrent: true }],
      },
    }),
  ]);

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
            className="inline-grid w-fit place-items-center rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
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
            className="inline-grid w-fit place-items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
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
          <Link
            href="/admin/articles"
            className="inline-grid w-fit place-items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Open Articles Admin
          </Link>
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
            className="inline-grid w-fit place-items-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Open Resources Admin
          </Link>
        </article>
      </section>
    </main>
  );
}
